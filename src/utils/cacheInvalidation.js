const { deleteCache } = require("./redisCache");

const PRODUCT_CACHE_KEY = "products";

// Invalidate product list cache
const invalidateProductsCache = async () => {
    await deleteCache(PRODUCT_CACHE_KEY);
    console.log(`🗑️ Cache invalidated: ${PRODUCT_CACHE_KEY}`);
};

module.exports = {
    PRODUCT_CACHE_KEY,
    invalidateProductsCache,
};