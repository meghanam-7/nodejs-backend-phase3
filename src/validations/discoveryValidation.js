const { query } = require("express-validator");

const searchJobsValidation = [
  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Search must be between 1 and 100 characters"
    ),

  query("location")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage(
      "Location must be between 1 and 200 characters"
    ),

  query("employmentType")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "Employment type must be between 1 and 50 characters"
    ),
];

module.exports = {
  searchJobsValidation,
};