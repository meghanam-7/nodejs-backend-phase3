const { body, param } = require("express-validator");

const scheduleInterviewValidation = [
  body("applicationId")
    .notEmpty()
    .withMessage("Application ID is required")
    .isInt({ min: 1 })
    .withMessage(
      "Application ID must be a positive integer"
    ),

  body("scheduledAt")
    .notEmpty()
    .withMessage(
      "Scheduled date and time are required"
    )
    .isISO8601()
    .withMessage(
      "Scheduled date and time must be a valid ISO 8601 date"
    ),

  body("durationMinutes")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "Interview duration must be a positive integer"
    ),

  body("meetingUrl")
    .optional({ nullable: true })
    .isURL()
    .withMessage(
      "Meeting URL must be a valid URL"
    ),
];

const interviewIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Interview ID is required")
    .isInt({ min: 1 })
    .withMessage(
      "Interview ID must be a positive integer"
    ),
];

const jobIdValidation = [
  param("jobId")
    .notEmpty()
    .withMessage("Job ID is required")
    .isInt({ min: 1 })
    .withMessage(
      "Job ID must be a positive integer"
    ),
];

module.exports = {
  scheduleInterviewValidation,
  interviewIdValidation,
  jobIdValidation,
};