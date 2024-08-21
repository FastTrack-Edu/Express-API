const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const courseLiveSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  datetime: {
    type: Date,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
});

const CourseLive = model("CourseLive", courseLiveSchema);

module.exports = CourseLive;
