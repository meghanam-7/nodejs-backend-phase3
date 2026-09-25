const express = require("express");

const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authorizationMiddleware");
const validateRequest = require("../middleware/validationMiddleware");

const {
    createBacklogValidation,
    backlogIdValidation,
    defectBacklogListValidation,
    updateBacklogStatusValidation,
} = require("../validations/backlogValidation");

const backlogController = require("../controllers/backlogController");

const backlogAccess = [
    authenticateToken,
    requireRole("ADMIN"),
];

router.post(
    "/defects/:defectId/backlog",
    ...backlogAccess,
    createBacklogValidation,
    validateRequest,
    backlogController.createBacklogItem
);

router.get(
    "/defects/:defectId/backlog",
    ...backlogAccess,
    defectBacklogListValidation,
    validateRequest,
    backlogController.getBacklogItemsByDefectId
);

router.get(
    "/backlog",
    ...backlogAccess,
    backlogController.getRankedBacklogItems
);

router.get(
    "/backlog/:id",
    ...backlogAccess,
    backlogIdValidation,
    validateRequest,
    backlogController.getBacklogItemById
);

router.patch(
    "/backlog/:id/status",
    ...backlogAccess,
    updateBacklogStatusValidation,
    validateRequest,
    backlogController.updateBacklogItemStatus
);

module.exports = router;