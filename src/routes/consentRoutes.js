const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const {
    getConsents,
    updateConsent,
} = require("../controllers/consentController");

// Get authenticated user's consents
router.get(
    "/consents",
    authenticateToken,
    getConsents
);

// Grant or withdraw consent
router.post(
    "/consents",
    authenticateToken,
    updateConsent
);

module.exports = router;