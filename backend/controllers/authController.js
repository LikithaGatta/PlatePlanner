const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// create new account
exports.register = async (req, res) => {
  try {
    const { name, email, password, firstName, lastName } = req.body;

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // encrypt the password so we never store plain text
    const hashedPassword = await bcrypt.hash(password, 10);

    // make new user in database
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

    // create login token that lasts 7 days
    const token = jwt.sign(
      { userId: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // send back token and user info
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



// log in existing user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // make login token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // send back all user data
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

// reset user password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    // find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // encrypt new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // save it
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
};

// update user profile info
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // comes from auth middleware
    const { firstName, lastName, email, gender, height, weight, goalType, calorieGoal, allergies, dietaryRestrictions } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // update basic stuff
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) {
      // make sure no one else has this email
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      user.email = email;
    }
    
    // update health info
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
