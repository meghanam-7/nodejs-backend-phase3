const prisma = require("../config/prismaClient");

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
    try {
        return await prisma.defect.create({
            data: {
                incidentId: Number(incidentId),
                title,
                description,
                severity,
                priority,
                ownerUserId,
                source,
                endpoint: endpoint || null,
                httpStatus: httpStatus || null,
                evidence: evidence || null,
                idempotencyKey,
            },
        });
    } catch (error) {
        if (error?.code === "P2002") {
            return prisma.defect.findUnique({
                where: { idempotencyKey },
            });
        }

        throw error;
    }
}

async function getDefectsByIncidentId(incidentId) {
    return prisma.defect.findMany({
        where: {
            incidentId: Number(incidentId),
        },
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
            { priority: "asc" },
            { createdAt: "asc" },
        ],
    });
}

async function getDefectById(id) {
    return prisma.defect.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            incident: true,
        },
    });
}

async function getRankedDefects() {
    return prisma.defect.findMany({
        include: {
            incident: {
                select: {
                    id: true,
                    title: true,
                    severity: true,
                    status: true,
                },
            },
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
            { priority: "asc" },
            { severity: "asc" },
            { occurrenceCount: "desc" },
            { createdAt: "asc" },
        ],
    });
}

async function updateDefectStatus(id, status) {
    return prisma.defect.update({
        where: {
            id: Number(id),
        },
        data: {
            status,
        },
    });
}

module.exports = {
    createDefect,
    getDefectsByIncidentId,
    getDefectById,
    getRankedDefects,
    updateDefectStatus,
};