import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  allergies: string[];
  dietaryRestrictions: string[];
  gender?: 'male' | 'female' | 'not-specified';
  height?: number;
  weight?: number;
  goalType?: 'lose' | 'gain' | 'maintain';
  calorieGoal?: number;
}

interface Recipe {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  image?: string;
  isFavorite?: boolean;
  rating?: number;
  cookTime?: number;
  time?: string;
  servings?: number;
  ingredients?: string[];
  instructions?: string[];
  dietaryTags?: string[];
  cuisine?: string;
}

interface MealPlan {
  id: number;
  date: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  snacks?: Recipe[];
}

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}

export interface LoggedMeal {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface DailyMealLog {
  date: string;
  breakfast: LoggedMeal[];
  lunch: LoggedMeal[];
  dinner: LoggedMeal[];
  snacks: LoggedMeal[];
}

interface AppContextType {
  isLoggedIn: boolean;
  user: User | null;
  recipes: Recipe[];
  mealPlans: MealPlan[];
  selectedRecipe: Recipe | null;
  recentActivity: Activity[];
  dailyMealLogs: DailyMealLog[];
  login: (username: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  toggleFavorite: (recipeId: number) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  rateRecipe: (recipeId: number, rating: number) => void;
  saveMealPlan: (mealPlan: Omit<MealPlan, 'id'>) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  addRecipe: (recipe: Recipe) => void;
  saveDailyMealLog: (log: DailyMealLog) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: 1,
      name: 'Avocado Toast with Poached Eggs',
      category: 'Breakfast',
      calories: 380,
      protein: 15,
      carbs: 32,
      fat: 22,
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
      isFavorite: false,
      cookTime: 15,
      time: '15 min',
      servings: 2,
      ingredients: ['2 slices whole grain bread', '1 ripe avocado', '2 eggs', 'Salt and pepper', 'Red pepper flakes', 'Lemon juice'],
      instructions: ['Toast the bread until golden', 'Mash avocado with lemon juice', 'Poach eggs in simmering water', 'Spread avocado on toast', 'Top with eggs and seasonings'],
      dietaryTags: ['Vegetarian', 'High-Protein'],
      cuisine: 'American'
    },
    {
      id: 2,
      name: 'Greek Yogurt Parfait',
      category: 'Breakfast',
      calories: 280,
      protein: 18,
      carbs: 38,
      fat: 6,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
      isFavorite: false,
      cookTime: 5,
      time: '5 min',
      servings: 1,
      ingredients: ['1 cup Greek yogurt', '1/2 cup granola', '1/2 cup mixed berries', '1 tbsp honey', 'Sliced almonds'],
      instructions: ['Layer yogurt in a glass', 'Add granola layer', 'Top with berries', 'Drizzle honey', 'Sprinkle almonds'],
      dietaryTags: ['Vegetarian', 'High-Protein'],
      cuisine: 'Mediterranean'
    },
    {
      id: 3,
      name: 'Protein Pancakes',
      category: 'Breakfast',
      calories: 420,
      protein: 32,
      carbs: 48,
      fat: 10,
      image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400',
      isFavorite: true,
      cookTime: 20,
      time: '20 min',
      servings: 2,
      ingredients: ['2 scoops protein powder', '2 eggs', '1 banana', '1/4 cup oats', '1 tsp baking powder', 'Berries for topping'],
      instructions: ['Blend all ingredients except berries', 'Heat griddle over medium heat', 'Pour batter to form pancakes', 'Cook until bubbles form, flip', 'Serve with berries'],
      dietaryTags: ['High-Protein'],
      cuisine: 'American'
    },
    {
      id: 4,
      name: 'Grilled Chicken Caesar Salad',
      category: 'Lunch',
      calories: 450,
      protein: 42,
      carbs: 18,
      fat: 24,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      isFavorite: true,
      cookTime: 25,
      time: '25 min',
      servings: 2,
      ingredients: ['2 chicken breasts', '4 cups romaine lettuce', '1/4 cup Caesar dressing', '1/4 cup parmesan', 'Croutons', 'Lemon wedges'],
      instructions: ['Season and grill chicken', 'Chop romaine lettuce', 'Slice cooked chicken', 'Toss lettuce with dressing', 'Top with chicken, parmesan, croutons'],
      dietaryTags: ['High-Protein'],
      cuisine: 'Italian'
    },
    {
      id: 5,
      name: 'Quinoa Buddha Bowl',
      category: 'Lunch',
      calories: 520,
      protein: 18,
      carbs: 68,
      fat: 18,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      isFavorite: false,
      cookTime: 30,
      time: '30 min',
      servings: 2,
      ingredients: ['1 cup quinoa', 'Chickpeas', 'Sweet potato cubes', 'Avocado', 'Mixed greens', 'Tahini dressing'],
      instructions: ['Cook quinoa according to package', 'Roast chickpeas and sweet potato', 'Arrange greens in bowl', 'Add quinoa and roasted items', 'Drizzle with tahini dressing'],
      dietaryTags: ['Vegan', 'Gluten-Free', 'High-Protein'],
      cuisine: 'Mediterranean'
    },
    {
      id: 6,
      name: 'Turkey & Avocado Wrap',
      category: 'Lunch',
      calories: 380,
      protein: 28,
      carbs: 32,
      fat: 16,
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
      isFavorite: false,
      cookTime: 10,
      time: '10 min',
      servings: 1,
      ingredients: ['Whole wheat tortilla', '4 oz sliced turkey', '1/2 avocado', 'Lettuce', 'Tomato', 'Mustard'],
      instructions: ['Lay tortilla flat', 'Layer turkey slices', 'Add sliced avocado', 'Add lettuce and tomato', 'Spread mustard and roll tightly'],
      dietaryTags: ['High-Protein'],
      cuisine: 'American'
    },
    {
      id: 7,
      name: 'Salmon with Roasted Vegetables',
      category: 'Dinner',
      calories: 520,
      protein: 38,
      carbs: 28,
      fat: 28,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      isFavorite: true,
      cookTime: 35,
      time: '35 min',
      servings: 2,
      ingredients: ['2 salmon fillets', 'Broccoli florets', 'Bell peppers', 'Zucchini', 'Olive oil', 'Lemon', 'Garlic'],
      instructions: ['Preheat oven to 400°F', 'Toss vegetables with olive oil', 'Season salmon with lemon and garlic', 'Roast vegetables 20 min', 'Add salmon and roast 15 min more'],
      dietaryTags: ['Gluten-Free', 'Dairy-Free', 'High-Protein', 'Paleo'],
      cuisine: 'Mediterranean'
    },
    {
      id: 8,
      name: 'Chicken Stir Fry',
      category: 'Dinner',
      calories: 480,
      protein: 36,
      carbs: 52,
      fat: 12,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      isFavorite: false,
      cookTime: 25,
      time: '25 min',
      servings: 3,
      ingredients: ['1 lb chicken breast', 'Mixed vegetables', '3 tbsp soy sauce', '2 cloves garlic', 'Ginger', 'Rice or noodles'],
      instructions: ['Cook rice/noodles', 'Cut chicken into cubes', 'Stir-fry chicken until golden', 'Add vegetables and sauce', 'Serve over rice/noodles'],
      dietaryTags: ['High-Protein', 'Dairy-Free'],
      cuisine: 'Asian'
    },
    {
      id: 9,
      name: 'Spaghetti Bolognese',
      category: 'Dinner',
      calories: 620,
      protein: 32,
      carbs: 72,
      fat: 20,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
      isFavorite: true,
      cookTime: 45,
      time: '45 min',
      servings: 4,
      ingredients: ['1 lb ground beef', '1 onion', '2 cloves garlic', 'Tomato sauce', 'Italian herbs', 'Spaghetti pasta', 'Parmesan cheese'],
      instructions: ['Cook spaghetti according to package', 'Brown ground beef with onion and garlic', 'Add tomato sauce and herbs', 'Simmer sauce 20 minutes', 'Serve over pasta with parmesan'],
      dietaryTags: ['High-Protein'],
      cuisine: 'Italian'
    },
    {
      id: 10,
      name: 'Veggie Tacos',
      category: 'Dinner',
      calories: 380,
      protein: 14,
      carbs: 52,
      fat: 14,
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
      isFavorite: false,
      cookTime: 20,
      time: '20 min',
      servings: 3,
      ingredients: ['Black beans', 'Corn tortillas', 'Bell peppers', 'Onion', 'Avocado', 'Salsa', 'Cilantro', 'Lime'],
      instructions: ['Sauté peppers and onions', 'Warm black beans', 'Heat tortillas', 'Assemble tacos with all ingredients', 'Top with salsa and cilantro'],
      dietaryTags: ['Vegetarian', 'Vegan', 'Dairy-Free'],
      cuisine: 'Mexican'
    },
    {
      id: 11,
      name: 'Protein Energy Balls',
      category: 'Snacks',
      calories: 180,
      protein: 8,
      carbs: 22,
      fat: 7,
      image: 'https://images.unsplash.com/photo-1587241321921-91a834d82ffc?w=400',
      isFavorite: true,
      cookTime: 10,
      time: '10 min',
      servings: 10,
      ingredients: ['1 cup oats', '1/2 cup peanut butter', '1/3 cup honey', '1/2 cup protein powder', 'Chocolate chips', 'Chia seeds'],
      instructions: ['Mix all ingredients in bowl', 'Refrigerate 30 minutes', 'Roll into balls', 'Store in fridge', 'Enjoy as needed'],
      dietaryTags: ['Vegetarian', 'High-Protein'],
      cuisine: 'American'
    },
    {
      id: 12,
      name: 'Hummus & Veggie Sticks',
      category: 'Snacks',
      calories: 150,
      protein: 6,
      carbs: 18,
      fat: 6,
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400',
      isFavorite: false,
      cookTime: 5,
      time: '5 min',
      servings: 2,
      ingredients: ['1 cup hummus', 'Carrot sticks', 'Celery sticks', 'Bell pepper strips', 'Cucumber slices'],
      instructions: ['Cut vegetables into sticks', 'Arrange on plate', 'Serve with hummus', 'Enjoy fresh'],
      dietaryTags: ['Vegan', 'Gluten-Free', 'Dairy-Free'],
      cuisine: 'Mediterranean'
    },
    {
      id: 13,
      name: 'Apple Slices with Almond Butter',
      category: 'Snacks',
      calories: 220,
      protein: 6,
      carbs: 28,
      fat: 10,
      image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
      isFavorite: true,
      cookTime: 3,
      time: '3 min',
      servings: 1,
      ingredients: ['1 large apple', '2 tbsp almond butter', 'Cinnamon', 'Optional: granola'],
      instructions: ['Slice apple into wedges', 'Spread almond butter on plate', 'Arrange apple slices', 'Sprinkle with cinnamon', 'Add granola if desired'],
      dietaryTags: ['Vegan', 'Gluten-Free'],
      cuisine: 'American'
    },
    {
      id: 14,
      name: 'Trail Mix',
      category: 'Snacks',
      calories: 280,
      protein: 8,
      carbs: 32,
      fat: 14,
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
      isFavorite: false,
      cookTime: 5,
      time: '5 min',
      servings: 4,
      ingredients: ['Almonds', 'Cashews', 'Dried cranberries', 'Dark chocolate chips', 'Pumpkin seeds', 'Coconut flakes'],
      instructions: ['Mix all ingredients in bowl', 'Store in airtight container', 'Portion into small bags', 'Enjoy on the go'],
      dietaryTags: ['Vegetarian', 'Gluten-Free'],
      cuisine: 'American'
    }
  ]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [dailyMealLogs, setDailyMealLogs] = useState<DailyMealLog[]>([]);

