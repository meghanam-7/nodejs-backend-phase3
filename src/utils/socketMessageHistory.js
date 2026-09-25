const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL);

const HISTORY_LIMIT = 50;
const HISTORY_TTL = 60 * 60; // 1 hour

async function storeRoomMessage(roomName, messageData) {
    const key = `socket:room:${roomName}:messages`;

    const message = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        room: roomName,
        message: messageData.message,
        timestamp: Date.now(),
    };

    await redis.lpush(key, JSON.stringify(message));
    await redis.ltrim(key, 0, HISTORY_LIMIT - 1);
    await redis.expire(key, HISTORY_TTL);

    return message;
}

async function getMessagesAfter(roomName, lastMessageId) {
    const key = `socket:room:${roomName}:messages`;

    const rawMessages = await redis.lrange(key, 0, HISTORY_LIMIT - 1);

    const messages = rawMessages
        .map((item) => JSON.parse(item))
        .reverse();

    if (!lastMessageId) {
        return messages;
    }

    const index = messages.findIndex(
        (message) => message.id === lastMessageId
    );

    if (index === -1) {
        return messages;
    }

    return messages.slice(index + 1);
}

module.exports = {
    storeRoomMessage,
    getMessagesAfter,
};