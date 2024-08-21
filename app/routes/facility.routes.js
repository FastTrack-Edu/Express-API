const express = require("express");
const auth = require("../middleware/auth.middleware");
const Facility = require("../models/facility.models");
const admin = require("../middleware/admin.middleware");
const Mentoring = require("../models/mentoring.models");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const facilities = await Facility.find().populate("mentoring");
    res.status(201).json(facilities);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const facilityId = req.params.id;

  try {
    const facility = await Facility.findById(facilityId).populate("mentoring");

    if (!facility) {
      return res.status(404).json({ error: "Facility not found" });
    }

    res.status(201).json(facility);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, async (req, res) => {
  const facilityData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(facilityData, ["name", "description", "mentoring"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Mentoring Exist or Not
    const { document: mentoringExist, error: mentoringError } = await findModelById("Mentoring", facilityData.mentoring);
    if (mentoringError) {
      return res.status(400).json({ error: mentoringError });
    }

    const facility = new Facility(facilityData);
    await facility.save();

    await Mentoring.findByIdAndUpdate(facility.mentoring, {
      $push: { facilities: facility._id },
    });

    res.status(201).json(facility);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, async (req, res) => {
  const facilityId = req.params.id;
  const facilityData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(facilityData, ["name", "description", "mentoring"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Mentoring Exist or Not
    const { document: mentoringExist, error: mentoringError } = await findModelById("Mentoring", facilityData.mentoring);
    if (mentoringError) {
      return res.status(400).json({ error: mentoringError });
    }

    const { document: facilityExist, error: facilityError } = await findModelById("Facility", facilityId);
    if (facilityError) {
      return res.status(400).json({ error: facilityError });
    }

    const updatedFacility = await Facility.findByIdAndUpdate(facilityId, facilityData, { new: true });

    if (facilityExist.mentoring != facilityData.mentoring) {
      await Mentoring.findByIdAndUpdate(facilityExist.mentoring, {
        $pull: { facilities: facilityExist._id },
      });
      await Mentoring.findByIdAndUpdate(facilityData.mentoring, {
        $push: { facilities: updatedFacility._id },
      });
    }

    res.status(200).json(updatedFacility);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const facilityId = req.params.id;

  try {
    const deletedFacility = await Facility.findByIdAndDelete(facilityId);

    if (!deletedFacility) {
      return res.status(404).json({ error: "Delete failed facility not found" });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
