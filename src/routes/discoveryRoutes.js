const express = require("express");

const router = express.Router();

const validateRequest = require("../middleware/validationMiddleware");

const {
  searchJobsValidation,
} = require("../validations/discoveryValidation");

const discoveryController = require("../controllers/discoveryController");

router.get(
  "/jobs/search",
  searchJobsValidation,
  validateRequest,
  discoveryController.searchJobs
);

module.exports = router;