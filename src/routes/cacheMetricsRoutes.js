const express = require("express");

const router = express.Router();

const {
    authenticateToken,
} = require("../middleware/authMiddleware");

const {
    requireRole,
} = require("../middleware/authorizationMiddleware");

const {
    getMetrics,
    resetMetrics,
} = require("../controllers/cacheMetricsController");

router.get(
    "/api/cache/metrics",
    authenticateToken,
    requireRole("ADMIN"),
    getMetrics
);

router.delete(
    "/api/cache/metrics",
    authenticateToken,
    requireRole("ADMIN"),
    resetMetrics
);

module.exports = router;