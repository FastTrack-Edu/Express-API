const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const courseModulSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  modul: {
    type: String,
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
});

const CourseModul = model("CourseModul", courseModulSchema);

module.exports = CourseModul;
