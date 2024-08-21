const express = require("express");
const auth = require("../middleware/auth.middleware");
const Mentoring = require("../models/mentoring.models");
const admin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");
const fs = require("fs");
const path = require("path");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");
const Mentor = require("../models/mentor.models");

const router = express.Router();

router.get("/", async (req, res) => {
  const { name, category } = req.query;

  try {
    const mentorings = await Mentoring.find().filter(name, category).populate("facilities");
    res.status(201).json(mentorings);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const mentoringId = req.params.id;

  try {
    const mentoring = await Mentoring.findById(mentoringId).populate("facilities");

    if (!mentoring) {
      return res.status(404).json({ error: "Mentoring not found" });
    }

    res.status(201).json(mentoring);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, upload.single("thumbnail"), async (req, res) => {
  const mentoringData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(mentoringData, ["name", "description", "price", "category", "mentor"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Handle Upload
    if (req.file) {
      mentoringData.photo = "/uploads/thumbnail/" + req.file.filename;
    }

    const mentoring = new Mentoring(mentoringData);
    await mentoring.save();

    await Mentor.findByIdAndUpdate(mentoring.mentor, {
      $push: { mentorings: mentoring._id },
    });

    res.status(201).json(mentoring);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, upload.single("thumbnail"), async (req, res) => {
  const mentoringId = req.params.id;
  const mentoringData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(mentoringData, ["name", "description", "price", "category", "mentor"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Mentoring Exist or Not
    const { document: mentoringExist, error: mentoringError } = await findModelById("Mentoring", mentoringId);
    if (mentoringError) {
      return res.status(400).json({ error: mentoringError });
    }

    // Handle Upload
    if (req.file) {
      if (mentoringExist.thumbnail) {
        await fs.promises.unlink(path.join("public", mentoringExist.thumbnail), (err) => {
          res.status(500).send(err.message);
        });
      }
      mentoringData.thumbnail = "/uploads/thumbnail/" + req.file.filename;
    }

    const updatedMentoring = await Mentoring.findByIdAndUpdate(mentoringId, mentoringData, { new: true });

    if (mentoringExist.mentor != mentoringData.mentor) {
      await Mentor.findByIdAndUpdate(mentoringExist.mentor, {
        $pull: { mentorings: mentoringExist._id },
      });
      await Mentor.findByIdAndUpdate(mentoringData.mentor, {
        $push: { mentorings: updatedVideoLesson._id },
      });
    }

    res.status(200).json(updatedMentoring);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const mentoringId = req.params.id;

  try {
    const deletedMentoring = await Mentoring.findByIdAndDelete(mentoringId);

    if (!deletedMentoring) {
      return res.status(404).json({ error: "Delete failed mentoring not found" });
    }

    if (deletedMentoring.thumbnail) {
      await fs.promises.unlink(path.join("public", deletedMentoring.thumbnail), (err) => {
        res.status(500).send(err.message);
      });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
