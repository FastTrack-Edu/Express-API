const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const timelineSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    default: null,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
});

const Timeline = model("Timeline", timelineSchema);

module.exports = Timeline;
