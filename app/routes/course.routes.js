const express = require("express");
const auth = require("../middleware/auth.middleware");
const Course = require("../models/course.models");
const Mentor = require("../models/mentor.models");
const admin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");
const fs = require("fs");
const path = require("path");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  const { title } = req.query;

  try {
    const courses = await Course.find()
      .filter(title)
      .populate("mentor")
      .populate({
        path: "benefits",
        populate: {
          path: "subbenefits",
        },
      })
      .populate("enrolled_members")
      .populate("reviews");
    res.status(201).json(courses);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await Course.findById(courseId)
      .populate("mentor")
      .populate({
        path: "benefits",
        populate: {
          path: "subbenefits",
        },
      })
      .populate("enrolled_members")
      .populate("reviews");

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(201).json(course);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, upload.single("thumbnail"), async (req, res) => {
  const courseData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(courseData, ["title", "description", "price", "type", "mentor"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Mentor Exist or Not
    const { document: mentorExist, error: mentorError } = await findModelById("Mentor", courseData.mentor);
    if (mentorError) {
      return res.status(400).json({ error: mentorError });
    }

    // Handle Upload
    if (req.file) {
      courseData.thumbnail = "/uploads/thumbnail/" + req.file.filename;
    }

    const course = new Course(courseData);
    await course.save();

    await Mentor.findByIdAndUpdate(course.mentor, {
      $push: { courses: course._id },
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, upload.single("thumbnail"), async (req, res) => {
  const courseId = req.params.id;
  const courseData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(courseData, ["title", "description", "price", "type", "mentor"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Mentor Exist or Not
    const { document: mentorExist, error: mentorError } = await findModelById("Mentor", courseData.mentor);
    if (mentorError) {
      return res.status(400).json({ error: mentorError });
    }

    // Find Course Exist or Not
    const { document: courseExist, error: courseError } = await findModelById("Course", courseId);
    if (courseError) {
      return res.status(400).json({ error: courseError });
    }

    // Handle Upload
    if (req.file) {
      if (courseExist.thumbnail) {
        await fs.promises.unlink(path.join("public", courseExist.thumbnail), (err) => {
          res.status(500).send(err.message);
        });
      }
      courseData.thumbnail = "/uploads/thumbnail/" + req.file.filename;
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, courseData, { new: true });

    if (courseExist.mentor != courseData.mentor) {
      await Mentor.findByIdAndUpdate(courseExist.mentor, {
        $pull: { courses: courseExist._id },
      });
      await Mentor.findByIdAndUpdate(courseData.mentor, {
        $push: { courses: updatedCourse._id },
      });
    }

    res.status(200).json(updatedCourse);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const courseId = req.params.id;

  try {
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ error: "Delete failed course not found" });
    }

    if (deletedCourse.thumbnail) {
      await fs.promises.unlink(path.join("public", deletedCourse.thumbnail), (err) => {
        res.status(500).send(err.message);
      });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
