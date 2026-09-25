const authService = require("../services/authService");

// Signup Controller
async function signup(req, res) {
    try {

        const newUser = await authService.signup(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
}

// Login Controller
async function login(req, res) {
    try {

        const result = await authService.login(req.body);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: result.user,
        });

    } catch (error) {

        res.status(401).json({
            success: false,
            message: error.message,
        });

    }
}

module.exports = {
    signup,
    login,
};