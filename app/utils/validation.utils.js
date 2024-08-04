const mongoose = require("mongoose");

async function findModelById(modelName, id) {
  try {
    const Model = mongoose.model(modelName);
    const document = await Model.findById(id);
    return document ? { document } : { error: `${modelName} doesn't exist` };
  } catch (err) {
    throw new Error(`Error finding ${modelName}: ${err.message}`);
  }
}

function validateRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    return { error: `Missing required fields: ${missingFields.join(", ")}` };
  }

  return {};
}

module.exports = { findModelById, validateRequiredFields };
