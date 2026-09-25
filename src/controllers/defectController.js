const defectService = require("../services/defectService");

async function createDefect(req, res) {
    try {
        const idempotencyKey = req.headers["idempotency-key"];

        if (!idempotencyKey) {
            return res.status(400).json({
                success: false,
                message: "Idempotency-Key header is required.",
            });
        }

        const defect = await defectService.createDefect({
            incidentId: req.params.incidentId,
            title: req.body.title,
            description: req.body.description,
            severity: req.body.severity,
            priority: req.body.priority,
            ownerUserId: req.user.id,
            source: req.body.source,
            endpoint: req.body.endpoint,
            httpStatus: req.body.httpStatus,
            evidence: req.body.evidence,
            idempotencyKey,
        });

        return res.status(201).json({
            success: true,
            message: "Defect created successfully.",
            data: defect,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to create defect.",
        });
    }
}

async function getDefectsByIncidentId(req, res) {
    try {
        const defects = await defectService.getDefectsByIncidentId(
            req.params.incidentId
        );

        return res.status(200).json({
            success: true,
            data: defects,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to retrieve defects.",
        });
    }
}

async function getDefectById(req, res) {
    try {
        const defect = await defectService.getDefectById(req.params.id);

        return res.status(200).json({
            success: true,
            data: defect,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to retrieve defect.",
        });
    }
}

async function getRankedDefects(req, res) {
    try {
        const defects = await defectService.getRankedDefects();

        return res.status(200).json({
            success: true,
            data: defects,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to retrieve ranked defects.",
        });
    }
}

async function updateDefectStatus(req, res) {
    try {
        const defect = await defectService.updateDefectStatus(
            req.params.id,
            req.body.status
        );

        return res.status(200).json({
            success: true,
            message: "Defect status updated successfully.",
            data: defect,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to update defect status.",
        });
    }
}

module.exports = {
    createDefect,
    getDefectsByIncidentId,
    getDefectById,
    getRankedDefects,
    updateDefectStatus,
};