  const login = (username: string) => {
    setIsLoggedIn(true);
  };

  const logout = () => {
  setIsLoggedIn(false);
  setUser(null);
  setDailyMealLogs([]); // clears old meals
  localStorage.clear();
};


  const toggleFavorite = (recipeId: number) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === recipeId 
        ? { ...recipe, isFavorite: !recipe.isFavorite }
        : recipe
    ));
  };

  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'> & { timestamp?: string }) => {
    const newActivity: Activity = {
      ...activity,
      id: recentActivity.length + 1,
      timestamp: activity.timestamp || new Date().toISOString()
    };
    setRecentActivity([newActivity, ...recentActivity]);
  };

  const rateRecipe = (recipeId: number, rating: number) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === recipeId 
        ? { ...recipe, rating }
        : recipe
    ));
  };

  const saveMealPlan = (mealPlan: Omit<MealPlan, 'id'>) => {
    const newMealPlan: MealPlan = {
      ...mealPlan,
      id: mealPlans.length + 1
    };
    setMealPlans([...mealPlans, newMealPlan]);
  };

  const addRecipe = (recipe: Recipe) => {
    setRecipes([...recipes, recipe]);
  };

  const saveDailyMealLog = (log: DailyMealLog) => {
    const existingIndex = dailyMealLogs.findIndex(l => l.date === log.date);
    if (existingIndex >= 0) {
      const updated = [...dailyMealLogs];
      updated[existingIndex] = log;
      setDailyMealLogs(updated);
    } else {
      setDailyMealLogs([...dailyMealLogs, log]);
    }
  };

  return (
    <AppContext.Provider value={{ 
      isLoggedIn, 
      user, 
      recipes,
      mealPlans,
      selectedRecipe,
      recentActivity,
      dailyMealLogs,
      login, 
      logout, 
      setUser,
      toggleFavorite,
      addActivity,
      rateRecipe,
      saveMealPlan,
      setSelectedRecipe,
      addRecipe,
      saveDailyMealLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
