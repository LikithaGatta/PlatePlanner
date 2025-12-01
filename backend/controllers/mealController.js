const Meal = require("../models/Meal");

// ADD MEAL
exports.addMeal = async (req, res) => {
  try {
    const { mealType, recipeName, calories, date } = req.body;

    const meal = await Meal.create({
      userId: req.userId,   
      mealType,
      recipeName,
      calories,
      date
    });

    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ error: "Failed to add meal" });
  }
};

// GET MEALS FOR LOGGED USER ONLY
exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.userId });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meals" });
  }
};
