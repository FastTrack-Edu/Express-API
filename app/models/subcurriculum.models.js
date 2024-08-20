const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const subcurriculumSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  curriculum: {
    type: Schema.Types.ObjectId,
    ref: "Curriculum",
    required: true,
  },
});

const Subcurriculum = model("Subcurriculum", subcurriculumSchema);

module.exports = Subcurriculum;
