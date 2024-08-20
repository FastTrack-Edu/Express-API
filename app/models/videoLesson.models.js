const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const videoLessonSchema = new Schema({
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
  category: {
    type: String,
    enum: ["riset", "sains", "puspernas"],
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
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

videoLessonSchema.query.filter = function (title, level, category) {
  let query = this;
  if (title) {
    query = query.where({ title: new RegExp(title, "i") });
  }
  if (level) {
    query = query.where({ level });
  }
  if (level) {
    query = query.where({ category });
  }
  return query;
};

const VideoLesson = model("VideoLesson", videoLessonSchema);

module.exports = VideoLesson;
