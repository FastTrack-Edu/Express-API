const express = require("express");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const Subcurriculum = require("../models/subcurriculum.models");
const Curriculum = require("../models/curriculum.models");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const subcurriculums = await Subcurriculum.find().populate("curriculum");
    res.status(201).json(subcurriculums);
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
    const { error: validationError } = validateRequiredFields(subcurriculumData, ["name", "curriculum"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Curriculum Exist or Not
    const { document: curriculumExist, error: curriculumError } = await findModelById("Curriculum", subcurriculumData.curriculum);
    if (curriculumError) {
      return res.status(400).json({ error: curriculumError });
    }

    const subcurriculum = new Subcurriculum(subcurriculumData);
    await subcurriculum.save();

    await Curriculum.findByIdAndUpdate(subcurriculum.curriculum, {
      $push: { subcurriculums: subcurriculum._id },
    });

    res.status(201).json(subcurriculum);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, async (req, res) => {
  const subcurriculumId = req.params.id;
  const subcurriculumData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(subcurriculumData, ["name", "curriculum"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Curriculum Exist or Not
    const { document: curriculumExist, error: curriculumError } = await findModelById("Curriculum", subcurriculumData.curriculum);
    if (curriculumError) {
      return res.status(400).json({ error: curriculumError });
    }

    const { document: subcurriculumExist, error: subcurriculumError } = await findModelById("Subcurriculum", subcurriculumId);
    if (subcurriculumError) {
      return res.status(400).json({ error: curriculumError });
    }

    const updatedSubcurriculum = await Subcurriculum.findByIdAndUpdate(subcurriculumId, subcurriculumData, { new: true });

    if (subcurriculumExist.curriculum != subcurriculumData.curriculum) {
      await Curriculum.findByIdAndUpdate(subcurriculumExist.curriculum, {
        $pull: { subcurriculums: subcurriculumExist._id },
      });
      await Curriculum.findByIdAndUpdate(subcurriculumData.curriculum, {
        $push: { subcurriculums: updatedSubcurriculum._id },
      });
    }

    res.status(200).json(updatedSubcurriculum);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const subcurriculumId = req.params.id;

  try {
    const deletedSubcurriculum = await Subcurriculum.findByIdAndDelete(subcurriculumId);

    if (!deletedSubcurriculum) {
      return res.status(404).json({ error: "Delete failed subcurriculum not found" });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
