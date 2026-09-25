const prisma = require("../config/prismaClient");

// Get all products
async function getAllProducts() {
    return await prisma.product.findMany({
        orderBy: {
            id: "asc",
        },
    });
}

// Get product by ID
async function getProductById(id) {
    return await prisma.product.findUnique({
        where: {
            id: Number(id),
        },
    });
}

// Create product
async function createProduct(productData) {
    try {
        return await prisma.product.create({
            data: productData,
        });
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);

        throw new Error(
            `Database error while creating product: ${error.message}`
        );
    }
}

// Update product
async function updateProduct(id, productData) {
    try {
        const productId = Number(id);

        return await prisma.product.update({
            where: {
                id: productId,
            },
            data: productData,
        });
    } catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);

        throw new Error(
            `Database error while updating product: ${error.message}`
        );
    }
}

// Delete product
async function deleteProduct(id) {
    try {
        const productId = Number(id);

        return await prisma.product.delete({
            where: {
                id: productId,
            },
        });
    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);

        throw new Error(
            `Database error while deleting product: ${error.message}`
        );
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};