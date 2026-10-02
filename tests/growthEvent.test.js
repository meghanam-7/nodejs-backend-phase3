const request = require("supertest");
const app = require("../src/app");

describe("Growth Event API", () => {
    let token;

    beforeAll(async () => {
    await request(app)
        .post("/auth/signup")
        .send({
            name: "Growth Event Test User",
            email: "growth-event@test.com",
            password: "password123",
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email: "growth-event@test.com",
            password: "password123",
        });

    token = loginResponse.body.token;
});

    test("creates a growth event and handles duplicate idempotency key", async () => {
        const event = {
            eventType: "JOB_CREATED",
            version: 1,
            aggregateType: "Job",
            aggregateId: "task6-test-job",
            payload: {
                title: "Task 6 Test Job",
            },
            idempotencyKey: `task6-test-${Date.now()}`,
        };

        const firstResponse = await request(app)
            .post("/api/growth-events")
            .set("Authorization", `Bearer ${token}`)
            .send(event);

        //console.log("GROWTH EVENT RESPONSE:", firstResponse.status, firstResponse.body);
        expect(firstResponse.status).toBe(201);
        expect(firstResponse.body.success).toBe(true);
        expect(firstResponse.body.idempotent).toBe(false);
        expect(firstResponse.body.data.eventType).toBe("JOB_CREATED");
        expect(firstResponse.body.data.version).toBe(1);

        const secondResponse = await request(app)
            .post("/api/growth-events")
            .set("Authorization", `Bearer ${token}`)
            .send(event);

        expect(secondResponse.status).toBe(200);
        expect(secondResponse.body.success).toBe(true);
        expect(secondResponse.body.idempotent).toBe(true);
        expect(secondResponse.body.data.id).toBe(
            firstResponse.body.data.id,
        );
    });
});