require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/meals", require("./routes/mealRoutes"));
app.use("/api/meal-plans", require("./routes/mealPlanRoutes"));

// Test route (IMPORTANT FOR DEBUG)
app.get("/", (req, res) => {
  res.send("Backend is working ");
});

app.listen(5050, () => {
  console.log("Server running on port 5050");
});
