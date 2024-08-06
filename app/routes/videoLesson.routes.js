const express = require("express");
const auth = require("../middleware/auth.middleware");
const VideoLesson = require("../models/videoLesson.models");
const Mentor = require("../models/mentor.models");
const admin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");
const fs = require("fs");
const path = require("path");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");
const { calculateDiscountPrice } = require("../utils/calculate.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const videoLessons = await VideoLesson.find()
      .populate("mentor")
      .populate({
        path: "curriculums",
        populate: {
          path: "subcurriculums",
        },
      })
      .populate("enrolled_members")
      .populate("reviews");
    res.status(201).json(videoLessons);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const videoLessonId = req.params.id;

  try {
    const videoLesson = await VideoLesson.findById(videoLessonId)
      .populate("mentor")
      .populate({
        path: "curriculums",
        populate: {
          path: "subcurriculums",
        },
      })
      .populate("enrolled_members")
      .populate("reviews");

    if (!videoLesson) {
      return res.status(404).json({ error: "Video Lesson not found" });
    }

    res.status(201).json(videoLesson);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post(
  "/create",
  auth,
  admin,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    const videoLessonData = req.body;

    try {
      const { error: validationError } = validateRequiredFields(videoLessonData, ["name", "description", "level", "price", "mentor"]);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Find Mentor Exist or Not
      const { document: mentorExist, error: mentorError } = await findModelById("Mentor", videoLessonData.mentor);
      if (mentorError) {
        return res.status(400).json({ error: mentorError });
      }

      // Calculate Discount Price
      if (videoLessonData.discount != 0) {
        const { price, discount } = videoLessonData;
        videoLessonData.discount_price = calculateDiscountPrice(price, discount);
      }

      // Handle Upload
      if (req.files) {
        if (req.files["thumbnail"]) {
          videoLessonData.thumbnail = "/uploads/thumbnail/" + req.files["thumbnail"][0].filename;
        }
        if (req.files["video"]) {
          videoLessonData.video = "/uploads/video/" + req.files["video"][0].filename;
        }
      }

      const videoLesson = new VideoLesson(videoLessonData);
      await videoLesson.save();

      mentorExist.video_lessons.push(videoLesson._id);
      await mentorExist.save();

      res.status(201).json(videoLesson);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

router.patch(
  "/update/:id",
  auth,
  admin,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    const videoLessonId = req.params.id;
    const videoLessonData = req.body;

    try {
      const { error: validationError } = validateRequiredFields(videoLessonData, ["name", "description", "level", "price", "mentor"]);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Find Mentor Exist or Not
      const { document: mentorExist, error: mentorError } = await findModelById("Mentor", videoLessonData.mentor);
      if (mentorError) {
        return res.status(400).json({ error: mentorError });
      }

      // Calculate Discount Price
      if (videoLessonData.discount != 0) {
        const { price, discount } = videoLessonData;
        videoLessonData.discount_price = calculateDiscountPrice(price, discount);
      }

      // Find Video Lesson Exist or Not
      const { document: videoLessonExist, error: videoLessonError } = await findModelById("VideoLesson", videoLessonId);
      if (videoLessonError) {
        return res.status(400).json({ error: videoLessonError });
      }

      // Handle Upload
      if (req.files) {
        if (req.files["thumbnail"]) {
          if (videoLessonExist.thumbnail) {
            await fs.promises.unlink(path.join("public", videoLessonExist.thumbnail), (err) => {
              res.status(500).send(err.message);
            });
          }
          videoLessonData.thumbnail = "/uploads/thumbnail/" + req.files["thumbnail"][0].filename;
        }
        if (req.files["video"]) {
          if (videoLessonExist.video) {
            await fs.promises.unlink(path.join("public", videoLessonExist.video), (err) => {
              res.status(500).send(err.message);
            });
          }
          videoLessonData.video = "/uploads/video/" + req.files["video"][0].filename;
        }
      }

      const updatedVideoLesson = await VideoLesson.findByIdAndUpdate(videoLessonId, videoLessonData, { new: true });

      if (videoLessonExist.mentor != videoLessonData.mentor) {
        const oldMentor = await Mentor.findById(videoLessonExist.mentor);
        const newMentor = await Mentor.findById(videoLessonData.mentor);

        if (oldMentor && newMentor) {
          oldMentor.video_lessons.pull(videoLessonExist._id);
          newMentor.video_lessons.push(videoLessonExist._id);
          await oldMentor.save();
          await newMentor.save();
        }
      }

      res.status(200).json(updatedVideoLesson);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const videoLessonId = req.params.id;

  try {
    const deletedVideoLesson = await VideoLesson.findByIdAndDelete(videoLessonId);

    if (!deletedVideoLesson) {
      return res.status(404).json({ error: "Delete failed video lesson not found" });
    }

    if (deletedVideoLesson.thumbnail) {
      await fs.promises.unlink(path.join("public", deletedVideoLesson.thumbnail), (err) => {
        res.status(500).send(err.message);
      });
    }

    if (deletedVideoLesson.video) {
      await fs.promises.unlink(path.join("public", deletedVideoLesson.video), (err) => {
        res.status(500).send(err.message);
      });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
