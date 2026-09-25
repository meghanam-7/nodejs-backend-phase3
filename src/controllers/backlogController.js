const backlogService = require("../services/backlogService");

async function createBacklogItem(req, res) {
    try {
        const idempotencyKey = req.headers["idempotency-key"];

        if (!idempotencyKey) {
            return res.status(400).json({
                success: false,
                message: "Idempotency-Key header is required.",
            });
        }

        const backlogItem = await backlogService.createBacklogItem({
            defectId: req.params.defectId,
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority,
            ownerUserId: req.user.id,
            dueDate: req.body.dueDate,
            idempotencyKey,
        });

        return res.status(201).json({
            success: true,
            message: "Backlog item created successfully.",
            data: backlogItem,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message || "Unable to create backlog item.",
        });
    }
}

async function getBacklogItemsByDefectId(req, res) {
    try {
        const backlogItems =
            await backlogService.getBacklogItemsByDefectId(
                req.params.defectId
            );

        return res.status(200).json({
            success: true,
            data: backlogItems,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Unable to retrieve backlog items.",
        });
    }
}

async function getBacklogItemById(req, res) {
    try {
        const backlogItem =
            await backlogService.getBacklogItemById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: backlogItem,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Unable to retrieve backlog item.",
        });
    }
}

async function getRankedBacklogItems(req, res) {
    try {
        const backlogItems =
            await backlogService.getRankedBacklogItems();

        return res.status(200).json({
            success: true,
            data: backlogItems,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Unable to retrieve ranked backlog items.",
        });
    }
}

async function updateBacklogItemStatus(req, res) {
    try {
        const backlogItem =
            await backlogService.updateBacklogItemStatus(
                req.params.id,
                req.body.status
            );

        return res.status(200).json({
            success: true,
            message:
                "Backlog item status updated successfully.",
            data: backlogItem,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Unable to update backlog item status.",
        });
    }
}

module.exports = {
    createBacklogItem,
    getBacklogItemsByDefectId,
    getBacklogItemById,
    getRankedBacklogItems,
    updateBacklogItemStatus,
};