const postmortemService = require("../services/postmortemService");

async function createPostmortem(req, res) {
    try {
        const idempotencyKey = req.headers["idempotency-key"];

        if (!idempotencyKey) {
            return res.status(400).json({
                success: false,
                message: "Idempotency-Key header is required.",
            });
        }

        const postmortem =
            await postmortemService.createPostmortem({
                incidentId: req.params.incidentId,
                createdByUserId: req.user.id,
                summary: req.body.summary,
                impact: req.body.impact,
                rootCause: req.body.rootCause,
                timeline: req.body.timeline,
                correctiveActions: req.body.correctiveActions,
                preventiveActions: req.body.preventiveActions,
                idempotencyKey,
            });

        return res.status(201).json({
            success: true,
            message: "Postmortem created successfully.",
            data: postmortem,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message || "Unable to create postmortem.",
        });
    }
}

async function getPostmortemByIncidentId(req, res) {
    try {
        const postmortem =
            await postmortemService.getPostmortemByIncidentId(
                req.params.incidentId
            );

        return res.status(200).json({
            success: true,
            data: postmortem,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Unable to retrieve postmortem.",
        });
    }
}

module.exports = {
    createPostmortem,
    getPostmortemByIncidentId,
};