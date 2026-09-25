const incidentService = require("../services/incidentService");

function getIdempotencyKey(req) {
    return req.headers["idempotency-key"];
}

async function createIncident(req, res) {
    try {
        const idempotencyKey = getIdempotencyKey(req);

        if (!idempotencyKey) {
            return res.status(400).json({
                success: false,
                message: "Idempotency-Key header is required.",
            });
        }

        const incident = await incidentService.createIncident({
            title: req.body.title,
            description: req.body.description,
            severity: req.body.severity,
            ownerUserId: req.user.id,
            idempotencyKey,
        });

        return res.status(201).json({
            success: true,
            message: "Incident created successfully.",
            data: incident,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to create incident.",
        });
    }
}

async function getIncidents(req, res) {
    try {
        const incidents = await incidentService.getIncidents();

        return res.status(200).json({
            success: true,
            data: incidents,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to retrieve incidents.",
        });
    }
}

async function getIncidentById(req, res) {
    try {
        const incident = await incidentService.getIncidentById(req.params.id);

        return res.status(200).json({
            success: true,
            data: incident,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to retrieve incident.",
        });
    }
}

async function updateIncidentStatus(req, res) {
    try {
        const incident = await incidentService.updateIncidentStatus(
            req.params.id,
            req.body.status
        );

        return res.status(200).json({
            success: true,
            message: "Incident status updated successfully.",
            data: incident,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to update incident status.",
        });
    }
}

async function addIncidentEvent(req, res) {
    try {
        const event = await incidentService.addIncidentEvent({
            incidentId: req.params.id,
            actorUserId: req.user.id,
            eventType: req.body.eventType,
            message: req.body.message,
        });

        return res.status(201).json({
            success: true,
            message: "Incident event added successfully.",
            data: event,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to add incident event.",
        });
    }
}

async function getIncidentEvents(req, res) {
    try {
        const events = await incidentService.getIncidentEvents(req.params.id);

        return res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to retrieve incident events.",
        });
    }
}

module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncidentStatus,
    addIncidentEvent,
    getIncidentEvents,
};