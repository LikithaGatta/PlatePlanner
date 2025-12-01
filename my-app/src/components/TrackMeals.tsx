import { ArrowLeft, Plus, Home, Calendar, BookOpen, User, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { useState, useEffect } from 'react';
import { useApp, DailyMealLog, LoggedMeal } from '../context/AppContext';
import { toast } from 'sonner';
import axios from "axios";

// === API ENDPOINTS ===
const MEAL_API = "http://localhost:5050/api/meals";
const CAL_API  = "http://localhost:5050/api/calories";

interface TrackMealsProps {
  onNavigate: (screen: any) => void;
}

// Generate the last 7 days dynamically
function generateWeek() {
  const today = new Date();

  // Force the week to start on Sunday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);

    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateNumber = d.getDate();
    const fullDate = d.toISOString().split("T")[0];

    days.push({ dayName, dateNumber, fullDate });
  }

  return days;
}

export function TrackMeals({ onNavigate }: TrackMealsProps) {
  const { user, saveDailyMealLog } = useApp();

  // --- Calendar State ---
  const weekDays = generateWeek();

  // Find today's entry in the generated week
  const todayISO = new Date().toISOString().split("T")[0];
  const todayIndex = weekDays.findIndex((d) => d.fullDate === todayISO);

  // If today isn't in this week for some reason, fallback to last day
  const [selectedDate, setSelectedDate] = useState(
    todayIndex !== -1 ? weekDays[todayIndex] : weekDays[6]
  );

  const getDateString = () => selectedDate.fullDate;

  // --- Today's meals (local + DB) ---
  const [todayMeals, setTodayMeals] = useState<DailyMealLog>({
    date: getDateString(),
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  // Calorie result from backend
  const [dayCalories, setDayCalories] = useState<number | null>(null);

  // Input states
  const [breakfastInput, setBreakfastInput] = useState({ name: '', calories: '' });
  const [lunchInput, setLunchInput] = useState({ name: '', calories: '' });
  const [dinnerInput, setDinnerInput] = useState({ name: '', calories: '' });
  const [snacksInput, setSnacksInput] = useState({ name: '', calories: '' });

  // Show/hide inputs
  const [showBreakfastInput, setShowBreakfastInput] = useState(false);
  const [showLunchInput, setShowLunchInput] = useState(false);
  const [showDinnerInput, setShowDinnerInput] = useState(false);
  const [showSnacksInput, setShowSnacksInput] = useState(false);

  // === FETCH MEALS FOR THE DAY ===
  const fetchMealsForUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get<DailyMealLog[]>(MEAL_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const todayData = res.data.find((log) => log.date === getDateString());

      // ⭐ Correct: Save only today's log to the global context
      if (todayData) {
        saveDailyMealLog(todayData);
      }

      setTodayMeals(
        todayData || {
          date: getDateString(),
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        }
      );
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchMealsForUser();
    setDayCalories(null); // reset calories when date changes
  }, [selectedDate, user]);

  // === ADD MEAL LOCALLY ===
  const addMeal = (mealType: keyof DailyMealLog) => {
    let inputState;
    let setInputState;

    if (mealType === "breakfast") { inputState = breakfastInput; setInputState = setBreakfastInput; }
    else if (mealType === "lunch") { inputState = lunchInput; setInputState = setLunchInput; }
    else if (mealType === "dinner") { inputState = dinnerInput; setInputState = setDinnerInput; }
    else { inputState = snacksInput; setInputState = setSnacksInput; }

    if (!inputState.name.trim()) {
      toast.error("Please enter a meal name");
      return;
    }

    const calories = inputState.calories ? parseInt(inputState.calories) : 0;

    const newMeal: LoggedMeal = { name: inputState.name, calories };

    setTodayMeals(prev => ({
      ...prev,
      [mealType]: [...(prev[mealType] as LoggedMeal[]), newMeal]
    }));

    setInputState({ name: "", calories: "" });
    toast.success(`Added to ${mealType}`);
  };

  // === REMOVE MEAL ===
  const removeMeal = (mealType: keyof DailyMealLog, index: number) => {
    setTodayMeals(prev => ({
      ...prev,
      [mealType]: (prev[mealType] as LoggedMeal[]).filter((_, i) => i !== index)
    }));
  };

  // === SAVE MEALS TO DB ===
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(MEAL_API, todayMeals, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      saveDailyMealLog(todayMeals);

      toast.success("Meals saved!");
    } catch (err) {
      toast.error("Save failed");
      console.error(err);
    }
  };

  // === FETCH CALORIES FROM BACKEND ===
  const fetchCaloriesForDay = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const date = getDateString();

      const res = await axios.get(`${CAL_API}/day?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDayCalories(res.data.total);

      alert(`Calories for ${date}: ${res.data.total}`);

    } catch (err) {
      alert("Error fetching calories");
      console.error(err);
    }
  };

  // === CALCULATE LOCAL UI TOTAL ===
  const localTotal = [
    ...todayMeals.breakfast,
    ...todayMeals.lunch,
    ...todayMeals.dinner,
    ...todayMeals.snacks
  ].reduce((sum, m) => sum + m.calories, 0);

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* HEADER */}
      <div className="bg-purple-600 p-6 text-white space-y-3">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Track Meals</h2>
            <p className="text-purple-200 text-sm">Weekly Overview</p>
          </div>

          {/* ⭐ NEW WEEKLY SUMMARY BUTTON */}
          <button
            onClick={() => onNavigate("weekly-summary")}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm hover:bg-white/30 transition-colors"
          >
            Summary
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-6">

        {/* CALENDAR */}
        <Card className="p-4 border-2 border-purple-100">
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">
            {weekDays.map((d) => (
              <div key={d.dateNumber}>{d.dayName}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className={`aspect-square flex items-center justify-center rounded-lg ${
                  selectedDate.dateNumber === d.dateNumber
                    ? "bg-purple-600 text-white shadow-md"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {d.dateNumber}
              </button>
            ))}
          </div>
        </Card>

        {/* LOCAL TOTAL DISPLAY */}
        <div className="flex items-center justify-between text-gray-700">
          <p>Today's Meals</p>
          <div>{localTotal} cal</div>
        </div>


        {/* --- MEAL CARDS --- */}
        {renderMealCard("Breakfast", "🍳", "breakfast", breakfastInput, setBreakfastInput, showBreakfastInput, setShowBreakfastInput, todayMeals, removeMeal, addMeal)}
        {renderMealCard("Lunch", "🥗", "lunch", lunchInput, setLunchInput, showLunchInput, setShowLunchInput, todayMeals, removeMeal, addMeal)}
        {renderMealCard("Dinner", "🍝", "dinner", dinnerInput, setDinnerInput, showDinnerInput, setShowDinnerInput, todayMeals, removeMeal, addMeal)}
        {renderMealCard("Snacks", "🍎", "snacks", snacksInput, setSnacksInput, showSnacksInput, setShowSnacksInput, todayMeals, removeMeal, addMeal)}

        <Button onClick={handleSave} className="w-full bg-purple-500 text-white h-12">
          Save Today's Meals
        </Button>

      </div>

      {/* NAVIGATION */}
      <div className="border-t p-4 flex justify-around text-gray-500">
        <button onClick={() => onNavigate("home")}><Home /></button>
        <button className="text-purple-600"><Calendar /></button>
        <button onClick={() => onNavigate("recipe")}><BookOpen /></button>
        <button onClick={() => onNavigate("profile")}><User /></button>
      </div>

    </div>
  );
}

