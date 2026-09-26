const prisma = require("../config/prismaClient");

async function createSlo({
    name,
    endpoint,
    method,
    description,
    availabilityTarget,
    latencyTargetMs,
    correctnessTarget,
    window,
}) {
    return prisma.slo.create({
        data: {
            name,
            endpoint,
            method,
            description: description || null,
            availabilityTarget,
            latencyTargetMs,
            correctnessTarget,
            window: window || "30d",
        },
    });
}

async function getSloById(id) {
    return prisma.slo.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            measurements: {
                orderBy: {
                    windowStart: "desc",
                },
            },
        },
    });
}

async function getSloByEndpoint(method, endpoint) {
    return prisma.slo.findUnique({
        where: {
            method_endpoint: {
                method,
                endpoint,
            },
        },
    });
}

async function getSloByIdForUpdate(id) {
    return prisma.slo.findUnique({
        where: {
            id: Number(id),
        },
    });
}

async function getSlos() {
    return prisma.slo.findMany({
        where: {
            enabled: true,
        },
        include: {
            measurements: {
                orderBy: {
                    windowStart: "desc",
                },
                take: 1,
            },
        },
        orderBy: [
            {
                endpoint: "asc",
            },
            {
                method: "asc",
            },
        ],
    });
}

async function createMeasurement({
    sloId,
    windowStart,
    windowEnd,
    requestCount,
    successCount,
    errorCount,
    correctCount,
    latencyP95Ms,
    availability,
    correctness,
    errorBudgetUsed,
}) {
    return prisma.sloMeasurement.upsert({
        where: {
            sloId_windowStart_windowEnd: {
                sloId: Number(sloId),
                windowStart,
                windowEnd,
            },
        },
        update: {
            requestCount,
            successCount,
            errorCount,
            correctCount,
            latencyP95Ms,
            availability,
            correctness,
            errorBudgetUsed,
        },
        create: {
            sloId: Number(sloId),
            windowStart,
            windowEnd,
            requestCount,
            successCount,
            errorCount,
            correctCount,
            latencyP95Ms,
            availability,
            correctness,
            errorBudgetUsed,
        },
    });
}

async function getMeasurements(sloId) {
    return prisma.sloMeasurement.findMany({
        where: {
            sloId: Number(sloId),
        },
        orderBy: {
            windowStart: "desc",
        },
    });
}

module.exports = {
    createSlo,
    getSloById,
    getSloByEndpoint,
    getSloByIdForUpdate,
    getSlos,
    createMeasurement,
    getMeasurements,
};