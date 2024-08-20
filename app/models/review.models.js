const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const reviewSchema = new Schema({
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  video_lesson: {
    type: Schema.Types.ObjectId,
    ref: "VideoLesson",
    default: null,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    default: null,
  },
});

const Review = model("Review", reviewSchema);

module.exports = Review;
