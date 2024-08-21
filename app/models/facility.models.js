const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const facilitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  mentoring: {
    type: Schema.Types.ObjectId,
    ref: "Mentoring",
    required: true,
  },
});

const Facility = model("Facility", facilitySchema);

module.exports = Facility;
