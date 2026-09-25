const express = require("express");

const router = express.Router();

const isDevelopment = process.env.NODE_ENV !== "production";

if (isDevelopment) {
    router.get("/hello", (req, res) => {
        res.status(200).json({
            message: "Hello from PlaceMux Node.js Backend!"
        });
    });
}

module.exports = router;