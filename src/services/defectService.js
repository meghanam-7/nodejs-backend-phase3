const defectRepository = require("../persistence/defectRepository");
const incidentRepository = require("../persistence/incidentRepository");

const STATUS_TRANSITIONS = {
    OPEN: ["TRIAGED"],
    TRIAGED: ["IN_PROGRESS"],
    IN_PROGRESS: ["FIXED"],
    FIXED: ["VERIFIED"],
    VERIFIED: ["CLOSED"],
    CLOSED: [],
};

function createServiceError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function createDefect({
    incidentId,
    title,
    description,
    severity,
    priority,
    ownerUserId,
    source,
    endpoint,
    httpStatus,
    evidence,
    idempotencyKey,
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
            "Cannot add a defect to a closed incident.",
            409
        );
    }

    if (!idempotencyKey) {
        throw createServiceError(
            "Idempotency-Key header is required.",
            400
        );
    }

    return defectRepository.createDefect({
        incidentId,
        title,
        description,
        severity,
        priority,
        ownerUserId,
        source,
        endpoint,
        httpStatus,
        evidence,
        idempotencyKey,
    });
}

async function getDefectsByIncidentId(incidentId) {
    const incident = await incidentRepository.getIncidentById(incidentId);

    if (!incident) {
        throw createServiceError(
            "Incident not found.",
            404
        );
    }

    return defectRepository.getDefectsByIncidentId(incidentId);
}

async function getDefectById(id) {
    const defect = await defectRepository.getDefectById(id);

    if (!defect) {
        throw createServiceError(
            "Defect not found.",
            404
        );
    }

    return defect;
}

async function getRankedDefects() {
    return defectRepository.getRankedDefects();
}

async function updateDefectStatus(id, newStatus) {
    const defect = await defectRepository.getDefectById(id);

    if (!defect) {
        throw createServiceError(
            "Defect not found.",
            404
        );
    }

    const allowedTransitions =
        STATUS_TRANSITIONS[defect.status] || [];

    if (!allowedTransitions.includes(newStatus)) {
        throw createServiceError(
            `Invalid defect status transition from ${defect.status} to ${newStatus}.`,
            409
        );
    }

    return defectRepository.updateDefectStatus(id, newStatus);
}

module.exports = {
    createDefect,
    getDefectsByIncidentId,
    getDefectById,
    getRankedDefects,
    updateDefectStatus,
};