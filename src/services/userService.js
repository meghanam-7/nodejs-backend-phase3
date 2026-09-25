const userRepository = require("../persistence/userRepository");

async function deleteOwnAccount(userId) {
    return await userRepository.deleteUser(userId);
}

async function getOwnData(userId) {
    return await userRepository.getUserWithData(userId);
}

module.exports = {
    deleteOwnAccount,
    getOwnData,
};