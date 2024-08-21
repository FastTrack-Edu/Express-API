const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const mentoringSchema = new Schema({
  name: {
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
  category: {
    type: String,
    enum: ["ppko", "lkti", "pkm", "p2mw", "essai"],
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
  facilities: [
    {
      type: Schema.Types.ObjectId,
      ref: "Facility",
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

mentoringSchema.query.filter = function (name, category) {
  let query = this;
  if (name) {
    query = query.where({ name: new RegExp(name, "i") });
  }
  if (category) {
    query = query.where({ category });
  }
  return query;
};

const Mentoring = model("Mentoring", mentoringSchema);

module.exports = Mentoring;
