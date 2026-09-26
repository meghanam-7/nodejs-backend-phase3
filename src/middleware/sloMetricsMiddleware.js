const sloRepository = require("../persistence/sloRepository");

const buckets = new Map();

let cachedSlos = [];
let lastSloRefresh = 0;

const REFRESH_INTERVAL_MS = 10000;
const FLUSH_INTERVAL_MS = 10000;

function getBucketKey(method, endpoint) {
return `${method} ${endpoint}`;
}

function calculateP95(values) {
if (!values.length) {
return null;
}

const sorted = [...values].sort(
    (a, b) => a - b
);

const index =
    Math.ceil(0.95 * sorted.length) - 1;

return sorted[Math.max(0, index)];

}

async function refreshSlos() {
const now = Date.now();

if (
    now - lastSloRefresh <
    REFRESH_INTERVAL_MS
) {
    return cachedSlos;
}

cachedSlos =
    await sloRepository.getSlos();

lastSloRefresh = now;

return cachedSlos;

}

function recordRequest({
method,
endpoint,
statusCode,
durationMs,
}) {
const key = getBucketKey(
method,
endpoint
);

let bucket = buckets.get(key);

if (!bucket) {
    bucket = {
        method,
        endpoint,
        windowStart: new Date(),
        requestCount: 0,
        successCount: 0,
        errorCount: 0,
        correctCount: 0,
        latencies: [],
    };

    buckets.set(key, bucket);
}

bucket.requestCount += 1;

if (
    statusCode >= 200 &&
    statusCode < 400
) {
    bucket.successCount += 1;
    bucket.correctCount += 1;
} else {
    bucket.errorCount += 1;
}

bucket.latencies.push(durationMs);

}

async function flushBuckets() {
if (!buckets.size) {
return;
}

const activeSlos =
    await refreshSlos();

const sloMap = new Map(
    activeSlos.map((slo) => [
        getBucketKey(
            slo.method,
            slo.endpoint
        ),
        slo,
    ])
);

const entries =
    Array.from(buckets.entries());

buckets.clear();

for (const [, bucket] of entries) {
    const slo = sloMap.get(
        getBucketKey(
            bucket.method,
            bucket.endpoint
        )
    );

    if (
        !slo ||
        bucket.requestCount === 0
    ) {
        continue;
    }

    const windowStart =
        bucket.windowStart;

    const windowEnd = new Date();

    const availability =
        (bucket.successCount /
            bucket.requestCount) *
        100;

    const correctness =
        (bucket.correctCount /
            bucket.requestCount) *
        100;

    const allowedErrorPercentage =
        100 -
        slo.availabilityTarget;

    const actualErrorPercentage =
        100 - availability;

    let errorBudgetUsed = null;

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

    const latencyP95Ms =
        calculateP95(
            bucket.latencies
        );

    try {
        await sloRepository.createMeasurement({
            sloId: slo.id,
            windowStart,
            windowEnd,
            requestCount:
                bucket.requestCount,
            successCount:
                bucket.successCount,
            errorCount:
                bucket.errorCount,
            correctCount:
                bucket.correctCount,
            latencyP95Ms,
            availability,
            correctness,
            errorBudgetUsed,
        });

        if (
            availability <
                slo.availabilityTarget ||
            correctness <
                slo.correctnessTarget ||
            latencyP95Ms >
                slo.latencyTargetMs
        ) {
            console.warn(
                `[SLO ALERT] ${slo.method} ${slo.endpoint} breached an SLO. ` +
                `availability=${availability.toFixed(2)}% ` +
                `correctness=${correctness.toFixed(2)}% ` +
                `p95=${latencyP95Ms.toFixed(2)}ms`
            );
        }
    } catch (error) {
        console.error(
            "[SLO] Failed to persist measurement:",
            error.message
        );
    }
}

}

function sloMetricsMiddleware(
req,
res,
next
) {
const startTime =
process.hrtime.bigint();

res.on("finish", () => {
    const durationMs =
        Number(
            process.hrtime.bigint() -
                startTime
        ) / 1_000_000;

    recordRequest({
        method: req.method,
        endpoint:
            req.route?.path ||
            req.path,
        statusCode:
            res.statusCode,
        durationMs,
    });
});

next();

}

if (process.env.NODE_ENV !== "test") {
setInterval(() => {
flushBuckets().catch((error) => {
console.error(
"[SLO] Measurement flush failed:",
error.message
);
});
}, FLUSH_INTERVAL_MS);
}

module.exports = {
sloMetricsMiddleware,
flushBuckets,
};