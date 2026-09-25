const companyService = require("../services/companyService");

async function signup(req, res) {
    try {
        const result = await companyService.signup(req.body);

        return res.status(201).json({
            success: true,
            message: "Company onboarded successfully",
            data: {
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                },
                company: {
                    id: result.company.id,
                    name: result.company.name,
                    legalName: result.company.legalName,
                    slug: result.company.slug,
                    status: result.company.status,
                },
                profile: result.profile,
                kyc: {
                    id: result.kyc.id,
                    status: result.kyc.status,
                },
            },
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to onboard company.",
        });
    }
}

async function getMyCompany(req, res) {
    try {
        const company = await companyService.getMyCompany(req.user.id);

        return res.status(200).json({
            success: true,
            data: company,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to retrieve company profile.",
        });
    }
}

module.exports = { signup, getMyCompany };
