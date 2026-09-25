const express = require("express");

const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authorizationMiddleware");
const validateRequest = require("../middleware/validationMiddleware");

const {
    createIncidentValidation,
    incidentIdValidation,
    updateIncidentStatusValidation,
    createIncidentEventValidation,
} = require("../validations/incidentValidation");

const incidentController = require("../controllers/incidentController");

const incidentAccess = [
    authenticateToken,
    requireRole("ADMIN"),
];

router.post(
    "/incidents",
    ...incidentAccess,
    createIncidentValidation,
    validateRequest,
    incidentController.createIncident
);

router.get(
    "/incidents",
    ...incidentAccess,
    incidentController.getIncidents
);

router.get(
    "/incidents/:id",
    ...incidentAccess,
    incidentIdValidation,
    validateRequest,
    incidentController.getIncidentById
);

router.patch(
    "/incidents/:id/status",
    ...incidentAccess,
    updateIncidentStatusValidation,
    validateRequest,
    incidentController.updateIncidentStatus
);

router.post(
    "/incidents/:id/events",
    ...incidentAccess,
    createIncidentEventValidation,
    validateRequest,
    incidentController.addIncidentEvent
);

router.get(
    "/incidents/:id/events",
    ...incidentAccess,
    incidentIdValidation,
    validateRequest,
    incidentController.getIncidentEvents
);

module.exports = router;