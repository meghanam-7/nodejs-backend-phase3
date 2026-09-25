const consentRepository = require("../persistence/consentRepository");

// Get all consents for the authenticated user
async function getUserConsents(userId) {
    return await consentRepository.getUserConsents(userId);
}

// Grant or withdraw consent
async function updateConsent(userId, consentData) {
    const { purpose, granted, version } = consentData;

    if (!purpose || typeof granted !== "boolean" || !version) {
        throw new Error("purpose, granted, and version are required.");
    }

    return await consentRepository.upsertConsent(
        userId,
        purpose,
        granted,
        version
    );
}

module.exports = {
    getUserConsents,
    updateConsent,
};