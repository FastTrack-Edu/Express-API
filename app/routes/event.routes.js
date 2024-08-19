const express = require("express");
const auth = require("../middleware/auth.middleware");
const Event = require("../models/event.models");
const admin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");
const fs = require("fs");
const path = require("path");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("term_conditions").populate("timelines");
    res.status(201).json(events);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId).populate("term_conditions").populate("timelines");

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(201).json(event);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post(
  "/create",
  auth,
  admin,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "guide_book", maxCount: 1 },
  ]),
  async (req, res) => {
    const eventData = req.body;

    try {
      const { error: validationError } = validateRequiredFields(eventData, ["name", "registration_fee", "organizer", "theme", "audience", "event_date", "description"]);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Handle Upload
      if (req.files) {
        if (req.files["thumbnail"]) {
          eventData.thumbnail = "/uploads/thumbnail/" + req.files["thumbnail"][0].filename;
        }
        if (req.files["guide_book"]) {
          eventData.guide_book = "/uploads/guide_book/" + req.files["guide_book"][0].filename;
        }
      }

      const event = new Event(eventData);
      await event.save();

      res.status(201).json(event);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

router.patch(
  "/update/:id",
  auth,
  admin,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "guide_book", maxCount: 1 },
  ]),
  async (req, res) => {
    const eventId = req.params.id;
    const eventData = req.body;

    try {
      const { error: validationError } = validateRequiredFields(eventData, ["name", "registration_fee", "organizer", "theme", "audience", "event_date", "description"]);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Find Video Lesson Exist or Not
      const { document: eventExist, error: eventError } = await findModelById("Event", eventId);
      if (eventError) {
        return res.status(400).json({ error: eventError });
      }

      // Handle Upload
      if (req.files) {
        if (req.files["thumbnail"]) {
          if (eventExist.thumbnail) {
            await fs.promises.unlink(path.join("public", eventExist.thumbnail), (err) => {
              res.status(500).send(err.message);
            });
          }
          eventData.thumbnail = "/uploads/thumbnail/" + req.files["thumbnail"][0].filename;
        }
        if (req.files["guide_book"]) {
          if (eventExist.guide_book) {
            await fs.promises.unlink(path.join("public", eventExist.guide_book), (err) => {
              res.status(500).send(err.message);
            });
          }
          eventData.guide_book = "/uploads/guide_book/" + req.files["guide_book"][0].filename;
        }
      }

      const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, { new: true });

      res.status(200).json(updatedEvent);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const eventId = req.params.id;

  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: "Delete failed event not found" });
    }

    if (deletedEvent.thumbnail) {
      await fs.promises.unlink(path.join("public", deletedEvent.thumbnail), (err) => {
        res.status(500).send(err.message);
      });
    }

    if (deletedEvent.guide_book) {
      await fs.promises.unlink(path.join("public", deletedEvent.guide_book), (err) => {
        res.status(500).send(err.message);
      });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
