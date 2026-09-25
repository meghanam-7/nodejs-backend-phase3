const userService = require("../services/userService");

async function deleteOwnAccount(req, res) {
    try {
        await userService.deleteOwnAccount(req.user.id);

        res.status(200).json({
            success: true,
            message: "Account and associated data deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

async function getOwnData(req, res) {
    try {
        const data = await userService.getOwnData(req.user.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = {
    deleteOwnAccount,
    getOwnData,
};