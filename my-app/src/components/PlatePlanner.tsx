import { ArrowLeft, Plus, X, Calendar as CalendarIcon, Home, Calendar, BookOpen, User, Check, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = "http://localhost:5050/api/meal-plans";

interface PlatePlannerProps {
  onNavigate: (screen: any) => void;
}

export function PlatePlanner({ onNavigate }: PlatePlannerProps) {
  const { recipes, saveMealPlan, addActivity, user } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState({
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: ''
  });
  const [showRecipePicker, setShowRecipePicker] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks' | null>(null);
  const [customMealInput, setCustomMealInput] = useState('');

  // Fetch meal plan for selected date
  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_URL}/${selectedDate}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data && res.data.date) {
          setMeals({
            breakfast: res.data.breakfast || '',
            lunch: res.data.lunch || '',
            dinner: res.data.dinner || '',
            snacks: res.data.snacks || ''
          });
        } else {
          // Reset meals if no plan exists for this date
          setMeals({
            breakfast: '',
            lunch: '',
            dinner: '',
            snacks: ''
          });
        }
      } catch (err) {
        console.error("FETCH MEAL PLAN ERROR:", err);
      }
    };

    fetchMealPlan();
  }, [selectedDate]);

  const handleSavePlan = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Not logged in");
        return;
      }

      // Save to MongoDB
      await axios.post(API_URL, {
        date: selectedDate,
        breakfast: meals.breakfast,
        lunch: meals.lunch,
        dinner: meals.dinner,
        snacks: meals.snacks
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // Also save to local context
      const breakfastRecipe = meals.breakfast ? recipes.find(r => r.name === meals.breakfast) : undefined;
      const lunchRecipe = meals.lunch ? recipes.find(r => r.name === meals.lunch) : undefined;
      const dinnerRecipe = meals.dinner ? recipes.find(r => r.name === meals.dinner) : undefined;
      const snacksRecipe = meals.snacks ? recipes.find(r => r.name === meals.snacks) : undefined;

      saveMealPlan({
        date: selectedDate,
        breakfast: breakfastRecipe,
        lunch: lunchRecipe,
        dinner: dinnerRecipe,
        snacks: snacksRecipe ? [snacksRecipe] : undefined
      });
      
      toast.success('Meal plan saved successfully!', {
        description: `Your plan for ${new Date(selectedDate).toLocaleDateString()} has been saved.`
      });
      
      addActivity({
        type: 'meal-plan',
        description: `Meal plan saved for ${new Date(selectedDate).toLocaleDateString()}`
      });
    } catch (error) {
      console.error("SAVE MEAL PLAN ERROR:", error);
      toast.error("Failed to save meal plan");
    }
  };

  const selectRecipe = (recipeName: string) => {
    if (showRecipePicker) {
      setMeals({ ...meals, [showRecipePicker]: recipeName });
      setShowRecipePicker(null);
      setCustomMealInput('');
    }
  };

  const addCustomMeal = () => {
    if (showRecipePicker && customMealInput.trim()) {
      setMeals({ ...meals, [showRecipePicker]: customMealInput.trim() });
      setShowRecipePicker(null);
      setCustomMealInput('');
    }
  };

  // Filter recipes by category
  const getRecipesByCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'breakfast': 'Breakfast',
      'lunch': 'Lunch',
      'dinner': 'Dinner',
      'snacks': 'Snacks'
    };
    return recipes.filter(r => r.category === categoryMap[category]);
  };

  // Calculate planned calories
  const calculatePlannedCalories = () => {
    let total = 0;
    Object.values(meals).forEach(mealName => {
      const recipe = recipes.find(r => r.name === mealName);
      if (recipe) {
        total += recipe.calories;
      }
    });
    return total;
  };

  const plannedCalories = calculatePlannedCalories();
  const calorieGoal = user?.calorieGoal || 2000;
  const remainingCalories = calorieGoal - plannedCalories;

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 text-white">
        <button 
          onClick={() => onNavigate('home')}
          className="mb-4 flex items-center text-white/90 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>
        <h2 className="text-white mb-2">Plate Planner</h2>
        <p className="text-purple-100 text-sm">Plan your meals for the week</p>
        
        {/* Calorie Display */}
        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-purple-100">Planned Calories</span>
            <span className="text-white">{plannedCalories} / {calorieGoal}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${Math.min((plannedCalories / calorieGoal) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-purple-100 mt-2">
            {remainingCalories > 0 
              ? `${remainingCalories} calories remaining` 
              : `${Math.abs(remainingCalories)} calories over goal`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-purple-600" />
            Select Date
          </Label>
          <Input 
            id="startDate"
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-12 rounded-xl"
          />
        </div>

        {showRecipePicker ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-700">Choose a {showRecipePicker} recipe</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRecipePicker(null);
                  setCustomMealInput('');
                }}
              >
                Cancel
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getRecipesByCategory(showRecipePicker).map((recipe) => (
                <Card
                  key={recipe.id}
                  onClick={() => selectRecipe(recipe.name)}
                  className="p-4 border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">{recipe.name}</p>
                      <p className="text-xs text-gray-500">{recipe.calories} cal • {recipe.time}</p>
                    </div>
                    {meals[showRecipePicker] === recipe.name && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </Card>
              ))}
              
              {/* Option to add custom meal */}
              <Card className="p-4 border-2 border-dashed border-purple-300 bg-purple-50">
                <p className="text-sm text-purple-700 mb-3">Or type a custom meal name</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom meal name"
                    value={customMealInput}
                    onChange={(e) => setCustomMealInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addCustomMeal();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={addCustomMeal}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-700">Plan Your Meals</p>
              <button 
                onClick={() => onNavigate('recipe')}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Browse Recipes
              </button>
            </div>

            {/* Breakfast */}
            <Card className="p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🍳</span>
                  </div>
                  <Label className="text-gray-700">Breakfast</Label>
                </div>
                {meals.breakfast && (
                  <button onClick={() => setMeals({...meals, breakfast: ''})}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              {meals.breakfast ? (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-900">{meals.breakfast}</p>
                </div>
              ) : (
                <Button
                  onClick={() => setShowRecipePicker('breakfast')}
                  variant="outline"
                  className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Breakfast
                </Button>
              )}
            </Card>

            {/* Lunch */}
            <Card className="p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🥗</span>
                  </div>
                  <Label className="text-gray-700">Lunch</Label>
                </div>
                {meals.lunch && (
                  <button onClick={() => setMeals({...meals, lunch: ''})}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              {meals.lunch ? (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-900">{meals.lunch}</p>
                </div>
              ) : (
                <Button
                  onClick={() => setShowRecipePicker('lunch')}
                  variant="outline"
                  className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lunch
                </Button>
              )}
            </Card>

            {/* Dinner */}
            <Card className="p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🍝</span>
                  </div>
                  <Label className="text-gray-700">Dinner</Label>
                </div>
                {meals.dinner && (
                  <button onClick={() => setMeals({...meals, dinner: ''})}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              {meals.dinner ? (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-900">{meals.dinner}</p>
                </div>
              ) : (
                <Button
                  onClick={() => setShowRecipePicker('dinner')}
                  variant="outline"
                  className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Dinner
                </Button>
              )}
            </Card>

            {/* Snacks */}
            <Card className="p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🍎</span>
                  </div>
                  <Label className="text-gray-700">Snacks</Label>
                </div>
                {meals.snacks && (
                  <button onClick={() => setMeals({...meals, snacks: ''})}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              {meals.snacks ? (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-900">{meals.snacks}</p>
                </div>
              ) : (
                <Button
                  onClick={() => setShowRecipePicker('snacks')}
                  variant="outline"
                  className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Snacks
                </Button>
              )}
            </Card>

            <Button
              onClick={handleSavePlan}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white h-12 rounded-xl shadow-md"
            >
              Save Meal Plan
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex justify-around">
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('home')}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('track-meals')}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Track</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('recipe')}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Recipes</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('community')}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">Community</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('profile')}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
