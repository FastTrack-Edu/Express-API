const express = require("express");
const auth = require("../middleware/auth.middleware");
const Mentor = require("../models/mentor.models");
const admin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const mentors = await Mentor.find().populate("video_lessons");
    res.status(201).json(mentors);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const mentorId = req.params.id;

  try {
    const mentor = await Mentor.findById(mentorId).populate("video_lessons");

    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    res.status(201).json(mentor);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, upload.single("photo"), async (req, res) => {
  const mentorData = req.body;

  try {
    const requiredFields = ["name", "experience_duration", "about", "linkedin"];
    const missingFields = requiredFields.filter((field) => !mentorData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    if (req.file) {
      mentorData.photo = "/uploads/photo/" + req.file.filename;
    }

    const mentor = new Mentor(mentorData);

    await mentor.save();

    res.status(201).json(mentor);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, upload.single("photo"), async (req, res) => {
  const mentorId = req.params.id;
  const mentorData = req.body;

  try {
    const requiredFields = ["name", "experience_duration", "about", "linkedin"];
    const missingFields = requiredFields.filter((field) => !mentorData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    const mentorExists = await Mentor.findById(mentorId);

    if (!mentorExists) {
      return res.status(404).json({ error: "Mentor doesnt exist" });
    }

    if (req.file) {
      if (mentorExists.photo) {
        await fs.promises.unlink(path.join("public", mentorExists.photo), (err) => {
          res.status(500).send(err.message);
        });
      }
      mentorData.photo = "/uploads/photo/" + req.file.filename;
    }

    const updatedMentor = await Mentor.findByIdAndUpdate(mentorId, mentorData, { new: true });

    res.status(201).json(updatedMentor);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const mentorId = req.params.id;

  try {
    const deletedMentor = await Mentor.findByIdAndDelete(mentorId);

    if (!deletedMentor) {
      return res.status(404).json({ error: "Delete failed mentor not found" });
    }

    if (deletedMentor.photo) {
      await fs.promises.unlink(path.join("public", deletedMentor.photo), (err) => {
        res.status(500).send(err.message);
      });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
