const express = require("express");

const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authorizationMiddleware");
const validateRequest = require("../middleware/validationMiddleware");

const {
    createPostmortemValidation,
    incidentPostmortemValidation,
} = require("../validations/postmortemValidation");

const postmortemController = require("../controllers/postmortemController");

const postmortemAccess = [
    authenticateToken,
    requireRole("ADMIN"),
];

router.post(
    "/incidents/:incidentId/postmortem",
    ...postmortemAccess,
    createPostmortemValidation,
    validateRequest,
    postmortemController.createPostmortem
);

router.get(
    "/incidents/:incidentId/postmortem",
    ...postmortemAccess,
    incidentPostmortemValidation,
    validateRequest,
    postmortemController.getPostmortemByIncidentId
);

module.exports = router;