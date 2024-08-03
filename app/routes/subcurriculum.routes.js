const express = require("express");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const Subcurriculum = require("../models/subcurriculum.model");
const Curriculum = require("../models/curriculum.models");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const curriculums = await Subcurriculum.find().populate("curriculum");
    res.status(201).json(curriculums);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const subcurriculumId = req.params.id;

  try {
    const subcurriculum = await Subcurriculum.findById(subcurriculumId).populate("curriculum");

    if (!subcurriculum) {
      return res.status(404).json({ error: "Subcurriculum not found" });
    }

    res.status(201).json(subcurriculum);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, async (req, res) => {
  const subcurriculumData = req.body;

  try {
    const requiredFields = ["name", "curriculum"];
    const missingFields = requiredFields.filter((field) => !subcurriculumData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    // Find Curriculum Exist or Not
    const curriculumExists = await Curriculum.findById(subcurriculumData.curriculum);
    if (!curriculumExists) {
      return res.status(400).json({ error: "Curriculum doesnt exist" });
    }

    const subcurriculum = new Subcurriculum(subcurriculumData);
    await subcurriculum.save();

    curriculumExists.subcurriculums.push(subcurriculum._id);
    await curriculumExists.save();

    res.status(201).json(subcurriculum);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, async (req, res) => {
  const subcurriculumId = req.params.id;
  const subcurriculumData = req.body;

  try {
    const requiredFields = ["name", "curriculum"];
    const missingFields = requiredFields.filter((field) => !subcurriculumData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    // Find Curriculum Exist or Not
    const curriculumExists = await Curriculum.findById(subcurriculumData.curriculum);
    if (!curriculumExists) {
      return res.status(400).json({ error: "Video lesson doesnt exist" });
    }

    const updatedCurriculum = await Subcurriculum.findByIdAndUpdate(subcurriculumId, subcurriculumData, { new: true });

    if (!updatedCurriculum) {
      return res.status(404).json({ error: "Video lesson not found" });
    }

    if (updatedCurriculum.curriculum != subcurriculumData.curriculum) {
      const oldVideoLesson = await Curriculum.findById(curriculumExists.curriculum);
      const newVideoLesson = await Curriculum.findById(subcurriculumData.curriculum);

      if (oldVideoLesson && newVideoLesson) {
        oldVideoLesson.subcurriculums.pull(curriculumExists._id);
        newVideoLesson.subcurriculums.push(curriculumExists._id);
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
  const subcurriculumId = req.params.id;

  try {
    const deletedCurriculum = await Subcurriculum.findByIdAndDelete(subcurriculumId);

    if (!deletedCurriculum) {
      return res.status(404).json({ error: "Delete failed subcurriculum not found" });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
