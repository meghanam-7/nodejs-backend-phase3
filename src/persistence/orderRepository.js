const prisma = require("../config/prismaClient");

// Get all orders
async function getAllOrders() {
    return await prisma.order.findMany({
        include: {
            user: true,
            product: true,
        },
        orderBy: {
            id: "asc",
        },
    });
}

// Get order by ID
async function getOrderById(id) {
    return await prisma.order.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            user: true,
            product: true,
        },
    });
}

module.exports = {
    getAllOrders,
    getOrderById,
};