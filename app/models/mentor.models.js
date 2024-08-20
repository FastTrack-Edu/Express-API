const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const mentorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  experience_duration: {
    type: Number,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default: null,
  },
  linkedin: {
    type: String,
    default: null,
  },
  video_lessons: [
    {
      type: Schema.Types.ObjectId,
      ref: "VideoLesson",
    },
  ],
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: "VideoLesson",
    },
  ],
});

const Mentor = model("Mentor", mentorSchema);

module.exports = Mentor;
