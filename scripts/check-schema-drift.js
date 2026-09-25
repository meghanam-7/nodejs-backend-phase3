const { execSync } = require("child_process");

try {
    const output = execSync("npx prisma migrate status", {
        encoding: "utf8",
        stdio: "pipe",
    });

    console.log("=== Prisma Schema Drift Check ===");
    console.log(output);

    if (output.toLowerCase().includes("database schema is up to date")) {
        console.log("DRIFT CHECK: PASS");
        process.exit(0);
    }

    console.log("DRIFT CHECK: REVIEW REQUIRED");
    process.exit(1);
} catch (error) {
    console.error("DRIFT CHECK: FAILED");
    console.error(error.stdout || error.message);
    process.exit(1);
}
