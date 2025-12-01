const express = require("express");
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const MealPlan = require("../models/MealPlan");

// Save or update meal plan for a user + date
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { date, breakfast, lunch, dinner, snacks } = req.body;

    if (!date) return res.status(400).json({ error: "Date is required" });

    const doc = await MealPlan.findOneAndUpdate(
      { userId, date },
      { 
        userId,
        date,
        breakfast,
        lunch,
        dinner,
        snacks
      },
      { upsert: true, new: true }
    );

    res.json(doc);
  } catch (err) {
    console.error("Save meal plan error:", err);
    res.status(500).json({ error: "Server error saving meal plan" });
  }
});

// Get meal plans for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const mealPlans = await MealPlan.find({ userId });
    res.json(mealPlans);
  } catch (err) {
    console.error("Fetch meal plans error:", err);
    res.status(500).json({ error: "Failed to fetch meal plans" });
  }
});

// Get meal plan for specific date
router.get("/:date", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.params;
    
    const mealPlan = await MealPlan.findOne({ userId, date });
    res.json(mealPlan || {});
  } catch (err) {
    console.error("Fetch meal plan error:", err);
    res.status(500).json({ error: "Failed to fetch meal plan" });
  }
});

module.exports = router;
