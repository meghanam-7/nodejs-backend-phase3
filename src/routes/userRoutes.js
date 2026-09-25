const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");

const {
    deleteOwnAccount,
    getOwnData,
} = require("../controllers/userController");

// Get logged-in user's data
router.get("/users/me/data", authenticateToken, getOwnData);

// Delete logged-in user's account
router.delete("/users/me", authenticateToken, deleteOwnAccount);

module.exports = router;