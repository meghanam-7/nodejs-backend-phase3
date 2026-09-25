const incidentRepository = require("../persistence/incidentRepository");

const STATUS_TRANSITIONS = {
    OPEN: ["TRIAGING"],
    TRIAGING: ["MITIGATING"],
    MITIGATING: ["RESOLVED"],
    RESOLVED: ["CLOSED"],
    CLOSED: [],
};

function createServiceError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function createIncident({
    title,
    description,
    severity,
    ownerUserId,
    idempotencyKey,
}) {
    const existingIncident = await incidentRepository.createIncident({
        title,
        description,
        severity,
        ownerUserId,
        idempotencyKey,
    });

    if (!existingIncident) {
        throw createServiceError(
            "Unable to create incident.",
            500
        );
    }

    return existingIncident;
}

async function getIncidents() {
    return incidentRepository.getIncidents();
}

async function getIncidentById(id) {
    const incident = await incidentRepository.getIncidentById(id);

    if (!incident) {
        throw createServiceError(
            "Incident not found.",
            404
        );
    }

    return incident;
}

async function updateIncidentStatus(id, newStatus) {
    const incident = await incidentRepository.getIncidentById(id);

    if (!incident) {
        throw createServiceError(
            "Incident not found.",
            404
        );
    }

    const allowedTransitions = STATUS_TRANSITIONS[incident.status] || [];

    if (!allowedTransitions.includes(newStatus)) {
        throw createServiceError(
            `Invalid incident status transition from ${incident.status} to ${newStatus}.`,
            409
        );
    }

    return incidentRepository.updateIncidentStatus(id, newStatus);
}

async function addIncidentEvent({
    incidentId,
    actorUserId,
    eventType,
    message,
}) {
    const incident = await incidentRepository.getIncidentById(incidentId);

    if (!incident) {
        throw createServiceError(
            "Incident not found.",
            404
        );
    }

    if (incident.status === "CLOSED") {
        throw createServiceError(
            "Cannot add events to a closed incident.",
            409
        );
    }

    return incidentRepository.createIncidentEvent({
        incidentId,
        actorUserId,
        eventType,
        message,
    });
}

async function getIncidentEvents(incidentId) {
    const incident = await incidentRepository.getIncidentById(incidentId);

    if (!incident) {
        throw createServiceError(
            "Incident not found.",
            404
        );
    }

    return incidentRepository.getIncidentEvents(incidentId);
}

module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncidentStatus,
    addIncidentEvent,
    getIncidentEvents,
};