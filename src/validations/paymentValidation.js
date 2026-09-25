const { body, param } = require("express-validator");
const createPaymentValidation = [
  body("jobId")
    .isInt({ min: 1 })
    .withMessage("Job ID must be a positive integer"),
  body("amount")
    .isInt({ min: 100 })
    .withMessage("Amount must be an integer of at least 100 paise"),
];
const verifyPaymentValidation = [
  body("razorpayOrderId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Razorpay order ID is required"),
  body("razorpayPaymentId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Razorpay payment ID is required"),
];
const paymentIdValidation = [
  param("paymentId")
    .isInt({ min: 1 })
    .withMessage("Payment ID must be a positive integer"),
];
const refundValidation = [
  body("amount")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Refund amount must be a positive integer"),
  body("reason")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Refund reason must not exceed 500 characters"),
];
module.exports = {
  createPaymentValidation,
  verifyPaymentValidation,
  paymentIdValidation,
  refundValidation,
};
