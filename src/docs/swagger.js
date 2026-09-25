const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
    openapi: "3.0.3",

    info: {
        title: "PlaceMux Backend API",
        version: "1.0.0",
        description:
            "Secure REST API for the PlaceMux Node.js backend.",
    },

    servers: [
        {
            url: "http://localhost:3000",
            description: "Local server",
        },
    ],

    tags: [
        {
            name: "Health",
            description: "Health check endpoints",
        },
        {
            name: "Authentication",
            description: "Registration and login",
        },
        {
            name: "Users",
            description: "User endpoints",
        },
        {
            name: "Products",
            description: "Product management",
        },
        {
            name: "Orders",
            description: "Order query endpoints",
        },
        {
            name: "Cache",
            description: "Cache monitoring endpoints",
        },
        {
            name: "Companies",
            description: "Company onboarding and profile endpoints",
        },
        {
            name: "Jobs",
            description: "Background job endpoints",
        },
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },

        schemas: {
            SignupRequest: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                    name: {
                        type: "string",
                        minLength: 3,
                        example: "Test User",
                    },
                    email: {
                        type: "string",
                        format: "email",
                        example: "user@example.com",
                    },
                    password: {
                        type: "string",
                        minLength: 6,
                        format: "password",
                        example: "password123",
                    },
                },
            },

            LoginRequest: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: {
                        type: "string",
                        format: "email",
                        example: "user@example.com",
                    },
                    password: {
                        type: "string",
                        format: "password",
                        example: "password123",
                    },
                },
            },

            User: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        example: 1,
                    },
                    name: {
                        type: "string",
                        example: "Test User",
                    },
                    email: {
                        type: "string",
                        format: "email",
                        example: "user@example.com",
                    },
                    role: {
                        type: "string",
                        example: "USER",
                    },
                },
            },

            Product: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        example: 1,
                    },
                    name: {
                        type: "string",
                        example: "Laptop",
                    },
                    price: {
                        type: "number",
                        format: "float",
                        example: 1499.99,
                    },
                    stock: {
                        type: "integer",
                        example: 25,
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },

            ProductInput: {
                type: "object",
                required: ["name", "price", "stock"],
                properties: {
                    name: {
                        type: "string",
                        example: "Laptop",
                    },
                    price: {
                        type: "number",
                        format: "float",
                        example: 1499.99,
                    },
                    stock: {
                        type: "integer",
                        example: 25,
                    },
                },
            },

            Order: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        example: 1,
                    },
                    quantity: {
                        type: "integer",
                        example: 2,
                    },
                    totalPrice: {
                        type: "number",
                        format: "float",
                        example: 2999.98,
                    },
                    status: {
                        type: "string",
                        example: "Pending",
                    },
                    userId: {
                        type: "integer",
                        example: 1,
                    },
                    productId: {
                        type: "integer",
                        example: 1,
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                    },
                },
            },

            CompanySignupRequest: {
                type: "object",
                required: [
                    "contactName",
                    "email",
                    "password",
                    "name",
                    "legalName"
                ],
                properties: {
                    contactName: { type: "string", minLength: 3, example: "Company Admin" },
                    email: { type: "string", format: "email", example: "admin@acme.example" },
                    password: { type: "string", minLength: 6, format: "password", example: "password123" },
                    name: { type: "string", example: "Acme Technologies" },
                    legalName: { type: "string", example: "Acme Technologies Private Limited" },
                    website: { type: "string", format: "uri", example: "https://acme.example" },
                    description: { type: "string", example: "Technology company" },
                    industry: { type: "string", example: "Technology" },
                    companySize: { type: "string", example: "11-50" },
                    phone: { type: "string", example: "+919999999999" },
                    address: { type: "string", example: "Bengaluru, Karnataka" }
                }
            },

            ErrorResponse: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        example: false,
                    },
                    message: {
                        type: "string",
                        example: "Unauthorized",
                    },
                },
            },
        },
    },

    paths: {
        "/health": {
            get: {
                tags: ["Health"],
                summary: "Check server health",
                responses: {
                    200: {
                        description: "Server is healthy",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "OK",
                                        },
                                        message: {
                                            type: "string",
                                            example: "Server is running",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        "/companies/signup": {
            post: {
                tags: ["Companies"],
                summary: "Create a company account, profile, and initial KYC record",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CompanySignupRequest"
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Company onboarded successfully"
                    },
                    400: {
                        description: "Validation failed"
                    },
                    409: {
                        description: "Company account or name already exists"
                    }
                }
            }
        },

        "/companies/me": {
            get: {
                tags: ["Companies"],
                summary: "Get the authenticated company's profile and KYC status",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Company profile retrieved"
                    },
                    401: {
                        description: "Authentication required"
                    },
                    403: {
                        description: "Company role required"
                    },
                    404: {
                        description: "Company profile not found"
                    }
                }
            }
        },

        "/auth/signup": {
            post: {
                tags: ["Authentication"],
                summary: "Register a new user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/SignupRequest",
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "User registered successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true,
                                        },
                                        message: {
                                            type: "string",
                                            example: "User registered successfully",
                                        },
                                        data: {
                                            $ref: "#/components/schemas/User",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    500: {
                        description: "Registration failure",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/auth/login": {
            post: {
                tags: ["Authentication"],
                summary: "Authenticate a user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/LoginRequest",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Login successful",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true,
                                        },
                                        message: {
                                            type: "string",
                                            example: "Login successful",
                                        },
                                        token: {
                                            type: "string",
                                            example: "JWT_TOKEN",
                                        },
                                        user: {
                                            $ref: "#/components/schemas/User",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: "Invalid credentials",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/users": {
            get: {
                tags: ["Users"],
                summary: "Get users",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: {
                            type: "integer",
                            minimum: 1,
                            default: 1,
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: {
                            type: "integer",
                            minimum: 1,
                            default: 5,
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "Users fetched successfully",
                    },
                    401: {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/products": {
            get: {
                tags: ["Products"],
                summary: "Get all products",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Products fetched successfully",
                    },
                    401: {
                        description: "Authentication required",
                    },
                },
            },

            post: {
                tags: ["Products"],
                summary: "Create a product",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ProductInput",
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Product created successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true,
                                        },
                                        message: {
                                            type: "string",
                                            example: "Product created successfully",
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Product",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: "Authentication required",
                    },
                    403: {
                        description: "Admin role required",
                    },
                },
            },
        },

        "/api/products/{id}": {
            put: {
                tags: ["Products"],
                summary: "Update a product",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ProductInput",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Product updated successfully",
                    },
                    401: {
                        description: "Authentication required",
                    },
                    403: {
                        description: "Admin role required",
                    },
                    500: {
                        description: "Update failed",
                    },
                },
            },

            delete: {
                tags: ["Products"],
                summary: "Delete a product",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "Product deleted successfully",
                    },
                    401: {
                        description: "Authentication required",
                    },
                    403: {
                        description: "Admin role required",
                    },
                    500: {
                        description: "Delete failed",
                    },
                },
            },
        },

        "/api/orders": {
            get: {
                tags: ["Orders"],
                summary: "Get all orders",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Orders fetched successfully",
                    },
                    401: {
                        description: "Authentication required",
                    },
                },
            },
        },

        "/api/users/orders": {
            get: {
                tags: ["Orders"],
                summary: "Get users with orders",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Users with orders fetched successfully",
                    },
                },
            },
        },

        "/api/orders/details": {
            get: {
                tags: ["Orders"],
                summary: "Get orders with user and product details",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Orders with details fetched successfully",
                    },
                },
            },
        },

        "/api/products/orders": {
            get: {
                tags: ["Orders"],
                summary: "Get products with orders",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Products with orders fetched successfully",
                    },
                },
            },
        },

        "/api/cache/metrics": {
            get: {
                tags: ["Cache"],
                summary: "Get cache metrics",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Cache metrics fetched successfully",
                    },
                    401: {
                        description: "Authentication required",
                    },
                    403: {
                        description: "Admin role required",
                    },
                },
            },

            delete: {
                tags: ["Cache"],
                summary: "Reset cache metrics",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Cache metrics reset successfully",
                    },
                    401: {
                        description: "Authentication required",
                    },
                    403: {
                        description: "Admin role required",
                    },
                },
            },
        },

        "/api/jobs/email": {
            post: {
                tags: ["Jobs"],
                summary: "Queue an email job",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "subject", "message"],
                                properties: {
                                    email: {
                                        type: "string",
                                        format: "email",
                                        example: "user@example.com",
                                    },
                                    subject: {
                                        type: "string",
                                        example: "Welcome",
                                    },
                                    message: {
                                        type: "string",
                                        example: "Welcome to PlaceMux",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    202: {
                        description: "Email job queued successfully",
                    },
                    401: {
                        description: "Authentication required",
                    },
                },
            },
        },
    },
};

module.exports = swaggerJSDoc({
    definition: swaggerDefinition,
    apis: [],
});