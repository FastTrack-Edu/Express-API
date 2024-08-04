const express = require("express");
const auth = require("../middleware/auth.middleware");
const Review = require("../models/review.models");
const { calculateAverageRating } = require("../utils/calculate.utils");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().populate("video_lesson").populate("user");
    res.status(201).json(reviews);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/create", auth, async (req, res) => {
  const reviewData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(reviewData, ["review", "rating", "user", "video_lesson"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { document: userExist, error: userError } = await findModelById("User", reviewData.user);
    if (userError) {
      return res.status(400).json({ error: userError });
    }

    const { document: videoLessonExist, error: videoLessonError } = await findModelById("VideoLesson", reviewData.video_lesson);
    if (videoLessonError) {
      return res.status(400).json({ error: videoLessonError });
    }

    const review = new Review(reviewData);
    await review.save();

    videoLessonExist.reviews.push(review._id);
    videoLessonExist.rating = await calculateAverageRating(videoLessonExist._id);
    await videoLessonExist.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/update/:id", auth, async (req, res) => {
  const reviewId = req.params.id;
  const reviewData = req.body;

  try {
    const { error: validationError } = validateRequiredFields(reviewData, ["review", "rating"]);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const updatedReview = await Review.findByIdAndUpdate(reviewId, reviewData, { new: true });

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json(updatedReview);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/destroy/:id", auth, async (req, res) => {
  const reviewId = req.params.id;

  try {
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return res.status(404).json({ error: "Delete failed review not found" });
    }

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
