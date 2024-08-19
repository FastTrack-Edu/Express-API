const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const termConditionSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
});

const TermCondition = model("TermCondition", termConditionSchema);

module.exports = TermCondition;
