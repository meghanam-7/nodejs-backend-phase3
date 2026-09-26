const {
NodeSDK,
} = require("@opentelemetry/sdk-node");

const {
getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const {
ConsoleSpanExporter,
} = require("@opentelemetry/sdk-trace-node");

const {
OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");

const serviceName =
process.env.OTEL_SERVICE_NAME || "placemux-backend-phase3";

const otlpEndpoint =
process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

const traceExporter = otlpEndpoint
? new OTLPTraceExporter({
url: otlpEndpoint,
})
: new ConsoleSpanExporter();

const sdk = new NodeSDK({
serviceName,
traceExporter,


instrumentations: [
    getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": {
            enabled: false,
        },
    }),
],


});

sdk.start();

process.on("SIGTERM", () => {
sdk.shutdown()
.then(() => {
console.log("OpenTelemetry SDK shut down successfully");
})
.catch((error) => {
console.error(
"Error shutting down OpenTelemetry SDK:",
error
);
})
.finally(() => {
process.exit(0);
});
});

console.log(
`OpenTelemetry tracing initialized for ${serviceName}`
);

if (otlpEndpoint) {
console.log(
`OpenTelemetry OTLP exporter enabled: ${otlpEndpoint}`
);
} else {
console.log(
"OpenTelemetry ConsoleSpanExporter enabled"
);
}
