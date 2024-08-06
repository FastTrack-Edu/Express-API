const express = require("express");
const auth = require("../middleware/auth.middleware");
const Curriculum = require("../models/curriculum.models");
const admin = require("../middleware/admin.middleware");
const VideoLesson = require("../models/videoLesson.models");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const curriculums = await Curriculum.find().populate("video_lesson").populate("subcurriculums");
    res.status(201).json(curriculums);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const curriculumId = req.params.id;

  try {
    const curriculum = await Curriculum.findById(curriculumId).populate("video_lesson").populate("subcurriculums");

    if (!curriculum) {
      return res.status(404).json({ error: "Curriculum not found" });
    }

    res.status(201).json(curriculum);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, async (req, res) => {
  const curriculumData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(curriculumData, ["name", "video_lesson"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Video Lesson Exist or Not
    const { document: videoLessonExist, error: videoLessonError } = await findModelById("VideoLesson", curriculumData.video_lesson);
    if (videoLessonError) {
      return res.status(400).json({ error: videoLessonError });
    }

    const curriculum = new Curriculum(curriculumData);
    await curriculum.save();

    videoLessonExist.curriculums.push(curriculum._id);
    await videoLessonExist.save();

    res.status(201).json(curriculum);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, async (req, res) => {
  const curriculumId = req.params.id;
  const curriculumData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(curriculumData, ["name", "video_lesson"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Video Lesson Exist or Not
    const { document: videoLessonExist, error: videoLessonError } = await findModelById("VideoLesson", curriculumData.video_lesson);
    if (videoLessonError) {
      return res.status(400).json({ error: videoLessonError });
    }

    const updatedCurriculum = await Curriculum.findByIdAndUpdate(curriculumId, curriculumData, { new: true });

    if (!updatedCurriculum) {
      return res.status(404).json({ error: "Curriculum not found" });
    }

    if (updatedCurriculum.video_lesson != curriculumData.video_lesson) {
      const oldVideoLesson = await VideoLesson.findById(videoLessonExist.video_lesson);
      const newVideoLesson = await VideoLesson.findById(curriculumData.video_lesson);

      if (oldVideoLesson && newVideoLesson) {
        oldVideoLesson.curriculums.pull(videoLessonExist._id);
        newVideoLesson.curriculums.push(videoLessonExist._id);
        await oldVideoLesson.save();
        await newVideoLesson.save();
      }
    }

    res.status(200).json(updatedCurriculum);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const curriculumId = req.params.id;

  try {
    const deletedCurriculum = await Curriculum.findByIdAndDelete(curriculumId);

    if (!deletedCurriculum) {
      return res.status(404).json({ error: "Delete failed curriculum not found" });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
