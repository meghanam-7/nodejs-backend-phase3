const postmortemRepository = require("../persistence/postmortemRepository");
const incidentRepository = require("../persistence/incidentRepository");

function createServiceError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function createPostmortem({
    incidentId,
    createdByUserId,
    summary,
    impact,
    rootCause,
    timeline,
    correctiveActions,
    preventiveActions,
    idempotencyKey,
}) {
    const incident = await incidentRepository.getIncidentById(
        incidentId
    );

    if (!incident) {
        throw createServiceError(
            "Incident not found.",
            404
        );
    }

    if (
        incident.status !== "RESOLVED" &&
        incident.status !== "CLOSED"
    ) {
        throw createServiceError(
            "Postmortem can only be created for a resolved or closed incident.",
            409
        );
    }

    const existingPostmortem =
        await postmortemRepository.getPostmortemByIncidentId(
            incidentId
        );

    if (existingPostmortem) {
        if (
            existingPostmortem.idempotencyKey ===
            idempotencyKey
        ) {
            return existingPostmortem;
        }

        throw createServiceError(
            "A postmortem already exists for this incident.",
            409
        );
    }

    if (!idempotencyKey) {
        throw createServiceError(
            "Idempotency-Key header is required.",
            400
        );
    }

    return postmortemRepository.createPostmortem({
        incidentId,
        createdByUserId,
        summary,
        impact,
        rootCause,
        timeline,
        correctiveActions,
        preventiveActions,
        idempotencyKey,
    });
}

async function getPostmortemByIncidentId(incidentId) {
    const incident = await incidentRepository.getIncidentById(
        incidentId
    );

    if (!incident) {
        throw createServiceError(
            "Incident not found.",
            404
        );
    }

    const postmortem =
        await postmortemRepository.getPostmortemByIncidentId(
            incidentId
        );

    if (!postmortem) {
        throw createServiceError(
            "Postmortem not found.",
            404
        );
    }

    return postmortem;
}

module.exports = {
    createPostmortem,
    getPostmortemByIncidentId,
};