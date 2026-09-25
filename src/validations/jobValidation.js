const { body, param } = require("express-validator");

const createJobValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required")
    .isLength({ min: 2, max: 200 })
    .withMessage(
      "Job title must be between 2 and 200 characters"
    ),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Job description is required"),

  body("location")
    .optional()
    .isLength({ max: 200 })
    .withMessage(
      "Location must not exceed 200 characters"
    ),

  body("employmentType")
    .optional()
    .isLength({ max: 50 })
    .withMessage(
      "Employment type must not exceed 50 characters"
    ),

  body("skillThresholds")
    .isArray({ min: 1 })
    .withMessage(
      "At least one skill threshold is required"
    ),

  body("skillThresholds.*.competencyId")
    .isInt({ min: 1 })
    .withMessage(
      "Competency ID must be a positive integer"
    ),

  body("skillThresholds.*.minimumLevel")
    .isInt({ min: 1, max: 100 })
    .withMessage(
      "Minimum level must be between 1 and 100"
    ),
];

const jobIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage(
      "Job ID must be a positive integer"
    ),
];

const evaluateJobValidation = [
  body("skills")
    .isArray()
    .withMessage("Skills must be an array"),

  body("skills.*.competencyId")
    .isInt({ min: 1 })
    .withMessage(
      "Competency ID must be a positive integer"
    ),

  body("skills.*.level")
    .isInt({ min: 1, max: 100 })
    .withMessage(
      "Skill level must be between 1 and 100"
    ),
];

module.exports = {
  createJobValidation,
  jobIdValidation,
  evaluateJobValidation,
};