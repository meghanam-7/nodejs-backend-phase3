const backlogRepository = require("../persistence/backlogRepository");
const defectRepository = require("../persistence/defectRepository");

const STATUS_TRANSITIONS = {
    TODO: ["IN_PROGRESS"],
    IN_PROGRESS: ["DONE"],
    DONE: ["VERIFIED"],
    VERIFIED: ["CLOSED"],
    CLOSED: [],
};

function createServiceError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function createBacklogItem({
    defectId,
    title,
    description,
    priority,
    ownerUserId,
    dueDate,
    idempotencyKey,
}) {
    const defect = await defectRepository.getDefectById(defectId);

    if (!defect) {
        throw createServiceError(
            "Defect not found.",
            404
        );
    }

    if (defect.status === "CLOSED") {
        throw createServiceError(
            "Cannot add a backlog item to a closed defect.",
            409
        );
    }

    if (!idempotencyKey) {
        throw createServiceError(
            "Idempotency-Key header is required.",
            400
        );
    }

    return backlogRepository.createBacklogItem({
        defectId,
        title,
        description,
        priority,
        ownerUserId,
        dueDate,
        idempotencyKey,
    });
}

async function getBacklogItemsByDefectId(defectId) {
    const defect = await defectRepository.getDefectById(defectId);

    if (!defect) {
        throw createServiceError(
            "Defect not found.",
            404
        );
    }

    return backlogRepository.getBacklogItemsByDefectId(defectId);
}

async function getBacklogItemById(id) {
    const backlogItem = await backlogRepository.getBacklogItemById(id);

    if (!backlogItem) {
        throw createServiceError(
            "Backlog item not found.",
            404
        );
    }

    return backlogItem;
}

async function getRankedBacklogItems() {
    return backlogRepository.getRankedBacklogItems();
}

async function updateBacklogItemStatus(id, newStatus) {
    const backlogItem = await backlogRepository.getBacklogItemById(id);

    if (!backlogItem) {
        throw createServiceError(
            "Backlog item not found.",
            404
        );
    }

    const allowedTransitions =
        STATUS_TRANSITIONS[backlogItem.status] || [];

    if (!allowedTransitions.includes(newStatus)) {
        throw createServiceError(
            `Invalid backlog status transition from ${backlogItem.status} to ${newStatus}.`,
            409
        );
    }

    return backlogRepository.updateBacklogItemStatus(
        id,
        newStatus
    );
}

module.exports = {
    createBacklogItem,
    getBacklogItemsByDefectId,
    getBacklogItemById,
    getRankedBacklogItems,
    updateBacklogItemStatus,
};