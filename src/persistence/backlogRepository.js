const prisma = require("../config/prismaClient");

async function createBacklogItem({
    defectId,
    title,
    description,
    priority,
    ownerUserId,
    dueDate,
    idempotencyKey,
}) {
    try {
        return await prisma.backlogItem.create({
            data: {
                defectId: Number(defectId),
                title,
                description: description || null,
                priority,
                ownerUserId,
                dueDate: dueDate ? new Date(dueDate) : null,
                idempotencyKey,
            },
        });
    } catch (error) {
        if (error?.code === "P2002") {
            return prisma.backlogItem.findUnique({
                where: { idempotencyKey },
            });
        }

        throw error;
    }
}

async function getBacklogItemsByDefectId(defectId) {
    return prisma.backlogItem.findMany({
        where: {
            defectId: Number(defectId),
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

async function getBacklogItemById(id) {
    return prisma.backlogItem.findUnique({
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
            defect: {
                include: {
                    incident: {
                        select: {
                            id: true,
                            title: true,
                            severity: true,
                            status: true,
                        },
                    },
                },
            },
        },
    });
}

async function getRankedBacklogItems() {
    return prisma.backlogItem.findMany({
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            defect: {
                select: {
                    id: true,
                    title: true,
                    severity: true,
                    priority: true,
                    status: true,
                    incidentId: true,
                },
            },
        },
        orderBy: [
            { priority: "asc" },
            { dueDate: "asc" },
            { createdAt: "asc" },
        ],
    });
}

async function updateBacklogItemStatus(id, status) {
    return prisma.backlogItem.update({
        where: {
            id: Number(id),
        },
        data: {
            status,
        },
    });
}

module.exports = {
    createBacklogItem,
    getBacklogItemsByDefectId,
    getBacklogItemById,
    getRankedBacklogItems,
    updateBacklogItemStatus,
};