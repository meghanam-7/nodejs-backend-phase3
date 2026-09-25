const prisma = require("../config/prismaClient");

async function createIncident({
    title,
    description,
    severity,
    ownerUserId,
    idempotencyKey,
}) {
    try {
        return await prisma.incident.create({
            data: {
                title,
                description: description || null,
                severity,
                ownerUserId,
                idempotencyKey,
            },
        });
    } catch (error) {
        if (error?.code === "P2002") {
            return prisma.incident.findUnique({
                where: { idempotencyKey },
            });
        }

        throw error;
    }
}

async function getIncidents() {
    return prisma.incident.findMany({
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
        ],
    });
}

async function getIncidentById(id) {
    return prisma.incident.findUnique({
        where: { id: Number(id) },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            events: {
                include: {
                    actor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
            },
            defects: {
                orderBy: [
                    { priority: "asc" },
                    { createdAt: "asc" },
                ],
            },
            postmortem: true,
        },
    });
}

async function updateIncidentStatus(id, status) {
    return prisma.incident.update({
        where: { id: Number(id) },
        data: {
            status,
            ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
            ...(status === "CLOSED" ? { closedAt: new Date() } : {}),
        },
    });
}

async function createIncidentEvent({
    incidentId,
    actorUserId,
    eventType,
    message,
}) {
    return prisma.incidentEvent.create({
        data: {
            incidentId: Number(incidentId),
            actorUserId,
            eventType,
            message,
        },
    });
}

async function getIncidentEvents(incidentId) {
    return prisma.incidentEvent.findMany({
        where: {
            incidentId: Number(incidentId),
        },
        include: {
            actor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncidentStatus,
    createIncidentEvent,
    getIncidentEvents,
};