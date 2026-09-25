const prisma = require("../config/prismaClient");

// Get consent by user and purpose
async function getConsent(userId, purpose) {
    return await prisma.consent.findUnique({
        where: {
            userId_purpose: {
                userId: Number(userId),
                purpose,
            },
        },
    });
}

// Get all consents for a user
async function getUserConsents(userId) {
    return await prisma.consent.findMany({
        where: {
            userId: Number(userId),
        },
        orderBy: {
            id: "asc",
        },
    });
}

// Create or update consent
async function upsertConsent(userId, purpose, granted, version) {
    return await prisma.consent.upsert({
        where: {
            userId_purpose: {
                userId: Number(userId),
                purpose,
            },
        },
        update: {
            granted,
            version,
            grantedAt: granted ? new Date() : undefined,
            withdrawnAt: granted ? null : new Date(),
        },
        create: {
            userId: Number(userId),
            purpose,
            granted,
            version,
            grantedAt: granted ? new Date() : null,
            withdrawnAt: granted ? null : new Date(),
        },
    });
}

module.exports = {
    getConsent,
    getUserConsents,
    upsertConsent,
};