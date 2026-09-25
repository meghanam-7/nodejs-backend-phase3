const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../persistence/userRepository");

// Signup Service
async function signup(userData) {

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await userRepository.createUser({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: "STUDENT",
    });

    return newUser;
}

// Login Service
async function login(loginData) {

    const user = await userRepository.getUserByEmail(loginData.email);

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password.");
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}

module.exports = {
    signup,
    login,
};