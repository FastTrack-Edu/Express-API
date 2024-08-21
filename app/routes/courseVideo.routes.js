const express = require("express");
const auth = require("../middleware/auth.middleware");
const CourseVideo = require("../models/courseVideo.models");
const Course = require("../models/course.models");
const admin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");
const fs = require("fs");
const path = require("path");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  const { course } = req.query;

  try {
    const courseVideos = await CourseVideo.find({ course }).populate("course");
    res.status(201).json(courseVideos);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const courseVideoId = req.params.id;

  try {
    const courseVideo = await CourseVideo.findById(courseVideoId).populate("course");

    if (!courseVideo) {
      return res.status(404).json({ error: "CourseVideo not found" });
    }

    res.status(201).json(courseVideo);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, upload.single("video"), async (req, res) => {
  const courseVideoData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(courseVideoData, ["title", "description", "course"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (req.file) {
      courseVideoData.video = "/uploads/video/" + req.file.filename;
    }

    const courseVideo = new CourseVideo(courseVideoData);
    await courseVideo.save();

    await Course.findByIdAndUpdate(courseVideo.course, {
      $push: { course_videos: courseVideo._id },
    });

    res.status(201).json(courseVideo);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, upload.single("video"), async (req, res) => {
  const courseVideoId = req.params.id;
  const courseVideoData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(courseVideoData, ["title", "description", "course"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { document: courseVideoExist, error: courseVideoError } = await findModelById("CourseVideo", courseVideoId);
    if (courseVideoError) {
      return res.status(404).json({ error: courseVideoError });
    }

    if (req.file) {
      if (courseVideoExist.video) {
        await fs.promises.unlink(path.join("public", courseVideoExist.video), (err) => {
          res.status(500).send(err.message);
        });
      }
      courseVideoData.video = "/uploads/video/" + req.file.filename;
    }

    const updatedCourseVideo = await CourseVideo.findByIdAndUpdate(courseVideoId, courseVideoData, { new: true });

    if (courseVideoExist.course != courseVideoData.course) {
      await Course.findByIdAndUpdate(courseVideoExist.course, {
        $pull: { course_videos: courseVideoExist._id },
      });
      await Course.findByIdAndUpdate(courseVideoData.course, {
        $push: { course_videos: updatedCourseVideo._id },
      });
    }

    res.status(201).json(updatedCourseVideo);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const courseVideoId = req.params.id;

  try {
    const deletedCourseVideo = await CourseVideo.findByIdAndDelete(courseVideoId);

    if (!deletedCourseVideo) {
      return res.status(404).json({ error: "Delete failed mentor not found" });
    }

    if (deletedCourseVideo.video) {
      await fs.promises.unlink(path.join("public", deletedCourseVideo.video), (err) => {
        res.status(500).send(err.message);
      });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
