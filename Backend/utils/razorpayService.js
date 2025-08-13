import Razorpay from "razorpay";
import crypto from "crypto";

class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  // Create order for booking payment
  async createOrder(amount, currency = "INR", receipt, notes = {}) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes,
        payment_capture: 1, // Auto capture
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  // Verify payment signature
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Payment signature verification error:", error);
      return false;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Webhook signature verification error:", error);
      return false;
    }
  }

  // Fetch payment details
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error("Error fetching payment details:", error);
      throw new Error(`Failed to fetch payment details: ${error.message}`);
    }
  }

  // Create refund
  async createRefund(paymentId, amount = null, notes = {}) {
    try {
      const refundOptions = {
        notes,
      };

      if (amount) {
        refundOptions.amount = Math.round(amount * 100); // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundOptions);
      return refund;
    } catch (error) {
      console.error("Refund creation error:", error);
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  // Fetch refund details
  async getRefundDetails(paymentId, refundId) {
    try {
      const refund = await this.razorpay.payments.fetchRefund(paymentId, refundId);
      return refund;
    } catch (error) {
      console.error("Error fetching refund details:", error);
      throw new Error(`Failed to fetch refund details: ${error.message}`);
    }
  }

  // Get order details
  async getOrderDetails(orderId) {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return order;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw new Error(`Failed to fetch order details: ${error.message}`);
    }
  }
}

export default new RazorpayService();
