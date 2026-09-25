const { body, param } = require("express-validator");

const createIncidentValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Incident title is required.")
        .isLength({ max: 200 })
        .withMessage("Incident title must be 200 characters or fewer."),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Incident description must be 2000 characters or fewer."),

    body("severity")
        .trim()
        .isIn(["SEV1", "SEV2", "SEV3", "SEV4"])
        .withMessage("Severity must be SEV1, SEV2, SEV3, or SEV4."),
];

const incidentIdValidation = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Incident id must be a positive integer."),
];

const updateIncidentStatusValidation = [
    ...incidentIdValidation,

    body("status")
        .trim()
        .isIn(["TRIAGING", "MITIGATING", "RESOLVED", "CLOSED"])
        .withMessage(
            "Status must be TRIAGING, MITIGATING, RESOLVED, or CLOSED."
        ),
];

const createIncidentEventValidation = [
    ...incidentIdValidation,

    body("eventType")
        .trim()
        .notEmpty()
        .withMessage("Event type is required.")
        .isLength({ max: 100 })
        .withMessage("Event type must be 100 characters or fewer."),

    body("message")
        .trim()
        .notEmpty()
        .withMessage("Event message is required.")
        .isLength({ max: 2000 })
        .withMessage("Event message must be 2000 characters or fewer."),
];

module.exports = {
    createIncidentValidation,
    incidentIdValidation,
    updateIncidentStatusValidation,
    createIncidentEventValidation,
};