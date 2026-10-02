const growthEventRepository = require("../persistence/growthEventRepository");

async function emitEvent({
    eventType,
    version = 1,
    aggregateType,
    aggregateId,
    payload = {},
    idempotencyKey,
}) {
    if (!eventType || !aggregateType || aggregateId === undefined || !idempotencyKey) {
        throw new Error("eventType, aggregateType, aggregateId and idempotencyKey are required");
    }

    const existing = await growthEventRepository.getEventByIdempotencyKey(
        idempotencyKey,
    );

    if (existing) {
        return {
            event: existing,
            idempotent: true,
        };
    }

    try {
        const event = await growthEventRepository.createEvent({
            eventType,
            version,
            aggregateType,
            aggregateId,
            payload,
            idempotencyKey,
        });

        return {
            event,
            idempotent: false,
        };
    } catch (error) {
        const existingAfterConflict =
            await growthEventRepository.getEventByIdempotencyKey(idempotencyKey);

        if (existingAfterConflict) {
            return {
                event: existingAfterConflict,
                idempotent: true,
            };
        }

        throw error;
    }
}

async function getPendingEvents(limit = 100) {
    return growthEventRepository.getPendingEvents(limit);
}

async function markEventProcessed(id) {
    return growthEventRepository.markEventProcessed(id);
}

async function replayEvents(eventType) {
    return growthEventRepository.getEventsForReplay(eventType);
}

module.exports = {
    emitEvent,
    getPendingEvents,
    markEventProcessed,
    replayEvents,
};
