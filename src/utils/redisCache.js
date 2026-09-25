const redisConnection = require("../config/redisConnection");

// Get data from Redis
const getCache = async (key) => {
    try {
        const data = await redisConnection.get(key);

        if (!data) {
            return null;
        }

        return JSON.parse(data);
    } catch (error) {
        console.error("❌ Redis GET error:", error.message);
        return null;
    }
};

// Store data in Redis with TTL
const setCache = async (key, data, ttl) => {
    try {
        const result = await redisConnection.set(
            key,
            JSON.stringify(data),
            "EX",
            ttl
        );

        console.log(`✅ Redis SET: ${key} | TTL: ${ttl}s | Result: ${result}`);

    } catch (error) {
        console.error("❌ Redis SET error:", error.message);
    }
};

// Delete cache
const deleteCache = async (key) => {
    try {
        await redisConnection.del(key);
    } catch (error) {
        console.error("❌ Redis DELETE error:", error.message);
    }
};

module.exports = {
    getCache,
    setCache,
    deleteCache,
};