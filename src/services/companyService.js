const bcrypt = require("bcrypt");
const companyRepository = require("../persistence/companyRepository");

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");
}

async function signup(companyData) {
    const password = await bcrypt.hash(companyData.password, 10);

    return companyRepository.createCompanyOnboarding({
        user: {
            name: companyData.contactName,
            email: companyData.email,
            password,
            role: "COMPANY",
        },
        company: {
            name: companyData.name,
            legalName: companyData.legalName,
            slug: slugify(companyData.name),
            status: "ONBOARDING",
        },
        profile: {
            website: companyData.website || null,
            description: companyData.description || null,
            industry: companyData.industry || null,
            companySize: companyData.companySize || null,
            phone: companyData.phone || null,
            address: companyData.address || null,
        },
    });
}

async function getMyCompany(userId) {
    const company = await companyRepository.getCompanyByOwnerUserId(userId);

    if (!company) {
        const error = new Error("Company profile not found.");
        error.statusCode = 404;
        throw error;
    }

    return company;
}

module.exports = { signup, getMyCompany };
