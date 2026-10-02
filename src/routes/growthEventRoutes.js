const express = require("express");

const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const growthEventController = require("../controllers/growthEventController");

router.post(
    "/api/growth-events",
    authenticateToken,
    growthEventController.emitEvent,
);

router.get(
    "/api/growth-events/pending",
    authenticateToken,
    growthEventController.getPendingEvents,
);

router.get(
    "/api/growth-events/replay",
    authenticateToken,
    growthEventController.replayEvents,
);

module.exports = router;