/* Reusable meal card renderer */
function renderMealCard(
  title: string,
  emoji: string,
  mealType: keyof DailyMealLog,
  input: any,
  setInput: any,
  showInput: boolean,
  setShowInput: any,
  todayMeals: DailyMealLog,
  removeMeal: any,
  addMeal: any
) {
  return (
    <Card className="p-4 border-2 border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 items-center">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <span>{emoji}</span>
          </div>
          <span className="text-gray-700">{title}</span>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showInput && (
        <div className="space-y-2 bg-purple-50 p-3 rounded-lg">
          <Input
            placeholder="Meal name"
            value={input.name}
            onChange={(e) => setInput({ ...input, name: e.target.value })}
          />
          <Input
            placeholder="Calories"
            type="number"
            value={input.calories}
            onChange={(e) => setInput({ ...input, calories: e.target.value })}
          />
          <Button onClick={() => addMeal(mealType)} className="w-full bg-purple-600 text-white">
            Add
          </Button>
        </div>
      )}

      {(todayMeals[mealType] as LoggedMeal[]).length === 0 ? (
        <div className="text-center text-gray-400 bg-gray-50 p-3 rounded-lg">No meal added</div>
      ) : (
        <div className="space-y-2">
          {(todayMeals[mealType] as LoggedMeal[]).map((meal, idx) => (
            <div key={idx} className="bg-purple-50 p-3 rounded-lg flex justify-between">
              <div>
                <p>{meal.name}</p>
                <p className="text-purple-600 text-sm">{meal.calories} cal</p>
              </div>
              <button onClick={() => removeMeal(mealType, idx)} className="text-red-500">
                <X />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}