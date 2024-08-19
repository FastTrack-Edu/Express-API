const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth.middleware");
const User = require("../models/user.models");
const { validateRequiredFields } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update", auth, async (req, res) => {
  const userId = req.user.id;
  const userData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(userData, ["name", "instance", "phone_number", "email"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true });

    res.status(201).json(updatedUser);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
