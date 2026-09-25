const { body, param } = require("express-validator");

const jobIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Job ID must be a positive integer"),
];

const applicationIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Application ID must be a positive integer"),
];

module.exports = {
  jobIdValidation,
  applicationIdValidation,
};