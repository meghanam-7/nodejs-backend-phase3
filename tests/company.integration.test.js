const request = require("supertest");
const app = require("../src/app");

describe("Company onboarding", () => {
    const unique = Date.now();
    const payload = {
        contactName: "Meghz Demo",
        email: `company-${unique}@example.com`,
        password: "password123",
        name: `Acme Marketplace ${unique}`,
        legalName: `Acme Marketplace Private Limited ${unique}`,
        website: "https://example.com",
        description: "Demo company for PlaceMux onboarding.",
        industry: "Technology",
        companySize: "11-50",
        phone: "+919999999999",
        address: "Bengaluru, Karnataka",
    };

    test("creates company, profile, and initial KYC record", async () => {
        const response = await request(app)
            .post("/companies/signup")
            .send(payload);

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.role).toBe("COMPANY");
        expect(response.body.data.company.status).toBe("ONBOARDING");
        expect(response.body.data.kyc.status).toBe("NOT_STARTED");
        expect(response.body.data.profile.companyId).toBe(
            response.body.data.company.id
        );
    });

    test("rejects duplicate company account email", async () => {
        const response = await request(app)
            .post("/companies/signup")
            .send(payload);

        expect(response.statusCode).toBe(409);
        expect(response.body.success).toBe(false);
    });

    test("rejects invalid onboarding input", async () => {
        const response = await request(app)
            .post("/companies/signup")
            .send({
                contactName: "X",
                email: "not-an-email",
                password: "123",
                name: "",
                legalName: "",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");
    });
});
