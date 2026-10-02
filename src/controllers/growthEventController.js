const growthEventService = require("../services/growthEventService");

async function emitEvent(req, res) {
    try {
        const result = await growthEventService.emitEvent({
            eventType: req.body.eventType,
            version: req.body.version,
            aggregateType: req.body.aggregateType,
            aggregateId: req.body.aggregateId,
            payload: req.body.payload,
            idempotencyKey:
                req.body.idempotencyKey ||
                req.headers["idempotency-key"],
        });

        return res.status(result.idempotent ? 200 : 201).json({
            success: true,
            idempotent: result.idempotent,
            data: result.event,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to emit growth event.",
        });
    }
}

async function getPendingEvents(req, res) {
    try {
        const events = await growthEventService.getPendingEvents(
            Number(req.query.limit) || 100,
        );

        return res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to retrieve pending events.",
        });
    }
}

async function replayEvents(req, res) {
    try {
        const events = await growthEventService.replayEvents(
            req.query.eventType,
        );

        return res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to replay events.",
        });
    }
}

module.exports = {
    emitEvent,
    getPendingEvents,
    replayEvents,
};