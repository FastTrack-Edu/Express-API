const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const benefitSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  subbenefits: [
    {
      type: Schema.Types.ObjectId,
      ref: "Subbenefit",
    },
  ],
});

const Benefit = model("Benefit", benefitSchema);

module.exports = Benefit;
