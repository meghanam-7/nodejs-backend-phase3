const { body, param } = require("express-validator");

const createDefectValidation = [
    param("incidentId")
        .isInt({ min: 1 })
        .withMessage("Incident id must be a positive integer."),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Defect title is required.")
        .isLength({ max: 200 })
        .withMessage("Defect title must be 200 characters or fewer."),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Defect description is required.")
        .isLength({ max: 2000 })
        .withMessage("Defect description must be 2000 characters or fewer."),

    body("severity")
        .trim()
        .isIn(["SEV1", "SEV2", "SEV3", "SEV4"])
        .withMessage("Severity must be SEV1, SEV2, SEV3, or SEV4."),

    body("priority")
        .isInt({ min: 1, max: 5 })
        .withMessage("Priority must be an integer from 1 to 5."),

    body("source")
        .trim()
        .notEmpty()
        .withMessage("Defect source is required.")
        .isLength({ max: 100 })
        .withMessage("Defect source must be 100 characters or fewer."),

    body("endpoint")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Endpoint must be 500 characters or fewer."),

    body("httpStatus")
        .optional({ nullable: true })
        .isInt({ min: 100, max: 599 })
        .withMessage("HTTP status must be between 100 and 599."),

    body("evidence")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Evidence must be 5000 characters or fewer."),
];

const defectIdValidation = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Defect id must be a positive integer."),
];

const incidentDefectListValidation = [
    param("incidentId")
        .isInt({ min: 1 })
        .withMessage("Incident id must be a positive integer."),
];

const updateDefectStatusValidation = [
    ...defectIdValidation,

    body("status")
        .trim()
        .isIn([
            "TRIAGED",
            "IN_PROGRESS",
            "FIXED",
            "VERIFIED",
            "CLOSED",
        ])
        .withMessage(
            "Status must be TRIAGED, IN_PROGRESS, FIXED, VERIFIED, or CLOSED."
        ),
];

module.exports = {
    createDefectValidation,
    defectIdValidation,
    incidentDefectListValidation,
    updateDefectStatusValidation,
};