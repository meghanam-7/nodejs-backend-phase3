const prisma = require("../config/prismaClient");

async function createEvent({
    eventType,
    version,
    aggregateType,
    aggregateId,
    payload,
    idempotencyKey,
}) {
    return prisma.growthEvent.create({
        data: {
            eventType,
            version: version || 1,
            aggregateType,
            aggregateId: String(aggregateId),
            payload,
            idempotencyKey,
        },
    });
}

async function getEventByIdempotencyKey(idempotencyKey) {
    return prisma.growthEvent.findUnique({
        where: {
            idempotencyKey,
        },
    });
}

async function getPendingEvents(limit = 100) {
    return prisma.growthEvent.findMany({
        where: {
            status: "PENDING",
        },
        orderBy: {
            createdAt: "asc",
        },
        take: limit,
    });
}

async function markEventProcessed(id) {
    return prisma.growthEvent.update({
        where: {
            id: Number(id),
        },
        data: {
            status: "PROCESSED",
            processedAt: new Date(),
        },
    });
}

async function getEventsForReplay(eventType) {
    return prisma.growthEvent.findMany({
        where: {
            eventType,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

module.exports = {
    createEvent,
    getEventByIdempotencyKey,
    getPendingEvents,
    markEventProcessed,
    getEventsForReplay,
};