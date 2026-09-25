const dotenv = require("dotenv");

dotenv.config({
    path: ".env.test",
    override: false,
});

const prisma = require("../src/config/prismaClient");

beforeAll(async () => {
    await prisma.companyKyc.deleteMany();
    await prisma.companyProfile.deleteMany();
    await prisma.company.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.companyKyc.deleteMany();
    await prisma.companyProfile.deleteMany();
    await prisma.company.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
});