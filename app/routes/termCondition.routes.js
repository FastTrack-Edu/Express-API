const express = require("express");
const auth = require("../middleware/auth.middleware");
const TermCondition = require("../models/termCondition.models");
const admin = require("../middleware/admin.middleware");
const Event = require("../models/event.models");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const termConditions = await TermCondition.find().populate("event");
    res.status(201).json(termConditions);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const termConditionId = req.params.id;

  try {
    const termCondition = await TermCondition.findById(termConditionId).populate("event");

    if (!termCondition) {
      return res.status(404).json({ error: "TermCondition not found" });
    }

    res.status(201).json(termCondition);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, admin, async (req, res) => {
  const termConditionData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(termConditionData, ["description", "event"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Video Lesson Exist or Not
    const { document: eventExist, error: eventError } = await findModelById("Event", termConditionData.event);
    if (eventError) {
      return res.status(400).json({ error: eventError });
    }

    const termCondition = new TermCondition(termConditionData);
    await termCondition.save();

    await Event.findByIdAndUpdate(termCondition.event, {
      $push: { term_conditions: termCondition._id },
    });

    res.status(201).json(termCondition);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, admin, async (req, res) => {
  const termConditionId = req.params.id;
  const termConditionData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(termConditionData, ["description", "event"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find Video Lesson Exist or Not
    const { document: eventExist, error: eventError } = await findModelById("Event", termConditionData.event);
    if (eventError) {
      return res.status(400).json({ error: eventError });
    }

    const { document: termConditionExist, error: termConditionError } = await findModelById("TermCondition", termConditionId);
    if (termConditionError) {
      return res.status(400).json({ error: termConditionError });
    }

    const updatedTermCondition = await TermCondition.findByIdAndUpdate(termConditionId, termConditionData, { new: true });

    if (termConditionExist.event != termConditionData.event) {
      await Event.findByIdAndUpdate(termConditionExist.event, {
        $pull: { term_conditions: termConditionExist._id },
      });
      await Event.findByIdAndUpdate(termConditionData.event, {
        $push: { term_conditions: updatedTermCondition._id },
      });
    }

    res.status(200).json(updatedTermCondition);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, admin, async (req, res) => {
  const termConditionId = req.params.id;

  try {
    const deletedTermCondition = await TermCondition.findByIdAndDelete(termConditionId);

    if (!deletedTermCondition) {
      return res.status(404).json({ error: "Delete failed term condition not found" });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
