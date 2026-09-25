const request = require("supertest");
const app = require("../src/app");

describe("API Documentation", () => {
    test("Swagger UI is available", async () => {
        const response = await request(app)
            .get("/api-docs/");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Swagger UI");
    });
});