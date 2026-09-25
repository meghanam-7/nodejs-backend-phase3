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
  createJobValidation,
  jobIdValidation,
  evaluateJobValidation,
} = require("../validations/jobValidation");

const jobController = require("../controllers/jobController");

router.post(
  "/jobs",
  authenticateToken,
  requireRole("COMPANY"),
  createJobValidation,
  validateRequest,
  jobController.createJob
);

router.get(
  "/jobs",
  authenticateToken,
  requireRole("COMPANY"),
  jobController.getJobs
);

router.get(
  "/jobs/:id",
  authenticateToken,
  requireRole("COMPANY"),
  jobIdValidation,
  validateRequest,
  jobController.getJob
);

router.post(
  "/jobs/:id/evaluate",
  authenticateToken,
  requireRole("COMPANY"),
  jobIdValidation,
  evaluateJobValidation,
  validateRequest,
  jobController.evaluateJob
);

module.exports = router;