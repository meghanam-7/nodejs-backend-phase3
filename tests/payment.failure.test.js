const paymentService = require("../src/services/paymentService");
const paymentRepository = require("../src/persistence/paymentRepository");

jest.mock("../src/persistence/paymentRepository");

jest.mock("razorpay", () => {
  const mockRefund = jest.fn();
  const mockFetch = jest.fn();
  const mockCreate = jest.fn();

  const MockRazorpay = jest.fn().mockImplementation(() => ({
    orders: {
      create: mockCreate,
    },
    payments: {
      fetch: mockFetch,
      refund: mockRefund,
    },
  }));

  MockRazorpay.mockRefund = mockRefund;
  MockRazorpay.mockFetch = mockFetch;
  MockRazorpay.mockCreate = mockCreate;

  return MockRazorpay;
});

describe("Payment Failure Handling", () => {
  let mockRefund;

  beforeEach(() => {
    jest.clearAllMocks();

    paymentRepository.getTotalRefundedAmount.mockResolvedValue(0);

    const Razorpay = require("razorpay");
    mockRefund = Razorpay.mockRefund;
  });

  describe("Refund validation failures", () => {
    test("rejects refund when payment does not exist", async () => {
      paymentRepository.findPaymentById.mockResolvedValue(null);

      await expect(
        paymentService.createRefund(1, 999, 1000, "Test refund"),
      ).rejects.toThrow("Payment not found");

      expect(mockRefund).not.toHaveBeenCalled();

      expect(paymentRepository.createRefund).not.toHaveBeenCalled();
    });

    test("rejects refund when payment belongs to another user", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 7,
        userId: 2,
        amount: 10000,
        currency: "INR",
        status: "CAPTURED",
        razorpayPaymentId: "pay_test",
      });

      await expect(
        paymentService.createRefund(1, 7, 1000, "Test refund"),
      ).rejects.toThrow("You are not authorized to refund this payment");

      expect(mockRefund).not.toHaveBeenCalled();
    });

    test("rejects refund when payment is not captured", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 8,
        userId: 1,
        amount: 10000,
        currency: "INR",
        status: "CREATED",
        razorpayPaymentId: null,
      });

      await expect(
        paymentService.createRefund(1, 8, 1000, "Test refund"),
      ).rejects.toThrow("Only captured payments can be refunded");

      expect(mockRefund).not.toHaveBeenCalled();
    });

    test("rejects refund when Razorpay payment ID is missing", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 9,
        userId: 1,
        amount: 10000,
        currency: "INR",
        status: "CAPTURED",
        razorpayPaymentId: null,
      });

      await expect(
        paymentService.createRefund(1, 9, 1000, "Test refund"),
      ).rejects.toThrow("Razorpay payment ID not found");

      expect(mockRefund).not.toHaveBeenCalled();
    });

    test("rejects zero refund amount", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 7,
        userId: 1,
        amount: 10000,
        currency: "INR",
        status: "CAPTURED",
        razorpayPaymentId: "pay_test",
      });

      await expect(
        paymentService.createRefund(1, 7, 0, "Test refund"),
      ).rejects.toThrow("Refund amount must be greater than zero");

      expect(mockRefund).not.toHaveBeenCalled();

      expect(paymentRepository.createRefund).not.toHaveBeenCalled();
    });

    test("rejects refund amount greater than payment amount", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 7,
        userId: 1,
        amount: 10000,
        currency: "INR",
        status: "CAPTURED",
        razorpayPaymentId: "pay_test",
      });

      await expect(
        paymentService.createRefund(1, 7, 15000, "Test refund"),
      ).rejects.toThrow("Total refund amount cannot exceed payment amount");

      expect(mockRefund).not.toHaveBeenCalled();

      expect(paymentRepository.createRefund).not.toHaveBeenCalled();
    });

    test("rejects refund when cumulative refunds exceed payment amount", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 10,
        userId: 1,
        amount: 10000,
        currency: "INR",
        status: "CAPTURED",
        razorpayPaymentId: "pay_test",
      });

      paymentRepository.getTotalRefundedAmount.mockResolvedValue(8000);

      await expect(
        paymentService.createRefund(1, 10, 3000, "Second refund"),
      ).rejects.toThrow("Total refund amount cannot exceed payment amount");

      expect(paymentRepository.getTotalRefundedAmount).toHaveBeenCalledWith(10);

      expect(mockRefund).not.toHaveBeenCalled();

      expect(paymentRepository.createRefund).not.toHaveBeenCalled();
    });

    test("allows refund when cumulative refunds equal the remaining refundable amount", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 11,
        userId: 1,
        amount: 10000,
        currency: "INR",
        status: "CAPTURED",
        razorpayPaymentId: "pay_test",
      });

      paymentRepository.getTotalRefundedAmount.mockResolvedValue(7000);

      mockRefund.mockResolvedValue({
        id: "rfnd_test",
        status: "processed",
      });

      paymentRepository.createRefund.mockResolvedValue({
        id: 1,
        paymentId: 11,
        amount: 3000,
        currency: "INR",
        status: "PROCESSED",
        razorpayRefundId: "rfnd_test",
        reason: "Final refund",
      });

      const result = await paymentService.createRefund(
        1,
        11,
        3000,
        "Final refund",
      );

      expect(mockRefund).toHaveBeenCalledWith(
        "pay_test",
        expect.objectContaining({
          amount: 3000,
        }),
      );

      expect(paymentRepository.createRefund).toHaveBeenCalled();

      expect(result.refund).toBeDefined();
    });
  });

  describe("Razorpay refund failures", () => {
    test("converts Razorpay rejection into application error", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 7,
        userId: 1,
        amount: 10000,
        currency: "INR",
        status: "CAPTURED",
        razorpayPaymentId: "pay_test",
      });

      mockRefund.mockRejectedValue({
        statusCode: 400,
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "invalid request sent",
        },
      });

      await expect(
        paymentService.createRefund(1, 7, 10000, "Test refund"),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "BAD_REQUEST_ERROR",
        message: "Razorpay rejected the refund request: invalid request sent",
      });

      expect(paymentRepository.createRefund).not.toHaveBeenCalled();
    });

    test("handles Razorpay insufficient balance deterministically", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 7,
        userId: 1,
        amount: 10000,
        currency: "INR",
        status: "CAPTURED",
        razorpayPaymentId: "pay_test",
      });

      mockRefund.mockRejectedValue({
        statusCode: 400,
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "Insufficient balance to process refund",
        },
      });

      await expect(
        paymentService.createRefund(1, 7, 10000, "Test refund"),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "RAZORPAY_REFUND_INSUFFICIENT_BALANCE",
        message:
          "Refund could not be processed because the Razorpay account does not have sufficient balance to process the refund.",
      });

      expect(paymentRepository.createRefund).not.toHaveBeenCalled();
    });
  });

  describe("Reconciliation failure handling", () => {
    test("rejects reconciliation when payment does not exist", async () => {
      paymentRepository.findPaymentById.mockResolvedValue(null);

      await expect(paymentService.reconcilePayment(1, 999)).rejects.toThrow(
        "Payment not found",
      );
    });

    test("rejects reconciliation for another user's payment", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 7,
        userId: 2,
        amount: 10000,
        currency: "INR",
        status: "CAPTURED",
        razorpayPaymentId: "pay_test",
      });

      await expect(paymentService.reconcilePayment(1, 7)).rejects.toThrow(
        "You are not authorized to reconcile this payment",
      );
    });

    test("rejects reconciliation when Razorpay payment ID is missing", async () => {
      paymentRepository.findPaymentById.mockResolvedValue({
        id: 7,
        userId: 1,
        amount: 10000,
        currency: "INR",
        status: "CAPTURED",
        razorpayPaymentId: null,
      });

      await expect(paymentService.reconcilePayment(1, 7)).rejects.toThrow(
        "Razorpay payment ID not found. Payment must be captured before reconciliation",
      );
    });
  });
});
