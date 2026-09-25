const prisma = require("../config/prismaClient");

const findJobById = async (jobId) => {
    return prisma.job.findUnique({
        where: {
            id: jobId,
        },
        select: {
            id: true,
            title: true,
            status: true,
            companyId: true,
        },
    });
};

const createPayment = async (data) => {
    return prisma.payment.create({
        data: {
            userId: data.userId,
            jobId: data.jobId,
            amount: data.amount,
            currency: data.currency,
            status: data.status,
            razorpayOrderId: data.razorpayOrderId,
            receipt: data.receipt,
            idempotencyKey: data.idempotencyKey,
        },
    });
};

const findPaymentByIdempotencyKey = async (idempotencyKey) => {
    return prisma.payment.findUnique({
        where: {
            idempotencyKey,
        },
    });
};

const findPaymentByRazorpayOrderId = async (razorpayOrderId) => {
    return prisma.payment.findUnique({
        where: {
            razorpayOrderId,
        },
    });
};

const findPaymentById = async (paymentId) => {
    return prisma.payment.findUnique({
        where: {
            id: paymentId,
        },
    });
};

const getTotalRefundedAmount = async (paymentId) => {
    const result = await prisma.refund.aggregate({
        where: {
            paymentId,
        },
        _sum: {
            amount: true,
        },
    });

    return result._sum.amount || 0;
};

const markPaymentCaptured = async (
    razorpayOrderId,
    razorpayPaymentId
) => {
    return prisma.payment.update({
        where: {
            razorpayOrderId,
        },
        data: {
            status: "CAPTURED",
            razorpayPaymentId,
        },
    });
};

const findCapturedPaymentForJob = async (userId, jobId) => {
    return prisma.payment.findFirst({
        where: {
            userId,
            jobId,
            status: "CAPTURED",
        },
    });
};

const createRefund = async (data) => {
    return prisma.refund.create({
        data: {
            paymentId: data.paymentId,
            amount: data.amount,
            currency: data.currency,
            status: data.status,
            razorpayRefundId: data.razorpayRefundId,
            idempotencyKey: data.idempotencyKey,
            reason: data.reason,
        },
    });
};

const findRefundByIdempotencyKey = async (idempotencyKey) => {
    return prisma.refund.findUnique({
        where: {
            idempotencyKey,
        },
    });
};

const updateRefund = async (refundId, data) => {
    return prisma.refund.update({
        where: {
            id: refundId,
        },
        data,
    });
};

const findRefundByRazorpayRefundId = async (razorpayRefundId) => {
    return prisma.refund.findUnique({
        where: {
            razorpayRefundId,
        },
    });
};

const createReconciliation = async (data) => {
    return prisma.reconciliation.create({
        data: {
            paymentId: data.paymentId,
            status: data.status,
            localAmount: data.localAmount,
            gatewayAmount: data.gatewayAmount,
            localPaymentStatus: data.localPaymentStatus,
            gatewayPaymentStatus: data.gatewayPaymentStatus,
            mismatchReason: data.mismatchReason,
            reconciledAt: data.reconciledAt,
        },
    });
};

const findReconciliationsByPaymentId = async (paymentId) => {
    return prisma.reconciliation.findMany({
        where: {
            paymentId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const markPaymentFailed = async (razorpayOrderId) => {
    return prisma.payment.update({
        where: {
            razorpayOrderId,
        },
        data: {
            status: "FAILED",
        },
    });
};

const getRevenueAnalytics = async () => {
    const paymentStats = await prisma.payment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
        _sum: {
            amount: true,
        },
    });

    const refundStats = await prisma.refund.aggregate({
        _count: {
            id: true,
        },
        _sum: {
            amount: true,
        },
    });

    let totalPayments = 0;
    let capturedPayments = 0;
    let failedPayments = 0;
    let createdPayments = 0;
    let grossRevenue = 0;

    for (const stat of paymentStats) {
        const count = stat._count.id;
        const amount = stat._sum.amount || 0;

        totalPayments += count;

        if (stat.status === "CAPTURED") {
            capturedPayments += count;
            grossRevenue += amount;
        }

        if (stat.status === "FAILED") {
            failedPayments += count;
        }

        if (stat.status === "CREATED") {
            createdPayments += count;
        }
    }

    const totalRefunded = refundStats._sum.amount || 0;

    return {
        totalPayments,
        capturedPayments,
        failedPayments,
        createdPayments,
        grossRevenue,
        totalRefunded,
        netRevenue: grossRevenue - totalRefunded,
        totalRefunds: refundStats._count.id,
    };
};

module.exports = {
    createPayment,
    findPaymentByIdempotencyKey,
    findPaymentByRazorpayOrderId,
    findPaymentById,
    findJobById,
    markPaymentCaptured,
    markPaymentFailed,
    findCapturedPaymentForJob,
    createRefund,
    findRefundByIdempotencyKey,
    updateRefund,
    findRefundByRazorpayRefundId,
    createReconciliation,
    findReconciliationsByPaymentId,
    getTotalRefundedAmount,
    getRevenueAnalytics,
};