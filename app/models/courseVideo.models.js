const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const courseVideoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
});

const CourseVideo = model("CourseVideo", courseVideoSchema);

module.exports = CourseVideo;
