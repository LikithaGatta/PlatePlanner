// models/Meal.js
const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  breakfast: { type: Array, default: [] },
  lunch: { type: Array, default: [] },
  dinner: { type: Array, default: [] },
  snacks: { type: Array, default: [] }
});

module.exports = mongoose.model("Meal", mealSchema);
