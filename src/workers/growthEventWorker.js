const growthEventService = require("../services/growthEventService");

let running = true;

async function processEvents() {
    while (running) {
        try {
            const events = await growthEventService.getPendingEvents(50);

            for (const event of events) {
                console.log(`📊 Processing growth event ${event.id}`);
                console.log(`Event type: ${event.eventType}`);

                await growthEventService.markEventProcessed(event.id);

                console.log(`✅ Growth event ${event.id} processed`);
            }
        } catch (error) {
            console.error(
                "❌ Growth event worker error:",
                error.message,
            );
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
}

process.on("SIGTERM", () => {
    console.log("🛑 Growth event worker stopping...");
    running = false;
});

process.on("SIGINT", () => {
    console.log("🛑 Growth event worker stopping...");
    running = false;
});

console.log("🚀 Growth event worker is running...");

processEvents();