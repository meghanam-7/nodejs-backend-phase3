const { body } = require("express-validator");

const companySignupValidation = [
    body("contactName")
        .trim()
        .notEmpty()
        .withMessage("Contact name is required")
        .isLength({ min: 3 })
        .withMessage("Contact name must be at least 3 characters long"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Please provide a valid company account email")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Company name is required")
        .isLength({ min: 2, max: 150 })
        .withMessage("Company name must be between 2 and 150 characters"),

    body("legalName")
        .trim()
        .notEmpty()
        .withMessage("Legal company name is required")
        .isLength({ min: 2, max: 200 })
        .withMessage("Legal company name must be between 2 and 200 characters"),

    body("website")
        .optional({ values: "falsy" })
        .trim()
        .isURL({ protocols: ["http", "https"], require_protocol: true })
        .withMessage("Website must be a valid URL including http:// or https://"),

    body("description")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Description cannot exceed 2000 characters"),

    body("industry")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 120 })
        .withMessage("Industry cannot exceed 120 characters"),

    body("companySize")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 50 })
        .withMessage("Company size cannot exceed 50 characters"),

    body("phone")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 7, max: 30 })
        .withMessage("Phone must be between 7 and 30 characters"),

    body("address")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Address cannot exceed 500 characters"),
];

module.exports = { companySignupValidation };
