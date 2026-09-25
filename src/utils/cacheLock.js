const locks = new Map();

const acquireLock = (key) => {
    if (locks.has(key)) {
        return false;
    }

    locks.set(key, true);

    return true;
};

const releaseLock = (key) => {
    locks.delete(key);
};

const isLocked = (key) => {
    return locks.has(key);
};

module.exports = {
    acquireLock,
    releaseLock,
    isLocked,
};