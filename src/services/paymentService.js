const Razorpay = require("razorpay");
const crypto = require("crypto");
const paymentRepository = require("../persistence/paymentRepository");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/*
 * Convert Razorpay refund errors into application-friendly errors.
 */
const handleRefundError = (error) => {
  const razorpayCode = error?.error?.code || error?.code || null;

  const description =
    error?.error?.description ||
    error?.description ||
    "Unknown Razorpay refund error";

  const normalizedDescription = description.toLowerCase();

  const isBalanceError =
    normalizedDescription.includes("insufficient balance") ||
    normalizedDescription.includes("insufficient funds") ||
    normalizedDescription.includes("low balance") ||
    normalizedDescription.includes("available balance") ||
    normalizedDescription.includes("balance");

  const applicationError = new Error(
    isBalanceError
      ? "Refund could not be processed because the Razorpay account does not have sufficient balance to process the refund."
      : `Razorpay rejected the refund request: ${description}`,
  );

  applicationError.statusCode = 400;

  applicationError.code = isBalanceError
    ? "RAZORPAY_REFUND_INSUFFICIENT_BALANCE"
    : razorpayCode || "RAZORPAY_REFUND_ERROR";

  applicationError.razorpayError = error;

  console.error("Razorpay refund failed:", {
    code: razorpayCode,
    description,
    isBalanceError,
  });

  return applicationError;
};

const createPaymentOrder = async (userId, jobId, amount, idempotencyKey) => {
  /*
   * Idempotency:
   * If this request was already successfully processed,
   * return the existing payment instead of creating
   * another Razorpay order.
   */
  const existingPayment =
    await paymentRepository.findPaymentByIdempotencyKey(idempotencyKey);

  if (existingPayment) {
    return {
      payment: existingPayment,
      razorpayOrder: {
        id: existingPayment.razorpayOrderId,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        receipt: existingPayment.receipt,
      },
      idempotent: true,
    };
  }

  const job = await paymentRepository.findJobById(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "PUBLISHED") {
    throw new Error("Payment is only allowed for published jobs");
  }

  const receipt = `receipt_${userId}_${jobId}_${Date.now()}`;

  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt,
  });

  let payment;

  try {
    payment = await paymentRepository.createPayment({
      userId,
      jobId,
      amount,
      currency: "INR",
      status: "CREATED",
      razorpayOrderId: razorpayOrder.id,
      receipt,
      idempotencyKey,
    });
  } catch (error) {
    /*
     * Another request may have completed the same
     * idempotency key between our initial lookup
     * and database creation.
     */
    const existingPaymentAfterFailure =
      await paymentRepository.findPaymentByIdempotencyKey(idempotencyKey);

    if (existingPaymentAfterFailure) {
      return {
        payment: existingPaymentAfterFailure,
        razorpayOrder: {
          id: existingPaymentAfterFailure.razorpayOrderId,
          amount: existingPaymentAfterFailure.amount,
          currency: existingPaymentAfterFailure.currency,
          receipt: existingPaymentAfterFailure.receipt,
        },
        idempotent: true,
      };
    }

    throw error;
  }

  return {
    payment,
    razorpayOrder,
    idempotent: false,
  };
};

const verifyPayment = async (userId, razorpayOrderId, razorpayPaymentId) => {
  const payment =
    await paymentRepository.findPaymentByRazorpayOrderId(razorpayOrderId);

  if (!payment) {
    throw new Error("Payment order not found");
  }

  if (payment.userId !== userId) {
    throw new Error("You are not authorized to verify this payment");
  }

  /*
   * Idempotent verification:
   * If payment was already captured, simply return
   * the existing payment instead of failing.
   */
  if (payment.status === "CAPTURED") {
    return payment;
  }

  const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

  if (razorpayPayment.order_id !== razorpayOrderId) {
    throw new Error("Payment does not belong to this order");
  }

  if (razorpayPayment.amount !== payment.amount) {
    throw new Error("Payment amount does not match the order amount");
  }

  if (razorpayPayment.status !== "captured") {
    throw new Error("Payment has not been captured");
  }

  return paymentRepository.markPaymentCaptured(
    razorpayOrderId,
    razorpayPaymentId,
  );
};

