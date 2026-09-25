const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const applicationStatusController = require("../controllers/applicationStatusController");

router.patch(
  "/applications/:id/status",
  authMiddleware.authenticateToken,
  applicationStatusController.updateApplicationStatus
);

router.get(
  "/applications/:id/status-history",
  authMiddleware.authenticateToken,
  applicationStatusController.getApplicationStatusHistory
);

router.get(
  "/applications/:id/status-history/latest",
  authMiddleware.authenticateToken,
  applicationStatusController.getLatestApplicationStatusHistory
);

module.exports = router;