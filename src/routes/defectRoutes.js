const express = require("express");

const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authorizationMiddleware");
const validateRequest = require("../middleware/validationMiddleware");

const {
    createDefectValidation,
    defectIdValidation,
    incidentDefectListValidation,
    updateDefectStatusValidation,
} = require("../validations/defectValidation");

const defectController = require("../controllers/defectController");

const defectAccess = [
    authenticateToken,
    requireRole("ADMIN"),
];

router.post(
    "/incidents/:incidentId/defects",
    ...defectAccess,
    createDefectValidation,
    validateRequest,
    defectController.createDefect
);

router.get(
    "/incidents/:incidentId/defects",
    ...defectAccess,
    incidentDefectListValidation,
    validateRequest,
    defectController.getDefectsByIncidentId
);

router.get(
    "/defects",
    ...defectAccess,
    defectController.getRankedDefects
);

router.get(
    "/defects/:id",
    ...defectAccess,
    defectIdValidation,
    validateRequest,
    defectController.getDefectById
);

router.patch(
    "/defects/:id/status",
    ...defectAccess,
    updateDefectStatusValidation,
    validateRequest,
    defectController.updateDefectStatus
);

module.exports = router;