const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "expert"],
    default: "beginner",
  },
  rating: {
    type: Number,
    default: 0,
  },
  mentor: {
    type: Schema.Types.ObjectId,
    ref: "Mentor",
    required: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const Course = model("Course", courseSchema);

module.exports = Course;
