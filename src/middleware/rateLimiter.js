const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisConnection = require("../config/redisConnection");

// General API rate limiter
const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: process.env.NODE_ENV === "test" ? 1000 : 100,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    store: new RedisStore({
        sendCommand: (...args) => redisConnection.call(...args),
    }),

    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

// Stricter limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === "test" ? 1000 : 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    store: new RedisStore({
        sendCommand: (...args) => redisConnection.call(...args),
    }),

    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later.",
    },
});

module.exports = {
    apiRateLimiter,
    authLimiter,
};