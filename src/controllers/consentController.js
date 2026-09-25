const consentService = require("../services/consentService");

// Get authenticated user's consents
async function getConsents(req, res) {
    try {
        const consents = await consentService.getUserConsents(req.user.id);

        res.status(200).json({
            success: true,
            data: consents,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// Grant or withdraw consent
async function updateConsent(req, res) {
    try {
        const consent = await consentService.updateConsent(
            req.user.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Consent updated successfully",
            data: consent,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = {
    getConsents,
    updateConsent,
};