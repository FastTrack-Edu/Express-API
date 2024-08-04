const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.models");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: "1h" });
    res.json({ user: user, token: token });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

router.post("/register", async (req, res) => {
  const userData = req.body;

  if (userData.password !== userData.confirm_password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const { error: validationError } = validateRequiredFields(userData, ["name", "email", "password", "confirm_password"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: "1h" });
    res.status(201).json({ user: user, token: token });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

module.exports = router;
