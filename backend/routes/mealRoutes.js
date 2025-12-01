// routes/mealsRoutes.js
const express = require("express");
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // JWT middleware
const Meal = require("../models/Meal");     // Mongoose model

// Save or update meals for a user + date
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.userId;      // from JWT
    const { date, breakfast, lunch, dinner, snacks } = req.body;

    if (!date) return res.status(400).json({ error: "Date is required" });

   const doc = await Meal.findOneAndUpdate(
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
    console.error("Save meals error:", err);
    res.status(500).json({ error: "Server error saving meals" });
  }
});

// Get meals for logged-in user

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const meals = await Meal.find({ userId });
    res.json(meals);

  } catch (err) {
    console.error("Fetch meals error:", err);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});



module.exports = router;
