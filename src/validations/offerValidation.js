const { body, param } = require("express-validator");

const createOfferValidation = [
  body("applicationId")
    .notEmpty()
    .withMessage("Application ID is required")
    .isInt({ min: 1 })
    .withMessage("Application ID must be a positive integer"),

  body("compensation")
    .notEmpty()
    .withMessage("Compensation is required")
    .isInt({ min: 1 })
    .withMessage("Compensation must be a positive integer"),

  body("currency")
    .optional()
    .isString()
    .withMessage("Currency must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Currency cannot be empty"),

  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Joining date must be a valid date"),

  body("documentUrl")
    .optional()
    .isURL()
    .withMessage("Document URL must be a valid URL"),

  body("eSignProvider")
    .optional()
    .isString()
    .withMessage("eSign provider must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("eSign provider cannot be empty"),
];

const offerIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Offer ID is required")
    .isInt({ min: 1 })
    .withMessage("Offer ID must be a positive integer"),
];

module.exports = {
  createOfferValidation,
  offerIdValidation,
};