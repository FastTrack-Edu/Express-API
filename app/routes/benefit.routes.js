const express = require("express");
const auth = require("../middleware/auth.middleware");
const Benefit = require("../models/benefit.models");
const admin = require("../middleware/admin.middleware");
const Course = require("../models/course.models");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const benefits = await Benefit.find().populate("course").populate("subbenefits");
    res.status(201).json(benefits);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const benefitId = req.params.id;

  try {
    const benefit = await Benefit.findById(benefitId).populate("course").populate("subbenefits");

    if (!benefit) {
      return res.status(404).json({ error: "Benefit not found" });
    }

    res.status(201).json(benefit);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, async (req, res) => {
  const benefitData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(benefitData, ["name", "course"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Video Lesson Exist or Not
    const { document: courseExist, error: courseError } = await findModelById("Course", benefitData.course);
    if (courseError) {
      return res.status(400).json({ error: courseError });
    }

    const benefit = new Benefit(benefitData);
    await benefit.save();

    await Course.findByIdAndUpdate(benefit.course, {
      $push: { benefits: benefit._id },
    });

    res.status(201).json(benefit);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, async (req, res) => {
  const benefitId = req.params.id;
  const benefitData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(benefitData, ["name", "course"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Video Lesson Exist or Not
    const { document: courseExist, error: courseError } = await findModelById("Course", benefitData.course);
    if (courseError) {
      return res.status(400).json({ error: courseError });
    }

    const { document: benefitExist, error: benefitError } = await findModelById("Benefit", benefitId);
    if (benefitError) {
      return res.status(400).json({ error: benefitError });
    }

    const updatedBenefit = await Benefit.findByIdAndUpdate(benefitId, benefitData, { new: true });

    if (benefitExist.course != benefitData.course) {
      await Course.findByIdAndUpdate(benefitExist.course, {
        $pull: { benefits: benefitExist._id },
      });
      await Course.findByIdAndUpdate(benefitData.course, {
        $push: { benefits: updatedBenefit._id },
      });
    }

    res.status(200).json(updatedBenefit);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const benefitId = req.params.id;

  try {
    const deletedBenefit = await Benefit.findByIdAndDelete(benefitId);

    if (!deletedBenefit) {
      return res.status(404).json({ error: "Delete failed benefit not found" });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
