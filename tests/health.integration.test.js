const request = require("supertest");
const app = require("../src/app");

describe("Health API", () => {
    test("GET /health returns a healthy response", async () => {
        const response = await request(app)
            .get("/health");

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            status: "OK",
            message: "Server and database are healthy",
        });
    });
});