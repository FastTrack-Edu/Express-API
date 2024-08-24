const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const eventRegistrationSchema = new Schema({
  university: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  work_title: {
    type: String,
    required: true,
  },
  subtheme: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const EventRegistration = model("EventRegistration", eventRegistrationSchema);

module.exports = EventRegistration;
