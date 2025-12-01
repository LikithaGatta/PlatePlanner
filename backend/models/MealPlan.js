const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  breakfast: { type: String },
  lunch: { type: String },
  dinner: { type: String },
  snacks: { type: String }
}, {
  timestamps: true
});

// Ensure one meal plan per user per date
mealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("MealPlan", mealPlanSchema);
