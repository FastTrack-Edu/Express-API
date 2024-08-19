const express = require("express");
const auth = require("../middleware/auth.middleware");
const Timeline = require("../models/timeline.models");
const admin = require("../middleware/admin.middleware");
const Event = require("../models/event.models");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const timelines = await Timeline.find().populate("event");
    res.status(201).json(timelines);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const timelineId = req.params.id;

  try {
    const timeline = await Timeline.findById(timelineId).populate("event");

    if (!timeline) {
      return res.status(404).json({ error: "Timeline not found" });
    }

    res.status(201).json(timeline);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, async (req, res) => {
  const timelineData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(timelineData, ["name", "start_date", "event"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Video Lesson Exist or Not
    const { document: eventExist, error: eventError } = await findModelById("Event", timelineData.event);
    if (eventError) {
      return res.status(400).json({ error: eventError });
    }

    const timeline = new Timeline(timelineData);
    await timeline.save();

    await Event.findByIdAndUpdate(timeline.event, {
      $push: { timelines: timeline._id },
    });

    res.status(201).json(timeline);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, async (req, res) => {
  const timelineId = req.params.id;
  const timelineData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(timelineData, ["name", "start_date", "event"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Video Lesson Exist or Not
    const { document: eventExist, error: eventError } = await findModelById("Event", timelineData.event);
    if (eventError) {
      return res.status(400).json({ error: eventError });
    }

    const { document: timelineExist, error: timelineError } = await findModelById("Timeline", timelineId);
    if (timelineError) {
      return res.status(400).json({ error: timelineError });
    }

    const updatedTimeline = await Timeline.findByIdAndUpdate(timelineId, timelineData, { new: true });

    if (timelineExist.event != timelineData.event) {
      await Event.findByIdAndUpdate(timelineExist.event, {
        $pull: { timelines: timelineExist._id },
      });
      await Event.findByIdAndUpdate(timelineData.event, {
        $push: { timelines: updatedTimeline._id },
      });
    }

    res.status(200).json(updatedTimeline);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const timelineId = req.params.id;

  try {
    const deletedTimeline = await Timeline.findByIdAndDelete(timelineId);

    if (!deletedTimeline) {
      return res.status(404).json({ error: "Delete failed timeline not found" });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
