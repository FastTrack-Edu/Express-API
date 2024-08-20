const express = require("express");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const Subbenefit = require("../models/subbenefit.models");
const Benefit = require("../models/benefit.models");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const subbenefits = await Subbenefit.find().populate("benefit");
    res.status(201).json(subbenefits);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const subbenefitId = req.params.id;

  try {
    const subbenefit = await Subbenefit.findById(subbenefitId).populate("benefit");

    if (!subbenefit) {
      return res.status(404).json({ error: "Subbenefit not found" });
    }

    res.status(201).json(subbenefit);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, async (req, res) => {
  const subbenefitData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(subbenefitData, ["name", "benefit"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Benefit Exist or Not
    const { document: benefitExist, error: benefitError } = await findModelById("Benefit", subbenefitData.benefit);
    if (benefitError) {
      return res.status(400).json({ error: benefitError });
    }

    const subbenefit = new Subbenefit(subbenefitData);
    await subbenefit.save();

    await Benefit.findByIdAndUpdate(subbenefit.benefit, {
      $push: { subbenefits: subbenefit._id },
    });

    res.status(201).json(subbenefit);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, async (req, res) => {
  const subbenefitId = req.params.id;
  const subbenefitData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(subbenefitData, ["name", "benefit"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Benefit Exist or Not
    const { document: benefitExist, error: benefitError } = await findModelById("Benefit", subbenefitData.benefit);
    if (benefitError) {
      return res.status(400).json({ error: benefitError });
    }

    const { document: subbenefitExist, error: subbenefitError } = await findModelById("Subbenefit", subbenefitId);
    if (subbenefitError) {
      return res.status(400).json({ error: benefitError });
    }

    const updatedSubbenefit = await Subbenefit.findByIdAndUpdate(subbenefitId, subbenefitData, { new: true });

    if (subbenefitExist.benefit != subbenefitData.benefit) {
      await Benefit.findByIdAndUpdate(subbenefitExist.benefit, {
        $pull: { subbenefits: subbenefitExist._id },
      });
      await Benefit.findByIdAndUpdate(subbenefitData.benefit, {
        $push: { subbenefits: updatedSubbenefit._id },
      });
    }

    res.status(200).json(updatedSubbenefit);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const subbenefitId = req.params.id;

  try {
    const deletedSubbenefit = await Subbenefit.findByIdAndDelete(subbenefitId);

    if (!deletedSubbenefit) {
      return res.status(404).json({ error: "Delete failed subbenefit not found" });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
