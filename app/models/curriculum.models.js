const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const curriculumSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  video_lesson: {
    type: Schema.Types.ObjectId,
    ref: "VideoLesson",
    required: true,
  },
  subcurriculums: [
    {
      type: Schema.Types.ObjectId,
      ref: "Subcurriculum",
    },
  ],
});

const Curriculum = model("Curriculum", curriculumSchema);

module.exports = Curriculum;
