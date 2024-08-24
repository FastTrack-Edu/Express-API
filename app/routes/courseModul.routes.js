const express = require("express");
const auth = require("../middleware/auth.middleware");
const CourseModul = require("../models/courseModul.models");
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
    const courseModuls = await CourseModul.find({ course }).populate("course");
    res.status(201).json(courseModuls);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const courseModulId = req.params.id;

  try {
    const courseModul = await CourseModul.findById(courseModulId).populate("course");

    if (!courseModul) {
      return res.status(404).json({ error: "CourseModul not found" });
    }

    res.status(201).json(courseModul);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, upload.single("modul"), async (req, res) => {
  const courseModulData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(courseModulData, ["title", "description", "course"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (req.file) {
      courseModulData.modul = "/uploads/modul/" + req.file.filename;
    }

    const courseModul = new CourseModul(courseModulData);
    await courseModul.save();

    await Course.findByIdAndUpdate(courseModul.course, {
      $push: { course_moduls: courseModul._id },
    });

    res.status(201).json(courseModul);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, upload.single("modul"), async (req, res) => {
  const courseModulId = req.params.id;
  const courseModulData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(courseModulData, ["title", "description", "course"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { document: courseModulExist, error: courseModulError } = await findModelById("CourseModul", courseModulId);
    if (courseModulError) {
      return res.status(404).json({ error: courseModulError });
    }

    if (req.file) {
      if (courseModulExist.modul) {
        await fs.promises.unlink(path.join("public", courseModulExist.modul), (err) => {
          res.status(500).send(err.message);
        });
      }
      courseModulData.modul = "/uploads/modul/" + req.file.filename;
    }

    const updatedCourseModul = await CourseModul.findByIdAndUpdate(courseModulId, courseModulData, { new: true });

    if (courseModulExist.course != courseModulData.course) {
      await Course.findByIdAndUpdate(courseModulExist.course, {
        $pull: { course_moduls: courseModulExist._id },
      });
      await Course.findByIdAndUpdate(courseModulData.course, {
        $push: { course_moduls: updatedCourseModul._id },
      });
    }

    res.status(201).json(updatedCourseModul);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const courseModulId = req.params.id;

  try {
    const deletedCourseModul = await CourseModul.findByIdAndDelete(courseModulId);

    if (!deletedCourseModul) {
      return res.status(404).json({ error: "Delete failed mentor not found" });
    }

    if (deletedCourseModul.modul) {
      await fs.promises.unlink(path.join("public", deletedCourseModul.modul), (err) => {
        res.status(500).send(err.message);
      });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
