const express = require("express");
const auth = require("../middleware/auth.middleware");
const CourseLive = require("../models/courseLive.models");
const admin = require("../middleware/admin.middleware");
const Course = require("../models/course.models");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  const { course } = req.query;

  try {
    const courseLives = await CourseLive.find({ course }).populate("course");
    res.status(201).json(courseLives);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const courseLiveId = req.params.id;

  try {
    const courseLive = await CourseLive.findById(courseLiveId).populate("course");

    if (!courseLive) {
      return res.status(404).json({ error: "CourseLive not found" });
    }

    res.status(201).json(courseLive);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, async (req, res) => {
  const courseLiveData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(courseLiveData, ["name", "datetime", "link", "course"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Course Exist or Not
    const { document: courseExist, error: courseError } = await findModelById("Course", courseLiveData.course);
    if (courseError) {
      return res.status(400).json({ error: courseError });
    }

    const courseLive = new CourseLive(courseLiveData);
    await courseLive.save();

    await Course.findByIdAndUpdate(courseLive.course, {
      $push: { course_lives: courseLive._id },
    });

    res.status(201).json(courseLive);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, async (req, res) => {
  const courseLiveId = req.params.id;
  const courseLiveData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(courseLiveData, ["name", "datetime", "link", "course"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Course Exist or Not
    const { document: courseExist, error: courseError } = await findModelById("Course", courseLiveData.course);
    if (courseError) {
      return res.status(400).json({ error: courseError });
    }

    const { document: courseLiveExist, error: courseLiveError } = await findModelById("CourseLive", courseLiveId);
    if (courseLiveError) {
      return res.status(400).json({ error: courseLiveError });
    }

    const updatedCourseLive = await CourseLive.findByIdAndUpdate(courseLiveId, courseLiveData, { new: true });

    if (courseLiveExist.course != courseLiveData.course) {
      await Course.findByIdAndUpdate(courseLiveExist.course, {
        $pull: { course_lives: courseLiveExist._id },
      });
      await Course.findByIdAndUpdate(courseLiveData.course, {
        $push: { course_lives: updatedCourseLive._id },
      });
    }

    res.status(200).json(updatedCourseLive);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const courseLiveId = req.params.id;

  try {
    const deletedCourseLive = await CourseLive.findByIdAndDelete(courseLiveId);

    if (!deletedCourseLive) {
      return res.status(404).json({ error: "Delete failed courseLive not found" });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
