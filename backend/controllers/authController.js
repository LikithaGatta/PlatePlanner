const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, firstName, lastName } = req.body;

    // Prevent duplicate users
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name: name || `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      firstName: firstName || name,
      lastName: lastName || '',
      allergies: [],
      dietaryRestrictions: []
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      userId: newUser._id,
      user: {
        username: newUser.email,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        allergies: newUser.allergies,
        dietaryRestrictions: newUser.dietaryRestrictions
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user existence
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      userId: user._id,
      user: {
        username: user.email,
        email: user.email,
        firstName: user.firstName || user.name,
        lastName: user.lastName || '',
        allergies: user.allergies || [],
        dietaryRestrictions: user.dietaryRestrictions || [],
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        goalType: user.goalType,
        calorieGoal: user.calorieGoal
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const { firstName, lastName, email, gender, height, weight, goalType, calorieGoal, allergies, dietaryRestrictions } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update basic info fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      user.email = email;
    }
    
    // Update health/goal fields
    if (gender !== undefined) user.gender = gender;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (goalType !== undefined) user.goalType = goalType;
    if (calorieGoal !== undefined) user.calorieGoal = calorieGoal;
    if (allergies !== undefined) user.allergies = allergies;
    if (dietaryRestrictions !== undefined) user.dietaryRestrictions = dietaryRestrictions;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        username: user.email,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        allergies: user.allergies,
        dietaryRestrictions: user.dietaryRestrictions,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        goalType: user.goalType,
        calorieGoal: user.calorieGoal
      }
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ error: "Profile update failed" });
  }
};