const getPaymentReceipt = async (userId, paymentId) => {
  const payment = await paymentRepository.findPaymentById(paymentId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.userId !== userId) {
    throw new Error("You are not authorized to view this payment receipt");
  }

  if (payment.status !== "CAPTURED") {
    throw new Error("Receipt is available only for captured payments");
  }

  return {
    paymentId: payment.id,
    receipt: payment.receipt,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    razorpayOrderId: payment.razorpayOrderId,
    razorpayPaymentId: payment.razorpayPaymentId,
    createdAt: payment.createdAt,
  };
};

const createRefund = async (
  userId,
  paymentId,
  amount,
  reason,
  idempotencyKey,
) => {
  /*
   * Idempotency:
   * Return the existing refund when the same request
   * is retried.
   */
  const existingRefund =
    await paymentRepository.findRefundByIdempotencyKey(idempotencyKey);

  if (existingRefund) {
    return {
      refund: existingRefund,
      idempotent: true,
    };
  }

  const payment = await paymentRepository.findPaymentById(paymentId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.userId !== userId) {
    throw new Error("You are not authorized to refund this payment");
  }

  if (payment.status !== "CAPTURED") {
    throw new Error("Only captured payments can be refunded");
  }

  if (!payment.razorpayPaymentId) {
    throw new Error("Razorpay payment ID not found");
  }

  const refundAmount = amount ?? payment.amount;

  if (refundAmount <= 0) {
    throw new Error("Refund amount must be greater than zero");
  }

  const totalRefunded = await paymentRepository.getTotalRefundedAmount(
    payment.id,
  );

  if (totalRefunded + refundAmount > payment.amount) {
    throw new Error("Total refund amount cannot exceed payment amount");
  }

  let razorpayRefund;

  try {
    razorpayRefund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: refundAmount,
      notes: reason
        ? {
            reason,
          }
        : undefined,
    });
  } catch (error) {
    throw handleRefundError(error);
  }

  let refund;

  try {
    refund = await paymentRepository.createRefund({
      paymentId: payment.id,
      amount: refundAmount,
      currency: payment.currency,
      status: razorpayRefund.status
        ? razorpayRefund.status.toUpperCase()
        : "CREATED",
      razorpayRefundId: razorpayRefund.id,
      idempotencyKey,
      reason,
    });
  } catch (error) {
    /*
     * Razorpay already accepted the refund.
     * If the local insert raced with another request,
     * return the existing local refund.
     */
    const existingRefundAfterFailure =
      await paymentRepository.findRefundByRazorpayRefundId(razorpayRefund.id);

    if (existingRefundAfterFailure) {
      return {
        refund: existingRefundAfterFailure,
        razorpayRefund,
        idempotent: true,
      };
    }

    throw error;
  }

  return {
    refund,
    razorpayRefund,
    idempotent: false,
  };
};

const reconcilePayment = async (userId, paymentId) => {
  const payment = await paymentRepository.findPaymentById(paymentId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.userId !== userId) {
    throw new Error("You are not authorized to reconcile this payment");
  }

  if (!payment.razorpayPaymentId) {
    throw new Error(
      "Razorpay payment ID not found. Payment must be captured before reconciliation",
    );
  }

  const razorpayPayment = await razorpay.payments.fetch(
    payment.razorpayPaymentId,
  );

  const gatewayAmount = razorpayPayment.amount;
  const gatewayPaymentStatus = razorpayPayment.status;

  const amountMatches = payment.amount === gatewayAmount;

  const statusMatches =
    payment.status.toLowerCase() === gatewayPaymentStatus.toLowerCase();

  const isReconciled = amountMatches && statusMatches;

  let mismatchReason = null;

  if (!amountMatches && !statusMatches) {
    mismatchReason = "Payment amount and payment status do not match";
  } else if (!amountMatches) {
    mismatchReason = "Payment amount does not match gateway amount";
  } else if (!statusMatches) {
    mismatchReason = "Payment status does not match gateway status";
  }

  const reconciliation = await paymentRepository.createReconciliation({
    paymentId: payment.id,
    status: isReconciled ? "RECONCILED" : "MISMATCH",
    localAmount: payment.amount,
    gatewayAmount,
    localPaymentStatus: payment.status,
    gatewayPaymentStatus,
    mismatchReason,
  });

  return {
    reconciliation,
    payment,
    razorpayPayment,
  };
};

