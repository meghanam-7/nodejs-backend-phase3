const express = require("express");

const router = express.Router();

const {
    authenticateToken,
} = require("../middleware/authMiddleware");

const {
    requireRole,
} = require("../middleware/authorizationMiddleware");

const {
    fetchUsers,
    fetchProducts,
    fetchOrders,
    fetchUsersWithOrders,
    fetchOrdersWithDetails,
    fetchProductsWithOrders,
    createProductHandler,
    updateProductHandler,
    deleteProductHandler,
} = require("../controllers/mockController");

// Users
router.get(
    "/api/users",
    authenticateToken,
    fetchUsers
);

// Products - read access
router.get(
    "/api/products",
    authenticateToken,
    fetchProducts
);

// Products - write access
router.post(
    "/api/products",
    authenticateToken,
    requireRole("ADMIN"),
    createProductHandler
);

router.put(
    "/api/products/:id",
    authenticateToken,
    requireRole("ADMIN"),
    updateProductHandler
);

router.delete(
    "/api/products/:id",
    authenticateToken,
    requireRole("ADMIN"),
    deleteProductHandler
);

// Orders
router.get(
    "/api/orders",
    authenticateToken,
    fetchOrders
);

router.get(
    "/api/users/orders",
    authenticateToken,
    fetchUsersWithOrders
);

router.get(
    "/api/orders/details",
    authenticateToken,
    fetchOrdersWithDetails
);

router.get(
    "/api/products/orders",
    authenticateToken,
    fetchProductsWithOrders
);

module.exports = router;