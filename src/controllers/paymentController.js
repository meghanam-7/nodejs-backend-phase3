const paymentService = require("../services/paymentService");

const createPaymentOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { jobId, amount } = req.body;

        const idempotencyKey = req.get("Idempotency-Key");

        if (!idempotencyKey) {
            return res.status(400).json({
                success: false,
                message: "Idempotency-Key header is required",
                code: "IDEMPOTENCY_KEY_REQUIRED",
            });
        }

        const result = await paymentService.createPaymentOrder(
            userId,
            jobId,
            amount,
            idempotencyKey
        );

        return res.status(201).json({
            success: true,
            message: result.idempotent
                ? "Existing payment order returned successfully"
                : "Payment order created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const {
            razorpayOrderId,
            razorpayPaymentId,
        } = req.body;

        const payment = await paymentService.verifyPayment(
            userId,
            razorpayOrderId,
            razorpayPaymentId
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: payment,
        });
    } catch (error) {
        next(error);
    }
};

const getPaymentReceipt = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const paymentId = Number(req.params.paymentId);

        const receipt =
            await paymentService.getPaymentReceipt(
                userId,
                paymentId
            );

        return res.status(200).json({
            success: true,
            message: "Payment receipt retrieved successfully",
            data: receipt,
        });
    } catch (error) {
        next(error);
    }
};

const createRefund = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const paymentId = Number(req.params.paymentId);
        const { amount, reason } = req.body;

        const idempotencyKey = req.get("Idempotency-Key");

        if (!idempotencyKey) {
            return res.status(400).json({
                success: false,
                message: "Idempotency-Key header is required",
                code: "IDEMPOTENCY_KEY_REQUIRED",
            });
        }

        const result = await paymentService.createRefund(
            userId,
            paymentId,
            amount,
            reason,
            idempotencyKey
        );

        return res.status(201).json({
            success: true,
            message: result.idempotent
                ? "Existing refund returned successfully"
                : "Refund created successfully",
            data: result,
        });
    } catch (error) {
        console.error("REFUND ERROR:", {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
        });

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Refund failed",
            code: error.code || "REFUND_ERROR",
        });
    }
};

const reconcilePayment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const paymentId = Number(req.params.paymentId);

        const result =
            await paymentService.reconcilePayment(
                userId,
                paymentId
            );

        return res.status(200).json({
            success: true,
            message:
                "Payment reconciliation completed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getRevenueAnalytics = async (req, res, next) => {
    try {
        const analytics =
            await paymentService.getRevenueAnalytics();

        return res.status(200).json({
            success: true,
            message: "Revenue analytics retrieved successfully",
            data: analytics,
        });
    } catch (error) {
        next(error);
    }
};

/*
 * Razorpay Webhook
 *
 * Razorpay sends:
 *   X-Razorpay-Signature
 *
 * The service verifies the signature using the raw
 * request body and RAZORPAY_WEBHOOK_SECRET.
 */
const handleWebhook = async (req, res, next) => {
    try {
        const signature = req.get("X-Razorpay-Signature");

        if (!signature) {
            return res.status(400).json({
                success: false,
                message: "Razorpay webhook signature is required",
                code: "WEBHOOK_SIGNATURE_REQUIRED",
            });
        }

        const result = await paymentService.handleWebhook(
            req.body,
            signature
        );

        return res.status(200).json({
            success: true,
            message: "Razorpay webhook processed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getPaymentReceipt,
    createRefund,
    reconcilePayment,
    handleWebhook,
    getRevenueAnalytics,
};