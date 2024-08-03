const express = require("express");
const auth = require("../middleware/auth.middleware");
const Curriculum = require("../models/curriculum.models");
const admin = require("../middleware/admin.middleware");
const VideoLesson = require("../models/videoLesson.models");

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
    const requiredFields = ["name", "video_lesson"];
    const missingFields = requiredFields.filter((field) => !curriculumData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    // Find Video Lesson Exist or Not
    const videoLessonExists = await VideoLesson.findById(curriculumData.video_lesson);
    if (!videoLessonExists) {
      return res.status(400).json({ error: "Video Lesson doesnt exist" });
    }

    const curriculum = new Curriculum(curriculumData);
    await curriculum.save();

    videoLessonExists.curriculums.push(curriculum._id);
    await videoLessonExists.save();

    res.status(201).json(curriculum);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, async (req, res) => {
  const curriculumId = req.params.id;
  const curriculumData = req.body;

  try {
    const requiredFields = ["name", "video_lesson"];
    const missingFields = requiredFields.filter((field) => !curriculumData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    // Find Video Lesson Exist or Not
    const videoLessonExists = await VideoLesson.findById(curriculumData.video_lesson);
    if (!videoLessonExists) {
      return res.status(400).json({ error: "Video lesson doesnt exist" });
    }

    const updatedCurriculum = await Curriculum.findByIdAndUpdate(curriculumId, curriculumData, { new: true });

    if (!updatedCurriculum) {
      return res.status(404).json({ error: "Video lesson not found" });
    }

    if (updatedCurriculum.video_lesson != curriculumData.video_lesson) {
      const oldVideoLesson = await VideoLesson.findById(videoLessonExists.video_lesson);
      const newVideoLesson = await VideoLesson.findById(curriculumData.video_lesson);

      if (oldVideoLesson && newVideoLesson) {
        oldVideoLesson.curriculums.pull(videoLessonExists._id);
        newVideoLesson.curriculums.push(videoLessonExists._id);
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
