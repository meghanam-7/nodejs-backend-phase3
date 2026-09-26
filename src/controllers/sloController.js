const sloService = require("../services/sloService");

async function createSlo(req, res) {
    try {
        const slo = await sloService.createSlo({
            name: req.body.name,
            endpoint: req.body.endpoint,
            method: req.body.method,
            description: req.body.description,
            availabilityTarget: req.body.availabilityTarget,
            latencyTargetMs: req.body.latencyTargetMs,
            correctnessTarget: req.body.correctnessTarget,
            window: req.body.window,
        });

        return res.status(201).json({
            success: true,
            message: "SLO created successfully.",
            data: slo,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to create SLO.",
        });
    }
}

async function getSlos(req, res) {
    try {
        const slos = await sloService.getSlos();

        return res.status(200).json({
            success: true,
            data: slos,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to retrieve SLOs.",
        });
    }
}

async function getSloById(req, res) {
    try {
        const slo = await sloService.getSloById(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            data: slo,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to retrieve SLO.",
        });
    }
}

async function createMeasurement(req, res) {
    try {
        const measurement =
            await sloService.calculateMeasurement({
                sloId: req.params.id,
                windowStart: new Date(req.body.windowStart),
                windowEnd: new Date(req.body.windowEnd),
                requestCount: req.body.requestCount,
                successCount: req.body.successCount,
                errorCount: req.body.errorCount,
                correctCount: req.body.correctCount,
                latencyP95Ms: req.body.latencyP95Ms,
            });

        return res.status(201).json({
            success: true,
            message: "SLO measurement recorded successfully.",
            data: measurement,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Unable to record SLO measurement.",
        });
    }
}

async function getMeasurements(req, res) {
    try {
        const measurements =
            await sloService.getMeasurements(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: measurements,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Unable to retrieve SLO measurements.",
        });
    }
}

async function getDashboard(req, res) {
    try {
        const dashboard =
            await sloService.getDashboard();

        return res.status(200).json({
            success: true,
            data: dashboard,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Unable to retrieve SLO dashboard.",
        });
    }
}

module.exports = {
    createSlo,
    getSlos,
    getSloById,
    createMeasurement,
    getMeasurements,
    getDashboard,
};