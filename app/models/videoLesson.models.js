const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const videoLessonSchema = new Schema({
  name: {
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
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  discount_price: {
    type: Number,
    default: null,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
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
  curriculums: [
    {
      type: Schema.Types.ObjectId,
      ref: "Curriculum",
    },
  ],
  enrolled_members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  reviews: [],
});

const VideoLesson = model("VideoLesson", videoLessonSchema);

module.exports = VideoLesson;
