const mongoose = require("mongoose");
const User = require("../models/user.models");
const Mentor = require("../models/mentor.models");
const VideoLesson = require("../models/videoLesson.models");
const Curriculum = require("../models/curriculum.models");
const connectDB = require("./init");

const migrateFresh = async () => {
  await connectDB();

  try {
    // Delete All Collection
    await User.deleteMany({});
    await Mentor.deleteMany({});
    await VideoLesson.deleteMany({});
    await Curriculum.deleteMany({});

    console.log("All collections cleared");

    // Initial User Admin
    const initialUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });
    await initialUser.save();

    console.log("Initial user created");

    mongoose.connection.close();
  } catch (err) {
    console.error("Migration failed:", err.message);
    mongoose.connection.close();
  }
};

migrateFresh();
