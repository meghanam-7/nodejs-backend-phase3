const REQUIRED_PRODUCTION_ENV = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
];

function validateProductionConfig() {
    if (process.env.NODE_ENV !== "production") {
        return;
    }

    const missing = REQUIRED_PRODUCTION_ENV.filter(
        (key) => !process.env[key]
    );

    if (missing.length > 0) {
        throw new Error(
            `Missing required production configuration: ${missing.join(", ")}`
        );
    }

    if (process.env.JWT_SECRET.length < 32) {
        throw new Error(
            "JWT_SECRET must be at least 32 characters in production."
        );
    }
}

module.exports = {
    validateProductionConfig,
};