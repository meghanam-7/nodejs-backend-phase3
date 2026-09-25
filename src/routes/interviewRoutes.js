const express = require("express");

const router = express.Router();

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/authorizationMiddleware");

const validateRequest = require("../middleware/validationMiddleware");

const {
  scheduleInterviewValidation,
  interviewIdValidation,
  jobIdValidation,
} = require("../validations/interviewValidation");

const interviewController = require("../controllers/interviewController");

/*
 * Company schedules an interview for a shortlisted application
 */
router.post(
  "/interviews",
  authenticateToken,
  requireRole("COMPANY"),
  scheduleInterviewValidation,
  validateRequest,
  interviewController.scheduleInterview
);

/*
 * Student views their interviews
 */
router.get(
  "/interviews",
  authenticateToken,
  requireRole("STUDENT"),
  interviewController.getStudentInterviews
);

/*
 * Get a specific interview
 * Accessible by the student or company owner.
 * Ownership is enforced inside the service layer.
 */
router.get(
  "/interviews/:id",
  authenticateToken,
  interviewIdValidation,
  validateRequest,
  interviewController.getInterviewById
);

/*
 * Company views interviews scheduled for its job
 */
router.get(
  "/jobs/:jobId/interviews",
  authenticateToken,
  requireRole("COMPANY"),
  jobIdValidation,
  validateRequest,
  interviewController.getJobInterviews
);

module.exports = router;