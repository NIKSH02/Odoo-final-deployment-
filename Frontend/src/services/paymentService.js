import api from "../api/axiosInstance";

// Create payment order
export const createPaymentOrderService = async (bookingId) => {
  return api.post("/payments/create-order", { bookingId });
};

// Verify payment
export const verifyPaymentService = async (paymentData) => {
  return api.post("/payments/verify", paymentData);
};

// Handle payment failure
export const handlePaymentFailureService = async (bookingId, error) => {
  return api.post("/payments/failure", { bookingId, error });
};

// Retry payment
export const retryPaymentService = async (bookingId) => {
  return api.post("/payments/retry", { bookingId });
};

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initializeRazorpayPayment = async (orderData, onSuccess, onFailure) => {
  try {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      await loadRazorpayScript();
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "SportVenue Booking",
      description: `Booking for ${orderData.bookingDetails.venueName} - ${orderData.bookingDetails.courtName}`,
      order_id: orderData.orderId,
      prefill: {
        name: orderData.userDetails.name,
        email: orderData.userDetails.email,
      },
      theme: {
        color: "#3B82F6",
      },
      modal: {
        ondismiss: () => {
          onFailure({
            code: "PAYMENT_CANCELLED",
            description: "Payment was cancelled by user",
          });
        },
      },
      handler: async (response) => {
        try {
          // Verify payment on backend
          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: orderData.bookingDetails.id,
          };

          const verificationResult = await verifyPaymentService(verificationData);
          onSuccess(verificationResult.data);
        } catch (error) {
          console.error("Payment verification failed:", error);
          onFailure({
            code: "VERIFICATION_FAILED",
            description: error.response?.data?.message || "Payment verification failed",
          });
        }
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    // Handle payment failure
    razorpay.on("payment.failed", (response) => {
      onFailure({
        code: response.error.code,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
      });
    });

    return razorpay;
  } catch (error) {
    console.error("Failed to initialize Razorpay:", error);
    throw error;
  }
};
