const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  allergies: { type: [String], default: [] },
  dietaryRestrictions: { type: [String], default: [] },
  gender: { type: String, enum: ['male', 'female', 'not-specified'] },
  height: { type: Number },
  weight: { type: Number },
  goalType: { type: String, enum: ['lose', 'gain', 'maintain'] },
  calorieGoal: { type: Number }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
