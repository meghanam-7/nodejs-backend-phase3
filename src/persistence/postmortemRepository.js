const prisma = require("../config/prismaClient");

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
    try {
        return await prisma.postmortem.create({
            data: {
                incidentId: Number(incidentId),
                createdByUserId,
                summary,
                impact,
                rootCause,
                timeline: timeline || null,
                correctiveActions,
                preventiveActions,
                idempotencyKey,
            },
        });
    } catch (error) {
        if (error?.code === "P2002") {
            return prisma.postmortem.findUnique({
                where: { idempotencyKey },
            });
        }

        throw error;
    }
}

async function getPostmortemByIncidentId(incidentId) {
    return prisma.postmortem.findUnique({
        where: {
            incidentId: Number(incidentId),
        },
        include: {
            incident: {
                select: {
                    id: true,
                    title: true,
                    severity: true,
                    status: true,
                    ownerUserId: true,
                    detectedAt: true,
                    resolvedAt: true,
                    closedAt: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
}

module.exports = {
    createPostmortem,
    getPostmortemByIncidentId,
};