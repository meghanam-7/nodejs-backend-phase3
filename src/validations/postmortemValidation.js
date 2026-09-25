const { body, param } = require("express-validator");

const createPostmortemValidation = [
    param("incidentId")
        .isInt({ min: 1 })
        .withMessage("Incident id must be a positive integer."),

    body("summary")
        .trim()
        .notEmpty()
        .withMessage("Postmortem summary is required.")
        .isLength({ max: 5000 })
        .withMessage("Postmortem summary must be 5000 characters or fewer."),

    body("impact")
        .trim()
        .notEmpty()
        .withMessage("Postmortem impact is required.")
        .isLength({ max: 5000 })
        .withMessage("Postmortem impact must be 5000 characters or fewer."),

    body("rootCause")
        .trim()
        .notEmpty()
        .withMessage("Postmortem root cause is required.")
        .isLength({ max: 5000 })
        .withMessage("Postmortem root cause must be 5000 characters or fewer."),

    body("timeline")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 10000 })
        .withMessage("Postmortem timeline must be 10000 characters or fewer."),

    body("correctiveActions")
        .trim()
        .notEmpty()
        .withMessage("Corrective actions are required.")
        .isLength({ max: 5000 })
        .withMessage(
            "Corrective actions must be 5000 characters or fewer."
        ),

    body("preventiveActions")
        .trim()
        .notEmpty()
        .withMessage("Preventive actions are required.")
        .isLength({ max: 5000 })
        .withMessage(
            "Preventive actions must be 5000 characters or fewer."
        ),
];

const incidentPostmortemValidation = [
    param("incidentId")
        .isInt({ min: 1 })
        .withMessage("Incident id must be a positive integer."),
];

module.exports = {
    createPostmortemValidation,
    incidentPostmortemValidation,
};