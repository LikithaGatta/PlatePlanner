import { ArrowLeft, Plus, Home, Calendar, BookOpen, User, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { useState, useEffect } from 'react';
import { useApp, DailyMealLog, LoggedMeal } from '../context/AppContext';
import { toast } from 'sonner';
import axios from "axios";

const API_URL = "http://localhost:5050/api/meals";

interface TrackMealsProps {
  onNavigate: (screen: any) => void;
}

export function TrackMeals({ onNavigate }: TrackMealsProps) {
  // ✅ use only user from context, not shared dailyMealLogs
  const { user } = useApp();

  const [selectedDay, setSelectedDay] = useState(16);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = [13, 14, 15, 16, 17, 18, 19];
  
  // Get current date string based on selected day
  const getCurrentDateString = () => {
    return `2024-10-${selectedDay}`;
  };

  // ✅ Local state for today's meals (backed by DB)
  const [todayMeals, setTodayMeals] = useState<DailyMealLog>({
    date: getCurrentDateString(),
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  // Input states for each meal type
  const [breakfastInput, setBreakfastInput] = useState({ name: '', calories: '' });
  const [lunchInput, setLunchInput] = useState({ name: '', calories: '' });
  const [dinnerInput, setDinnerInput] = useState({ name: '', calories: '' });
  const [snacksInput, setSnacksInput] = useState({ name: '', calories: '' });

  // Show/hide input fields
  const [showBreakfastInput, setShowBreakfastInput] = useState(false);
  const [showLunchInput, setShowLunchInput] = useState(false);
  const [showDinnerInput, setShowDinnerInput] = useState(false);
  const [showSnacksInput, setShowSnacksInput] = useState(false);

  // ✅ Fetch meals for logged-in user from backend (persisted per user)
  const fetchMealsForUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const res = await axios.get<DailyMealLog[]>(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dateStr = getCurrentDateString();
      const todayData = res.data.find((log: DailyMealLog) => log.date === dateStr);

      setTodayMeals(todayData || {
        date: dateStr,
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      });

    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  // ✅ Re-fetch when date or user changes
  useEffect(() => {
    fetchMealsForUser();
  }, [selectedDay, user]);

  // ✅ Date change just updates selectedDay; meals are pulled from DB in useEffect
  const handleDateChange = (date: number) => {
    setSelectedDay(date);
  };

  const addMeal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    let input: { name: string; calories: string };
    let setInput: React.Dispatch<React.SetStateAction<{ name: string; calories: string }>>;
    let setShowInput: React.Dispatch<React.SetStateAction<boolean>>;
    
    switch(mealType) {
      case 'breakfast':
        input = breakfastInput;
        setInput = setBreakfastInput;
        setShowInput = setShowBreakfastInput;
        break;
      case 'lunch':
        input = lunchInput;
        setInput = setLunchInput;
        setShowInput = setShowLunchInput;
        break;
      case 'dinner':
        input = dinnerInput;
        setInput = setDinnerInput;
        setShowInput = setShowDinnerInput;
        break;
      case 'snacks':
      default:
        input = snacksInput;
        setInput = setSnacksInput;
        setShowInput = setShowSnacksInput;
        break;
    }

    if (!input.name.trim()) {
      toast.error('Please enter a meal name');
      return;
    }

    const calories = input.calories ? parseInt(input.calories) : 0;
    
    const newMeal: LoggedMeal = {
      name: input.name,
      calories: calories
    };

    setTodayMeals(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], newMeal]
    }));

    setInput({ name: '', calories: '' });
    setShowInput(false);
    toast.success(`${input.name} added to ${mealType}`);
  };

  const removeMeal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', index: number) => {
    setTodayMeals(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
  };

  const calculateTotalCalories = () => {
    return [...todayMeals.breakfast, ...todayMeals.lunch, ...todayMeals.dinner, ...todayMeals.snacks]
      .reduce((sum, meal) => sum + meal.calories, 0);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Not logged in");
        return;
      }

      const res = await axios.post(API_URL, todayMeals, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Saved:", res.data);
      toast.success("Meals saved permanently");

    } catch (error) {
      console.error("SAVE FAILED:", error);
      toast.error("Save failed");
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white mb-2">Track Meals</h2>
            <p className="text-purple-100 text-sm">October 13-19, 2024</p>
          </div>
          <button 
            onClick={() => onNavigate('weekly-summary')}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm hover:bg-white/30 transition-colors"
          >
            Summary
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Calendar */}
        <Card className="p-4 border-2 border-purple-100">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {days.map((day, i) => (
              <div key={i} className="text-center text-xs text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date, i) => (
              <button
                key={i}
                onClick={() => handleDateChange(date)}
                className={`aspect-square flex items-center justify-center rounded-lg transition-all ${
                  selectedDay === date
                    ? 'bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-md'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </Card>

        {/* Today's Meals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-700">Today's Meals</p>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">{calculateTotalCalories()} cal</div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
          </div>

          {/* Breakfast */}
          <Card className="p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🍳</span>
                </div>
                <span className="text-gray-700">Breakfast</span>
              </div>
              <button 
                onClick={() => setShowBreakfastInput(!showBreakfastInput)}
                className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white hover:bg-purple-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {showBreakfastInput && (
              <div className="mb-3 space-y-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Input
                  placeholder="Meal name"
                  value={breakfastInput.name}
                  onChange={(e) => setBreakfastInput({ ...breakfastInput, name: e.target.value })}
                  className="h-10"
                />
                <Input
                  placeholder="Calories (optional)"
                  type="number"
                  value={breakfastInput.calories}
                  onChange={(e) => setBreakfastInput({ ...breakfastInput, calories: e.target.value })}
                  className="h-10"
                />
                <Button
                  onClick={() => addMeal('breakfast')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            )}

            {todayMeals.breakfast.length > 0 ? (
              <div className="space-y-2">
                {todayMeals.breakfast.map((meal, idx) => (
                  <div key={idx} className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-900">{meal.name}</p>
                      <p className="text-xs text-purple-600">{meal.calories} calories</p>
                    </div>
                    <button 
                      onClick={() => removeMeal('breakfast', idx)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-400 text-center">
                No meal added
              </div>
            )}
          </Card>

          {/* Lunch */}
          <Card className="p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🥗</span>
                </div>
                <span className="text-gray-700">Lunch</span>
              </div>
              <button 
                onClick={() => setShowLunchInput(!showLunchInput)}
                className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white hover:bg-purple-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showLunchInput && (
              <div className="mb-3 space-y-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Input
                  placeholder="Meal name"
                  value={lunchInput.name}
                  onChange={(e) => setLunchInput({ ...lunchInput, name: e.target.value })}
                  className="h-10"
                />
                <Input
                  placeholder="Calories (optional)"
                  type="number"
                  value={lunchInput.calories}
                  onChange={(e) => setLunchInput({ ...lunchInput, calories: e.target.value })}
                  className="h-10"
                />
                <Button
                  onClick={() => addMeal('lunch')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            )}

            {todayMeals.lunch.length > 0 ? (
              <div className="space-y-2">
                {todayMeals.lunch.map((meal, idx) => (
                  <div key={idx} className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-900">{meal.name}</p>
                      <p className="text-xs text-purple-600">{meal.calories} calories</p>
                    </div>
                    <button 
                      onClick={() => removeMeal('lunch', idx)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-400 text-center">
                No meal added
              </div>
            )}
          </Card>

          {/* Dinner */}
          <Card className="p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🍝</span>
                </div>
                <span className="text-gray-700">Dinner</span>
              </div>
              <button 
                onClick={() => setShowDinnerInput(!showDinnerInput)}
                className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white hover:bg-purple-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showDinnerInput && (
              <div className="mb-3 space-y-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Input
                  placeholder="Meal name"
                  value={dinnerInput.name}
                  onChange={(e) => setDinnerInput({ ...dinnerInput, name: e.target.value })}
                  className="h-10"
                />
                <Input
                  placeholder="Calories (optional)"
                  type="number"
                  value={dinnerInput.calories}
                  onChange={(e) => setDinnerInput({ ...dinnerInput, calories: e.target.value })}
                  className="h-10"
                />
                <Button
                  onClick={() => addMeal('dinner')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            )}

            {todayMeals.dinner.length > 0 ? (
              <div className="space-y-2">
                {todayMeals.dinner.map((meal, idx) => (
                  <div key={idx} className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-900">{meal.name}</p>
                      <p className="text-xs text-purple-600">{meal.calories} calories</p>
                    </div>
                    <button 
                      onClick={() => removeMeal('dinner', idx)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-400 text-center">
                No meal added
              </div>
            )}
          </Card>

          {/* Snacks */}
          <Card className="p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🍎</span>
                </div>
                <span className="text-gray-700">Snacks</span>
              </div>
              <button 
                onClick={() => setShowSnacksInput(!showSnacksInput)}
                className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white hover:bg-purple-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showSnacksInput && (
              <div className="mb-3 space-y-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Input
                  placeholder="Meal name"
                  value={snacksInput.name}
                  onChange={(e) => setSnacksInput({ ...snacksInput, name: e.target.value })}
                  className="h-10"
                />
                <Input
                  placeholder="Calories (optional)"
                  type="number"
                  value={snacksInput.calories}
                  onChange={(e) => setSnacksInput({ ...snacksInput, calories: e.target.value })}
                  className="h-10"
                />
                <Button
                  onClick={() => addMeal('snacks')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            )}

            {todayMeals.snacks.length > 0 ? (
              <div className="space-y-2">
                {todayMeals.snacks.map((meal, idx) => (
                  <div key={idx} className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-900">{meal.name}</p>
                      <p className="text-xs text-purple-600">{meal.calories} calories</p>
                    </div>
                    <button 
                      onClick={() => removeMeal('snacks', idx)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-400 text-center">
                No meal added
              </div>
            )}
          </Card>
        </div>

        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white h-12 rounded-xl shadow-md"
        >
          Save Today's Meals
        </Button>
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
            className="flex flex-col items-center gap-1 text-purple-600"
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
