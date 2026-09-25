module.exports = {
    testEnvironment: "node",
    testMatch: [
        "**/tests/**/*.test.js",
    ],
    setupFilesAfterEnv: [
        "<rootDir>/tests/setup.js",
    ],
    clearMocks: true,
    forceExit: false,
    detectOpenHandles: true,
};