let cacheHits = 0;
let cacheMisses = 0;

let cacheHitLatencies = [];
let cacheMissLatencies = [];

const recordCacheHit = (latency) => {
    cacheHits++;
    cacheHitLatencies.push(latency);
};

const recordCacheMiss = (latency) => {
    cacheMisses++;
    cacheMissLatencies.push(latency);
};

const calculateAverage = (values) => {
    if (values.length === 0) {
        return 0;
    }

    const total = values.reduce((sum, value) => sum + value, 0);

    return Number((total / values.length).toFixed(2));
};

const getCacheMetrics = () => {
    const totalRequests = cacheHits + cacheMisses;

    const hitRatio =
        totalRequests === 0
            ? 0
            : (cacheHits / totalRequests) * 100;

    const averageCacheLatency = calculateAverage(cacheHitLatencies);
    const averageDatabaseLatency = calculateAverage(cacheMissLatencies);

    let latencyImprovement = 0;

    if (averageDatabaseLatency > 0) {
        latencyImprovement =
            ((averageDatabaseLatency - averageCacheLatency) /
                averageDatabaseLatency) *
            100;
    }

    return {
        cacheHits,
        cacheMisses,
        totalRequests,
        hitRatio: Number(hitRatio.toFixed(2)),
        averageCacheLatency,
        averageDatabaseLatency,
        latencyImprovement: Number(latencyImprovement.toFixed(2)),
    };
};

const resetCacheMetrics = () => {
    cacheHits = 0;
    cacheMisses = 0;
    cacheHitLatencies = [];
    cacheMissLatencies = [];
};

module.exports = {
    recordCacheHit,
    recordCacheMiss,
    getCacheMetrics,
    resetCacheMetrics,
};