const express = require("express");

const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authorizationMiddleware");

const sloController = require("../controllers/sloController");

const sloAccess = [
    authenticateToken,
    requireRole("ADMIN"),
];

router.post(
    "/api/slos",
    ...sloAccess,
    sloController.createSlo
);

router.get(
    "/api/slos",
    ...sloAccess,
    sloController.getSlos
);

router.get(
    "/api/slos/dashboard",
    ...sloAccess,
    sloController.getDashboard
);

router.get(
    "/api/slos/:id",
    ...sloAccess,
    sloController.getSloById
);

router.post(
    "/api/slos/:id/measurements",
    ...sloAccess,
    sloController.createMeasurement
);

router.get(
    "/api/slos/:id/measurements",
    ...sloAccess,
    sloController.getMeasurements
);

module.exports = router;