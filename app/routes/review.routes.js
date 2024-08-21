const express = require("express");
const auth = require("../middleware/auth.middleware");
const Review = require("../models/review.models");
const VideoLesson = require("../models/videoLesson.models");
const { calculateAverageRating } = require("../utils/calculate.utils");
const { validateRequiredFields, findModelById } = require("../utils/validation.utils");
const Course = require("../models/course.models");
const Mentoring = require("../models/mentoring.models");

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
    const { error: validationError } = validateRequiredFields(reviewData, ["review", "rating", "user"]);
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

    if (reviewData.video_lesson) {
      await VideoLesson.findByIdAndUpdate(
        review.video_lesson,
        {
          $push: { reviews: review._id },
          $set: { rating: await calculateAverageRating(review.video_lesson, "video_lesson") },
        },
        { new: true }
      );
    }
    if (reviewData.course) {
      await Course.findByIdAndUpdate(
        review.course,
        {
          $push: { reviews: review._id },
          $set: { rating: await calculateAverageRating(review.course, "course") },
        },
        { new: true }
      );
    }
    if (reviewData.mentoring) {
      await Mentoring.findByIdAndUpdate(
        review.mentoring,
        {
          $push: { reviews: review._id },
          $set: { rating: await calculateAverageRating(review.mentoring, "mentoring") },
        },
        { new: true }
      );
    }

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

    const { document: reviewExist, error: reviewError } = await findModelById("Review", reviewId);
    if (reviewError) {
      return res.status(400).json({ error: reviewError });
    }

    const updatedReview = await Review.findByIdAndUpdate(reviewId, reviewData, { new: true });

    if (updatedReview.video_lesson) {
      const newVideoLessonRating = await calculateAverageRating(updatedReview.video_lesson, "video_lesson");
      await VideoLesson.findByIdAndUpdate(updatedReview.video_lesson, { rating: newVideoLessonRating });
    }
    if (updatedReview.course) {
      const newCourseRating = await calculateAverageRating(updatedReview.course, "course");
      await Course.findByIdAndUpdate(updatedReview.course, { rating: newCourseRating });
    }
    if (updatedReview.mentoring) {
      const newMentoringRating = await calculateAverageRating(updatedReview.mentoring, "mentoring");
      await Mentoring.findByIdAndUpdate(updatedReview.mentoring, { rating: newMentoringRating });
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

    const newRating = await calculateAverageRating(deletedReview.video_lesson);
    await VideoLesson.findByIdAndUpdate(deletedReview.video_lesson, { rating: newRating });

    res.status(200).json({ message: "Data deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
