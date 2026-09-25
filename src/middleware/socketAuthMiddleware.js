const jwt = require("jsonwebtoken");

function authenticateSocket(socket, next) {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication token is missing."));
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        socket.user = decoded;

        next();

    } catch (error) {
        return next(new Error("Invalid or expired token."));
    }
}

module.exports = {
    authenticateSocket,
};