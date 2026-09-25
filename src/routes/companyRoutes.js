const express = require("express");
const router = express.Router();

const { authLimiter } = require("../middleware/rateLimiter");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authorizationMiddleware");
const validateRequest = require("../middleware/validationMiddleware");
const { companySignupValidation } = require("../validations/companyValidation");
const companyController = require("../controllers/companyController");

router.post(
    "/companies/signup",
    authLimiter,
    companySignupValidation,
    validateRequest,
    companyController.signup
);

router.get(
    "/companies/me",
    authenticateToken,
    requireRole("COMPANY"),
    companyController.getMyCompany
);

module.exports = router;
