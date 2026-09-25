const {
    getAllUsers,
    getAllProducts,
    getAllOrders,
    getAllUsersWithOrders,
    getAllOrdersWithDetails,
    getAllProductsWithOrders,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../services/mockService");

const cache = require("../utils/cache");

const {
    getCache,
    setCache,
} = require("../utils/redisCache");

const {
    recordCacheHit,
    recordCacheMiss,
} = require("../utils/cacheMetrics");

const CACHE_TTL = require("../config/cacheConfig");

const {
    acquireLock,
    releaseLock,
    isLocked,
} = require("../utils/cacheLock");

const {
    invalidateProductsCache,
} = require("../utils/cacheInvalidation");

// Get Users
const fetchUsers = async (req, res) => {

    console.time("Fetch Users API");

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const cacheKey = `users_${page}_${limit}`;

        // Check cache
        const cachedUsers = cache.get(cacheKey);

        if (cachedUsers) {

            console.timeEnd("Fetch Users API");

            return res.status(200).json({
                success: true,
                message: "Users fetched from cache",
                data: cachedUsers,
            });
        }

        // Fetch from database
        const users = await getAllUsers(page, limit);

        // Store in cache
        cache.set(cacheKey, users);

        console.timeEnd("Fetch Users API");

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            page,
            limit,
            data: users,
        });

    } catch (error) {
        console.timeEnd("Fetch Users API");

        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message,
        });
    }
};

// Get Products
const fetchProducts = async (req, res) => {
    const startTime = process.hrtime.bigint();

    const cacheKey = "products";

    try {
        // Check Redis cache
        const cachedProducts = await getCache(cacheKey);

        if (cachedProducts) {
            const endTime = process.hrtime.bigint();

            const latency =
                Number(endTime - startTime) / 1_000_000;

            recordCacheHit(latency);

            return res.status(200).json({
                success: true,
                message: "Products fetched from Redis cache",
                source: "cache",
                data: cachedProducts,
            });
        }

        // Cache miss
        // Check whether another request is already loading the data
        if (!acquireLock(cacheKey)) {
            console.log(`⏳ Cache lock active for ${cacheKey}, waiting...`);

            // Wait for the request holding the lock to populate Redis
            while (isLocked(cacheKey)) {
                await new Promise((resolve) =>
                    setTimeout(resolve, 50)
                );
            }

            // Try Redis again after waiting
            const cachedProductsAfterWait = await getCache(cacheKey);

            if (cachedProductsAfterWait) {
                const endTime = process.hrtime.bigint();

                const latency =
                    Number(endTime - startTime) / 1_000_000;

                recordCacheHit(latency);

                return res.status(200).json({
                    success: true,
                    message: "Products fetched from Redis cache after waiting",
                    source: "cache",
                    data: cachedProductsAfterWait,
                });
            }
        }

        try {
            // Fetch from database
            const products = await getAllProducts();

            // Store in Redis
            await setCache(
                cacheKey,
                products,
                CACHE_TTL.PRODUCTS
            );

            const endTime = process.hrtime.bigint();

            const latency =
                Number(endTime - startTime) / 1_000_000;

            recordCacheMiss(latency);

            return res.status(200).json({
                success: true,
                message: "Products fetched successfully",
                source: "database",
                data: products,
            });

        } finally {
            // Always release the lock
            releaseLock(cacheKey);
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
};

// Create Product
const createProductHandler = async (req, res) => {
    try {
        const { name, price, stock } = req.body;

        const product = await createProduct({
            name,
            price: Number(price),
            stock: Number(stock),
        });

        // Invalidate product cache after successful database write
        await invalidateProductsCache();

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message,
        });
    }
};

// Update Product
const updateProductHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, stock } = req.body;

        const product = await updateProduct(id, {
            name,
            price: Number(price),
            stock: Number(stock),
        });

        // Invalidate product cache after successful database update
        await invalidateProductsCache();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message,
        });
    }
};

// Delete Product
const deleteProductHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await deleteProduct(id);

        // Invalidate product cache after successful database deletion
        await invalidateProductsCache();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message,
        });
    }
};

// Get Orders
const fetchOrders = async (req, res) => {
    try {
        const orders = await getAllOrders();

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

// Get users with orders
const fetchUsersWithOrders = async (req, res) => {
    try {
        const users = await getAllUsersWithOrders();

        res.status(200).json({
            success: true,
            message: "Users with orders fetched successfully",
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users with orders",
            error: error.message,
        });
    }
};

// Get orders with user & product
const fetchOrdersWithDetails = async (req, res) => {
    try {
        const orders = await getAllOrdersWithDetails();

        res.status(200).json({
            success: true,
            message: "Orders with details fetched successfully",
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

// Get products with orders
const fetchProductsWithOrders = async (req, res) => {
    try {
        const products = await getAllProductsWithOrders();

        res.status(200).json({
            success: true,
            message: "Products with orders fetched successfully",
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
};

module.exports = {
    fetchUsers,
    fetchProducts,
    fetchOrders,

    fetchUsersWithOrders,
    fetchOrdersWithDetails,
    fetchProductsWithOrders,

    createProductHandler,
    updateProductHandler,
    deleteProductHandler,
};