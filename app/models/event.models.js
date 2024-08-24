const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  audience: {
    type: String,
    required: true,
  },
  event_date: {
    type: Date,
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
  guide_book: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["lkti", "bmc", "inovasi", "disertasi"],
  },
  term_conditions: [
    {
      type: Schema.Types.ObjectId,
      ref: "TermCondition",
    },
  ],
  timelines: [
    {
      type: Schema.Types.ObjectId,
      ref: "Timeline",
    },
  ],
  registrations: [
    {
      type: Schema.Types.ObjectId,
      ref: "EventRegistration",
    },
  ],
});

eventSchema.query.filter = function (name, category) {
  let query = this;
  if (name) {
    query = query.where({ name: new RegExp(name, "i") });
  }
  if (category) {
    query = query.where({ category });
  }
  return query;
};

const Event = model("Event", eventSchema);

module.exports = Event;
