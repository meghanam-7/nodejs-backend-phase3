const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const timeout = require("connect-timeout");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const { apiRateLimiter } = require("./middleware/rateLimiter");

const {
    sloMetricsMiddleware,
} = require("./middleware/sloMetricsMiddleware");


const app = express();

if (process.env.NODE_ENV === "production") {
app.set("trust proxy", 1);
}

// Middleware
app.use(timeout("10s"));

/*

Razorpay webhook requires the original raw request body
for HMAC signature verification.


This MUST run before express.json().
*/
app.use(
"/api/payments/webhook",
express.raw({
type: "application/json",
limit: "1mb",
})
);

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.use(helmet());

// Enforce HTTPS in production
app.use((req, res, next) => {
if (
process.env.NODE_ENV === "production" &&
!req.secure
) {
return res.status(400).json({
success: false,
message: "HTTPS is required in production.",
});
}

next();

});

app.use(
cors({
origin: ["http://localhost:3000"],
methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
allowedHeaders: ["Content-Type", "Authorization"],
})
);

app.use(compression());
app.use(sloMetricsMiddleware);

// Import Routes
const healthRoutes = require("./routes/healthRoutes");
const sampleRoutes = require("./routes/sampleRoutes");
const mockRoutes = require("./routes/mockRoutes");
const workerRoutes = require("./routes/workerRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const cacheMetricsRoutes = require("./routes/cacheMetricsRoutes");
const companyRoutes = require("./routes/companyRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const defectRoutes = require("./routes/defectRoutes");
const backlogRoutes = require("./routes/backlogRoutes");
const postmortemRoutes = require("./routes/postmortemRoutes");
const offerRoutes = require("./routes/offerRoutes");
const discoveryRoutes = require("./routes/discoveryRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const applicationStatusRoutes = require("./routes/applicationStatusRoutes");
const consentRoutes = require("./routes/consentRoutes");
const userRoutes = require("./routes/userRoutes");
const sloRoutes = require("./routes/sloRoutes");
const growthEventRoutes = require("./routes/growthEventRoutes");

// Public routes
app.use("/", healthRoutes);
app.use("/", sampleRoutes);
app.use("/", authRoutes);
app.use("/", companyRoutes);
app.use(incidentRoutes);
app.use(defectRoutes);
app.use(backlogRoutes);
app.use(postmortemRoutes);
app.use("/", offerRoutes);
app.use("/", discoveryRoutes);
app.use("/", interviewRoutes);
app.use(applicationStatusRoutes);
app.use("/", userRoutes);


// Swagger API documentation
app.use(
"/api-docs",
swaggerUi.serve,
swaggerUi.setup(swaggerSpec)
);

// Apply API rate limiter to all /api routes
app.use("/api", apiRateLimiter);

// Protected/API routes
app.use("/", mockRoutes);
app.use("/", workerRoutes);
app.use("/", jobRoutes);
app.use("/", applicationRoutes);
app.use("/", cacheMetricsRoutes);

// Consent routes
app.use("/", consentRoutes);

// SLO / Observability routes
app.use("/", sloRoutes);

app.use("/", growthEventRoutes);

// Payment routes
// paymentRoutes already defines:
// /payments/orders
// /payments/verify
// /payments//receipt
// /payments//refund
// /payments//reconcile
//
// Mounting under /api makes the final endpoints:
// /api/payments/orders
// /api/payments/verify
// /api/payments//receipt
// /api/payments//refund
// /api/payments//reconcile
app.use("/api", paymentRoutes);

// Global production-safe error handler
app.use((err, req, res, next) => {
console.error("Unhandled application error:", err);

if (err && err.code === "ETIMEDOUT") {
    return res.status(503).json({
        success: false,
        message: "Request timed out. Please try again later.",
    });
}

const isProduction = process.env.NODE_ENV === "production";

return res.status(500).json({
    success: false,
    message: isProduction
        ? "Internal server error."
        : err.message || "Internal server error.",
});

});

module.exports = app;