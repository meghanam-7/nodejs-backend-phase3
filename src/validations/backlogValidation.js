const { body, param } = require("express-validator");

const createBacklogValidation = [
    param("defectId")
        .isInt({ min: 1 })
        .withMessage("Defect id must be a positive integer."),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Backlog title is required.")
        .isLength({ max: 200 })
        .withMessage("Backlog title must be 200 characters or fewer."),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Backlog description must be 2000 characters or fewer."),

    body("priority")
        .isInt({ min: 1, max: 5 })
        .withMessage("Priority must be an integer from 1 to 5."),

    body("dueDate")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Due date must be a valid ISO 8601 date."),
];

const backlogIdValidation = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Backlog item id must be a positive integer."),
];

const defectBacklogListValidation = [
    param("defectId")
        .isInt({ min: 1 })
        .withMessage("Defect id must be a positive integer."),
];

const updateBacklogStatusValidation = [
    ...backlogIdValidation,

    body("status")
        .trim()
        .isIn([
            "IN_PROGRESS",
            "DONE",
            "VERIFIED",
            "CLOSED",
        ])
        .withMessage(
            "Status must be IN_PROGRESS, DONE, VERIFIED, or CLOSED."
        ),
];

module.exports = {
    createBacklogValidation,
    backlogIdValidation,
    defectBacklogListValidation,
    updateBacklogStatusValidation,
};