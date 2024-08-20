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
  price: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["reguler", "exclusive"],
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
  benefits: [
    {
      type: Schema.Types.ObjectId,
      ref: "Benefit",
    },
  ],
  enrolled_members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

courseSchema.query.filter = function (title) {
  let query = this;
  if (title) {
    query = query.where({ title: new RegExp(title, "i") });
  }
  return query;
};

const Course = model("Course", courseSchema);

module.exports = Course;
