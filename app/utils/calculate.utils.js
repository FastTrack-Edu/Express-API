const Review = require("../models/review.models");

async function calculateAverageRating(videoLessonId) {
  try {
    const reviews = await Review.find({ video_lesson: videoLessonId });

    const totalRating = reviews.reduce((acc, review) => acc + parseFloat(review.rating), 0);

    return reviews.length > 0 ? totalRating / reviews.length : 0;
  } catch (err) {
    throw new Error(`Error calculating average rating: ${err.message}`);
  }
}

function calculateDiscountPrice(price, discount) {
  return price * (1 - discount / 100);
}

module.exports = { calculateAverageRating, calculateDiscountPrice };