const handleWebhook = async (rawBody, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    const error = new Error("Razorpay webhook secret is not configured");

    error.statusCode = 500;
    error.code = "WEBHOOK_SECRET_NOT_CONFIGURED";

    throw error;
  }

  if (!Buffer.isBuffer(rawBody)) {
    const error = new Error(
      "Webhook request body must be received as raw data",
    );

    error.statusCode = 400;
    error.code = "INVALID_WEBHOOK_BODY";

    throw error;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const signaturesMatch =
    expectedSignature.length === signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature),
    );

  if (!signaturesMatch) {
    const error = new Error("Invalid Razorpay webhook signature");

    error.statusCode = 400;
    error.code = "INVALID_WEBHOOK_SIGNATURE";

    throw error;
  }

  let payload;

  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch (error) {
    const parseError = new Error("Invalid Razorpay webhook payload");

    parseError.statusCode = 400;
    parseError.code = "INVALID_WEBHOOK_PAYLOAD";

    throw parseError;
  }

  const event = payload.event;

  /*
   * Payment captured
   */
  if (event === "payment.captured") {
    const paymentEntity = payload?.payload?.payment?.entity;

    if (!paymentEntity) {
      throw new Error("Payment entity missing from webhook payload");
    }

    const payment = await paymentRepository.findPaymentByRazorpayOrderId(
      paymentEntity.order_id,
    );

    if (!payment) {
      return {
        event,
        processed: false,
        message: "Local payment not found",
      };
    }

    /*
     * Duplicate webhook protection:
     * If the payment is already captured, do not
     * perform the update again.
     */
    if (payment.status === "CAPTURED") {
      return {
        event,
        processed: true,
        duplicate: true,
        payment,
      };
    }

    if (payment.amount !== paymentEntity.amount) {
      const error = new Error(
        "Webhook payment amount does not match local payment",
      );

      error.statusCode = 400;
      error.code = "WEBHOOK_AMOUNT_MISMATCH";

      throw error;
    }

    const updatedPayment = await paymentRepository.markPaymentCaptured(
      paymentEntity.order_id,
      paymentEntity.id,
    );

    return {
      event,
      processed: true,
      duplicate: false,
      payment: updatedPayment,
    };
  }

  /*
   * Payment failed
   */
  if (event === "payment.failed") {
    const paymentEntity = payload?.payload?.payment?.entity;

    if (!paymentEntity) {
      throw new Error("Payment entity missing from webhook payload");
    }

    const payment = await paymentRepository.findPaymentByRazorpayOrderId(
      paymentEntity.order_id,
    );

    if (!payment) {
      return {
        event,
        processed: false,
        message: "Local payment not found",
      };
    }

    /*
     * Never change a successfully captured payment
     * back to FAILED.
     */
    /*
     * Duplicate webhook protection:
     * If the payment is already in a terminal state,
     * do not update it again.
     */
    if (payment.status === "CAPTURED" || payment.status === "FAILED") {
      return {
        event,
        processed: true,
        duplicate: true,
        payment,
      };
    }

    const updatedPayment = await paymentRepository.markPaymentFailed(
      paymentEntity.order_id,
    );

    return {
      event,
      processed: true,
      duplicate: false,
      payment: updatedPayment,
    };
  }

  /*
   * Other Razorpay events can safely be acknowledged.
   * This prevents Razorpay from repeatedly retrying
   * unsupported events.
   */
  return {
    event,
    processed: false,
    message: "Webhook event acknowledged",
  };
};

const getRevenueAnalytics = async () => {
  return paymentRepository.getRevenueAnalytics();
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
