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
  jobIdValidation,
  applicationIdValidation,
} = require("../validations/applicationValidation");

const applicationController = require("../controllers/applicationController");

// Student applies to a published job
router.post(
  "/jobs/:id/applications",
  authenticateToken,
  requireRole("STUDENT"),
  jobIdValidation,
  validateRequest,
  applicationController.applyToJob
);

// Student views their applications
router.get(
  "/applications",
  authenticateToken,
  requireRole("STUDENT"),
  applicationController.getMyApplications
);

// Company views applications for its job
router.get(
  "/jobs/:id/applications",
  authenticateToken,
  requireRole("COMPANY"),
  jobIdValidation,
  validateRequest,
  applicationController.getJobApplications
);

// Company shortlists an applicant
router.post(
  "/applications/:id/shortlist",
  authenticateToken,
  requireRole("COMPANY"),
  applicationIdValidation,
  validateRequest,
  applicationController.shortlistApplication
);

module.exports = router;