const mongoose = require("mongoose");
const User = require("../models/user.models");
const Mentor = require("../models/mentor.models");
const VideoLesson = require("../models/videoLesson.models");
const Curriculum = require("../models/curriculum.models");
const connectDB = require("./init");
const Subcurriculum = require("../models/subcurriculum.model");
const Review = require("../models/review.models");

const migrateFresh = async () => {
  await connectDB();

  try {
    // Delete All Collection
    await User.deleteMany({});
    await Mentor.deleteMany({});
    await VideoLesson.deleteMany({});
    await Curriculum.deleteMany({});
    await Subcurriculum.deleteMany({});
    await Review.deleteMany({});

    console.log("All collections cleared");

    // Initial User Admin
    const initialAdmin = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin12345",
      role: "admin",
    });
    await initialAdmin.save();

    const initialUser = new User({
      name: "Member User",
      email: "user@example.com",
      password: "user12345",
      role: "member",
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
