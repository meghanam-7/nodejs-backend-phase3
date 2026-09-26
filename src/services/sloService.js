const sloRepository = require("../persistence/sloRepository");

function createServiceError(message, statusCode) {
const error = new Error(message);
error.statusCode = statusCode;
return error;
}

function validatePercentage(value, fieldName) {
if (
typeof value !== "number" ||
Number.isNaN(value) ||
value < 0 ||
value > 100
) {
throw createServiceError(
`${fieldName} must be a number between 0 and 100.`,
400
);
}
}

async function createSlo({
name,
endpoint,
method,
description,
availabilityTarget,
latencyTargetMs,
correctnessTarget,
window,
}) {
validatePercentage(
availabilityTarget,
"availabilityTarget"
);

validatePercentage(
    correctnessTarget,
    "correctnessTarget"
);

if (
    !Number.isInteger(latencyTargetMs) ||
    latencyTargetMs <= 0
) {
    throw createServiceError(
        "latencyTargetMs must be a positive integer.",
        400
    );
}

const normalizedMethod = method.toUpperCase();

const existingSlo =
    await sloRepository.getSloByEndpoint(
        normalizedMethod,
        endpoint
    );

if (existingSlo) {
    throw createServiceError(
        "An SLO already exists for this HTTP method and endpoint.",
        409
    );
}

return sloRepository.createSlo({
    name,
    endpoint,
    method: normalizedMethod,
    description,
    availabilityTarget,
    latencyTargetMs,
    correctnessTarget,
    window,
});

}

async function getSlos() {
return sloRepository.getSlos();
}

async function getSloById(id) {
const slo = await sloRepository.getSloById(id);

if (!slo) {
    throw createServiceError(
        "SLO not found.",
        404
    );
}

return slo;

}

async function calculateMeasurement({
sloId,
windowStart,
windowEnd,
requestCount,
successCount,
errorCount,
correctCount,
latencyP95Ms,
}) {
const slo =
await sloRepository.getSloByIdForUpdate(
sloId
);

if (!slo) {
    throw createServiceError(
        "SLO not found.",
        404
    );
}

if (requestCount < 0) {
    throw createServiceError(
        "requestCount cannot be negative.",
        400
    );
}

if (
    successCount < 0 ||
    errorCount < 0 ||
    correctCount < 0
) {
    throw createServiceError(
        "Measurement counts cannot be negative.",
        400
    );
}

if (
    successCount + errorCount >
    requestCount
) {
    throw createServiceError(
        "successCount + errorCount cannot exceed requestCount.",
        400
    );
}

if (correctCount > requestCount) {
    throw createServiceError(
        "correctCount cannot exceed requestCount.",
        400
    );
}

if (windowEnd <= windowStart) {
    throw createServiceError(
        "windowEnd must be after windowStart.",
        400
    );
}

const availability =
    requestCount === 0
        ? null
        : (successCount / requestCount) * 100;

const correctness =
    requestCount === 0
        ? null
        : (correctCount / requestCount) * 100;

const allowedErrorPercentage =
    100 - slo.availabilityTarget;

const actualErrorPercentage =
    availability === null
        ? null
        : 100 - availability;

let errorBudgetUsed = null;

if (
    actualErrorPercentage !== null
) {
    if (allowedErrorPercentage === 0) {
        errorBudgetUsed =
            actualErrorPercentage === 0
                ? 0
                : 100;
    } else {
        errorBudgetUsed =
            (actualErrorPercentage /
                allowedErrorPercentage) *
            100;
    }
}

return sloRepository.createMeasurement({
    sloId,
    windowStart,
    windowEnd,
    requestCount,
    successCount,
    errorCount,
    correctCount,
    latencyP95Ms:
        latencyP95Ms === undefined
            ? null
            : latencyP95Ms,
    availability,
    correctness,
    errorBudgetUsed,
});

}

async function getMeasurements(sloId) {
await getSloById(sloId);

return sloRepository.getMeasurements(
    sloId
);

}

async function getDashboard() {
const slos =
await sloRepository.getSlos();

return slos.map((slo) => {
    const measurement =
        slo.measurements[0] || null;

    const availabilityHealthy =
        !measurement ||
        measurement.availability === null ||
        measurement.availability >=
            slo.availabilityTarget;

    const latencyHealthy =
        !measurement ||
        measurement.latencyP95Ms === null ||
        measurement.latencyP95Ms <=
            slo.latencyTargetMs;

    const correctnessHealthy =
        !measurement ||
        measurement.correctness === null ||
        measurement.correctness >=
            slo.correctnessTarget;

    return {
        slo: {
            id: slo.id,
            name: slo.name,
            endpoint: slo.endpoint,
            method: slo.method,
            window: slo.window,
            availabilityTarget:
                slo.availabilityTarget,
            latencyTargetMs:
                slo.latencyTargetMs,
            correctnessTarget:
                slo.correctnessTarget,
        },
        measurement,
        status: {
            availability:
                availabilityHealthy
                    ? "WITHIN_SLO"
                    : "BREACHED",
            latency:
                latencyHealthy
                    ? "WITHIN_SLO"
                    : "BREACHED",
            correctness:
                correctnessHealthy
                    ? "WITHIN_SLO"
                    : "BREACHED",
        },
    };
});

}

module.exports = {
createSlo,
getSlos,
getSloById,
calculateMeasurement,
getMeasurements,
getDashboard,
};