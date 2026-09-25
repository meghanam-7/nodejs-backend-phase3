const {
    getCacheMetrics,
    resetCacheMetrics,
} = require("../utils/cacheMetrics");

// Get cache metrics
const getMetrics = (req, res) => {
    const metrics = getCacheMetrics();

    res.status(200).json({
        success: true,
        message: "Cache metrics fetched successfully",
        metrics,
    });
};

// Reset cache metrics
const resetMetrics = (req, res) => {
    resetCacheMetrics();

    res.status(200).json({
        success: true,
        message: "Cache metrics reset successfully",
    });
};

module.exports = {
    getMetrics,
    resetMetrics,
};