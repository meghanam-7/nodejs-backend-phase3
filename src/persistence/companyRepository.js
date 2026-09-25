const prisma = require("../config/prismaClient");

async function createCompanyOnboarding({ user, company, profile }) {
    try {
        return await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
                where: { email: user.email },
                select: { id: true },
            });

            if (existingUser) {
                const error = new Error("An account with this email already exists.");
                error.statusCode = 409;
                throw error;
            }

            const existingSlug = await tx.company.findUnique({
                where: { slug: company.slug },
                select: { id: true },
            });

            if (existingSlug) {
                const error = new Error("A company with this name already exists.");
                error.statusCode = 409;
                throw error;
            }

            const createdUser = await tx.user.create({ data: user });

            const createdCompany = await tx.company.create({
                data: {
                    ...company,
                    ownerUserId: createdUser.id,
                },
            });

            const createdProfile = await tx.companyProfile.create({
                data: {
                    ...profile,
                    companyId: createdCompany.id,
                },
            });

            const kyc = await tx.companyKyc.create({
                data: {
                    companyId: createdCompany.id,
                    status: "NOT_STARTED",
                },
            });

            return {
                user: createdUser,
                company: createdCompany,
                profile: createdProfile,
                kyc,
            };
        });
    } catch (error) {
        if (error?.code === "P2002") {
            const conflict = new Error(
                "A company account or company name already exists."
            );
            conflict.statusCode = 409;
            throw conflict;
        }
        throw error;
    }
}

async function getCompanyById(id) {
    return prisma.company.findUnique({
        where: { id: Number(id) },
        include: {
            profile: true,
            kyc: true,
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
}

async function getCompanyByOwnerUserId(ownerUserId) {
    return prisma.company.findUnique({
        where: { ownerUserId: Number(ownerUserId) },
        include: { profile: true, kyc: true },
    });
}

module.exports = {
    createCompanyOnboarding,
    getCompanyById,
    getCompanyByOwnerUserId,
};
