const Review = require("../models/review.models");

async function calculateAverageRating(modelId, modelType) {
  try {
    let reviews;

    switch (modelType) {
      case "video_lesson":
        reviews = await Review.find({ video_lesson: modelId });
        break;
      case "course":
        reviews = await Review.find({ course: modelId });
        break;
      case "mentoring":
        reviews = await Review.find({ mentoring: modelId });
        break;
      default:
        throw new Error("Invalid entity type");
    }

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
