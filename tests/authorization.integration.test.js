const request = require("supertest");
const app = require("../src/app");

describe("Role-Based Authorization API", () => {
  const user = {
    name: "Authorization User",
    email: "authorization-user@test.com",
    password: "password123",
  };

  const admin = {
    name: "Authorization Admin",
    email: "authorization-admin@test.com",
    password: "password123",
  };

  let userToken;
  let adminToken;
  let productId;

  beforeAll(async () => {
    const prisma = require("../src/config/prismaClient");

    // Clean up test data from previous runs.
    // Orders reference products, so remove orders before products.
  

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [user.email, admin.email],
        },
      },
    });

    // Create USER
    const userSignup = await request(app).post("/auth/signup").send(user);

    expect(userSignup.status).toBe(201);

    // Create ADMIN user
    const adminSignup = await request(app).post("/auth/signup").send(admin);

    expect(adminSignup.status).toBe(201);

    // Promote admin user
    await prisma.user.update({
      where: {
        email: admin.email,
      },
      data: {
        role: "ADMIN",
      },
    });

    // Login USER
    const userLogin = await request(app).post("/auth/login").send({
      email: user.email,
      password: user.password,
    });

    expect(userLogin.status).toBe(200);
    expect(userLogin.body.token).toBeDefined();

    // Login ADMIN
    const adminLogin = await request(app).post("/auth/login").send({
      email: admin.email,
      password: admin.password,
    });

    expect(adminLogin.status).toBe(200);
    expect(adminLogin.body.token).toBeDefined();

    userToken = userLogin.body.token;
    adminToken = adminLogin.body.token;
  });

  test("USER cannot create a product", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Unauthorized Product",
        price: 100,
        stock: 10,
      });

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message: "Access denied.",
    });
  });

  test("USER cannot update a product", async () => {
    const response = await request(app)
      .put("/api/products/999999")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Unauthorized Update",
        price: 200,
        stock: 20,
      });

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message: "Access denied.",
    });
  });

  test("USER cannot delete a product", async () => {
    const response = await request(app)
      .delete("/api/products/999999")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message: "Access denied.",
    });
  });

  test("USER cannot access cache metrics", async () => {
    const response = await request(app)
      .get("/api/cache/metrics")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message: "Access denied.",
    });
  });

  test("ADMIN can create a product", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Authorization Test Product",
        price: 99.99,
        stock: 25,
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Product created successfully");

    expect(response.body.data).toEqual(
      expect.objectContaining({
        name: "Authorization Test Product",
        price: 99.99,
        stock: 25,
      }),
    );

    productId = response.body.data.id;
  });

  test("ADMIN can access cache metrics", async () => {
    const response = await request(app)
      .get("/api/cache/metrics")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("ADMIN can update a product", async () => {
    expect(productId).toBeDefined();

    const response = await request(app)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Updated Authorization Product",
        price: 149.99,
        stock: 30,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: productId,
        name: "Updated Authorization Product",
        price: 149.99,
        stock: 30,
      }),
    );
  });

  test("ADMIN can delete a product", async () => {
    expect(productId).toBeDefined();

    const response = await request(app)
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: productId,
      }),
    );
  });

  test("Requests without a token are rejected before role authorization", async () => {
    const response = await request(app).post("/api/products").send({
      name: "No Token Product",
      price: 50,
      stock: 5,
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Access token is missing.",
    });
  });
});
