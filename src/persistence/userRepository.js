const prisma = require("../config/prismaClient");

// Get all users
async function getAllUsers(page = 1, limit = 5) {
    return await prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
            id: "asc",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
}

// Get user by ID
async function getUserById(id) {
    return await prisma.user.findUnique({
        where: {
            id: Number(id),
        },
    });
}

// Get user by email
async function getUserByEmail(email) {
    return await prisma.user.findUnique({
        where: {
            email,
        },
    });
}

// Create user
async function createUser(userData) {
    try {
        return await prisma.user.create({
            data: userData,
        });
    } catch (error) {
        throw new Error(`Database error while creating user: ${error.message}`);
    }
}

// Update user
async function updateUser(id, userData) {
    try {
        return await prisma.user.update({
            where: {
                id: Number(id),
            },
            data: userData,
        });
    } catch (error) {
        throw new Error(`Database error while updating user: ${error.message}`);
    }
}

// Delete user
async function deleteUser(id) {
    try {
        return await prisma.user.delete({
            where: {
                id: Number(id),
            },
        });
    } catch (error) {
        throw new Error(`Database error while deleting user: ${error.message}`);
    }
}

// Get logged-in user's data
async function getUserWithData(id) {
    try {
        return await prisma.user.findUnique({
            where: {
                id: Number(id),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                applications: true,
                payments: true,
                offers: true,
                interviews: true,
                consents: true,
                orders: true,
            },
        });
    } catch (error) {
        throw new Error(`Database error while fetching user data: ${error.message}`);
    }
}

// Transaction Example
async function createUserAndProduct(userData, productData) {
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: userData,
        });

        const product = await tx.product.create({
            data: productData,
        });

        return {
            user,
            product,
        };
    });
}

// Get all users with their orders
async function getUsersWithOrders() {
    return await prisma.user.findMany({
        include: {
            orders: true,
        },
        orderBy: {
            id: "asc",
        },
    });
}

// Get all orders with user and product details
async function getOrdersWithDetails() {
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

// Get all products with their orders
async function getProductsWithOrders() {
    return await prisma.product.findMany({
        include: {
            orders: true,
        },
        orderBy: {
            id: "asc",
        },
    });
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    getUserWithData,
    createUserAndProduct,

    getUsersWithOrders,
    getOrdersWithDetails,
    getProductsWithOrders,
};