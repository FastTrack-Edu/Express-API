const express = require("express");
const auth = require("../middleware/auth.middleware");
const EventRegistration = require("../models/eventRegistration.models");
const Event = require("../models/event.models");
const upload = require("../middleware/upload.middleware");
const { validateRequiredFields } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const eventRegistrations = await EventRegistration.find().populate("event");
    res.status(201).json(eventRegistrations);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const eventRegistrationId = req.params.id;

  try {
    const eventRegistration = await EventRegistration.findById(eventRegistrationId).populate("event");

    if (!eventRegistration) {
      return res.status(404).json({ error: "EventRegistration not found" });
    }

    res.status(201).json(eventRegistration);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, upload.single("file"), async (req, res) => {
  const eventRegistrationData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(eventRegistrationData, ["university", "team", "work_title", "subtheme", "event", "user"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (req.file) {
      eventRegistrationData.file = "/uploads/file/" + req.file.filename;
    }

    const eventRegistration = new EventRegistration(eventRegistrationData);
    await eventRegistration.save();

    await Event.findByIdAndUpdate(eventRegistration.event, {
      $push: { registrations: eventRegistration._id },
    });

    res.status(201).json(eventRegistration);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
