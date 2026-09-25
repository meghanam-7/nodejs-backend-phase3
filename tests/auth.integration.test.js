const request = require("supertest");
const app = require("../src/app");

describe("Authentication API", () => {
    const user = {
        name: "Integration Test User",
        email: "integration@test.com",
        password: "password123",
    };

    test("POST /auth/signup creates a new user", async () => {
        const response = await request(app)
            .post("/auth/signup")
            .send(user);

        expect(response.status).toBe(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User registered successfully");

        expect(response.body.data).toEqual(
            expect.objectContaining({
                name: user.name,
                email: user.email,
                role: "STUDENT",
            })
        );

        expect(response.body.data.password).toBeUndefined();
    });

    test("POST /auth/login returns a JWT for valid credentials", async () => {
        await request(app)
            .post("/auth/signup")
            .send(user);

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: user.email,
                password: user.password,
            });

        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Login successful");

        expect(response.body.token).toEqual(expect.any(String));

        expect(response.body.user).toEqual(
            expect.objectContaining({
                email: user.email,
                role: "STUDENT",
            })
        );

        expect(response.body.user.password).toBeUndefined();
    });

    test("GET /api/users rejects requests without authentication", async () => {
        const response = await request(app)
            .get("/api/users");

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: "Access token is missing.",
        });
    });

    test("GET /api/users accepts a valid JWT", async () => {
        await request(app)
            .post("/auth/signup")
            .send(user);

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                email: user.email,
                password: user.password,
            });

        const token = loginResponse.body.token;

        const response = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    email: user.email,
                    role: "STUDENT",
                }),
            ])
        );
    });

    test("POST /auth/login rejects invalid credentials", async () => {
        await request(app)
            .post("/auth/signup")
            .send(user);

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: user.email,
                password: "wrong-password",
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: "Invalid email or password.",
        });
    });

    test("POST /auth/signup rejects invalid input", async () => {
        const response = await request(app)
            .post("/auth/signup")
            .send({
                name: "A",
                email: "not-an-email",
                password: "123",
            });

        expect(response.status).toBe(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");
        expect(response.body.errors).toEqual(expect.any(Array));
    });
});