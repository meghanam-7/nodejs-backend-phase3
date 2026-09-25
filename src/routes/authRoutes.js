const express = require("express");
const router = express.Router();
const { authLimiter } = require("../middleware/rateLimiter");
const {
    signupValidation,
    loginValidation,
} = require("../validations/authValidation");

const validateRequest = require("../middleware/validationMiddleware");

const {
    signup,
    login,
} = require("../controllers/authController");

// Signup Route
router.post(
    "/auth/signup",
    signupValidation,
    validateRequest,
    signup
);

// Login Route
router.post(
    "/auth/login",
    loginValidation,
    validateRequest,
    authLimiter,
    login
);

module.exports = router;