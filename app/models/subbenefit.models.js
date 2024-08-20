const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const subbenefitSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  benefit: {
    type: Schema.Types.ObjectId,
    ref: "Benefit",
    required: true,
  },
});

const Subbenefit = model("Subbenefit", subbenefitSchema);

module.exports = Subbenefit;
