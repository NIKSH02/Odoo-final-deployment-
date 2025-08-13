import Booking from "../models/booking.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import razorpayService from "../utils/razorpayService.js";

// Create payment order
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  // Find the booking
  const booking = await Booking.findById(bookingId)
    .populate("venue", "name")
    .populate("court", "name")
    .populate("user", "fullName email");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user owns this booking
  if (booking.user._id.toString() !== req.user.id) {
    throw new ApiError(403, "You can only create payment orders for your own bookings");
  }

  // Check if payment is already completed
  if (booking.paymentStatus === "completed") {
    throw new ApiError(400, "Payment already completed for this booking");
  }

  try {
    // Create Razorpay order - Receipt must be max 40 chars
    const bookingIdShort = booking._id.toString().slice(-12); // Last 12 chars of booking ID
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const receipt = `bk_${bookingIdShort}_${timestamp}`.slice(0, 40); // Ensure max 40 chars
    
    const notes = {
      bookingId: booking._id.toString(),
      userId: booking.user._id.toString(),
      venueId: booking.venue._id.toString(),
      courtId: booking.court._id.toString(),
      bookingDate: booking.bookingDate.toISOString().split('T')[0], // Just the date part
      timeSlot: `${booking.timeSlot.startTime}-${booking.timeSlot.endTime}`,
    };

    const razorpayOrder = await razorpayService.createOrder(
      booking.pricing.totalAmount,
      "INR",
      receipt,
      notes
    );

    // Update booking with Razorpay order ID
    booking.paymentDetails.razorpayOrderId = razorpayOrder.id;
    booking.status = "payment_pending";
    await booking.save();

    // Return order details for frontend
    res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          bookingDetails: {
            id: booking._id,
            venueName: booking.venue.name,
            courtName: booking.court.name,
            date: booking.bookingDate,
            timeSlot: booking.timeSlot,
            amount: booking.pricing.totalAmount,
          },
          userDetails: {
            name: booking.user.fullName,
            email: booking.user.email,
          },
        },
        "Payment order created successfully"
      )
    );
  } catch (error) {
    console.error("Payment order creation error:", error);
    throw new ApiError(500, "Failed to create payment order");
  }
});

// Verify payment
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  // Find the booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user owns this booking
  if (booking.user.toString() !== req.user.id) {
    throw new ApiError(403, "You can only verify payments for your own bookings");
  }

  // Verify payment signature
  const isValidSignature = razorpayService.verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValidSignature) {
    // Update booking with failed payment
    booking.paymentStatus = "failed";
    booking.status = "cancelled";
    booking.paymentDetails.failureReason = "Invalid payment signature";
    booking.paymentDetails.retryCount += 1;
    await booking.save();

    throw new ApiError(400, "Payment verification failed");
  }

  try {
    // Get payment details from Razorpay
    const paymentDetails = await razorpayService.getPaymentDetails(razorpay_payment_id);

    // Update booking with successful payment
    booking.paymentStatus = "completed";
    booking.status = "confirmed";
    booking.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    booking.paymentDetails.razorpaySignature = razorpay_signature;
    booking.paymentDetails.transactionId = razorpay_payment_id;
    booking.paymentDetails.paymentMethod = paymentDetails.method || "card";
    booking.paymentDetails.paidAt = new Date();

    await booking.save();

    // Populate booking for response
    await booking.populate([
      { path: "venue", select: "name address" },
      { path: "court", select: "name sportType" },
      { path: "user", select: "fullName email" },
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          booking,
          paymentDetails: {
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            amount: paymentDetails.amount / 100, // Convert from paise
            method: paymentDetails.method,
            status: paymentDetails.status,
          },
        },
        "Payment verified and booking confirmed successfully"
      )
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    
    // Update booking with failed verification
    booking.paymentStatus = "failed";
    booking.status = "cancelled";
    booking.paymentDetails.failureReason = error.message;
    booking.paymentDetails.retryCount += 1;
    await booking.save();

    throw new ApiError(500, "Payment verification failed");
  }
});

// Handle payment failure
const handlePaymentFailure = asyncHandler(async (req, res) => {
  const { bookingId, error } = req.body;

  // Find the booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user owns this booking
  if (booking.user.toString() !== req.user.id) {
    throw new ApiError(403, "Unauthorized");
  }

  // Update booking with failure details
  booking.paymentStatus = "failed";
  booking.status = "cancelled";
  booking.paymentDetails.failureReason = error.description || "Payment failed";
  booking.paymentDetails.retryCount += 1;
  await booking.save();

  res.status(200).json(
    new ApiResponse(200, { booking }, "Payment failure recorded")
  );
});

// Retry payment
const retryPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  // Find the booking
  const booking = await Booking.findById(bookingId)
    .populate("venue", "name")
    .populate("court", "name")
    .populate("user", "fullName email");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user owns this booking
  if (booking.user._id.toString() !== req.user.id) {
    throw new ApiError(403, "Unauthorized");
  }

  // Check retry limit
  if (booking.paymentDetails.retryCount >= 3) {
    throw new ApiError(400, "Maximum payment retry attempts exceeded");
  }

  // Check if booking is not expired (24 hours)
  const bookingAge = Date.now() - booking.createdAt.getTime();
  if (bookingAge > 24 * 60 * 60 * 1000) {
    booking.status = "cancelled";
    booking.paymentStatus = "failed";
    await booking.save();
    throw new ApiError(400, "Booking has expired");
  }

  try {
    // Create new Razorpay order - Receipt must be max 40 chars
    const bookingIdShort = booking._id.toString().slice(-12);
    const timestamp = Date.now().toString().slice(-8);
    const receipt = `rt_${bookingIdShort}_${timestamp}`.slice(0, 40);
    
    const notes = {
      bookingId: booking._id.toString(),
      userId: booking.user._id.toString(),
      retryAttempt: booking.paymentDetails.retryCount + 1,
    };

    const razorpayOrder = await razorpayService.createOrder(
      booking.pricing.totalAmount,
      "INR",
      receipt,
      notes
    );

    // Update booking
    booking.paymentDetails.razorpayOrderId = razorpayOrder.id;
    booking.status = "payment_pending";
    booking.paymentDetails.retryCount += 1;
    await booking.save();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          retryAttempt: booking.paymentDetails.retryCount,
        },
        "Payment retry order created successfully"
      )
    );
  } catch (error) {
    console.error("Payment retry error:", error);
    throw new ApiError(500, "Failed to create retry payment order");
  }
});

// Webhook handler
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  // Verify webhook signature
  const isValidSignature = razorpayService.verifyWebhookSignature(body, signature);
  
  if (!isValidSignature) {
    console.log("Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body;
  
  try {
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case "order.paid":
        await handleOrderPaid(event.payload.order.entity);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }
    
    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Webhook processing failed");
  }
});

// Helper function to handle payment captured
const handlePaymentCaptured = async (payment) => {
  try {
    const booking = await Booking.findOne({
      "paymentDetails.razorpayOrderId": payment.order_id,
    });

    if (booking) {
      booking.paymentStatus = "completed";
      booking.status = "confirmed";
      booking.paymentDetails.razorpayPaymentId = payment.id;
      booking.paymentDetails.transactionId = payment.id;
      booking.paymentDetails.paymentMethod = payment.method;
      booking.paymentDetails.paidAt = new Date();
      await booking.save();

      console.log(`Payment captured for booking: ${booking._id}`);
    }
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
};

// Helper function to handle payment failed
const handlePaymentFailed = async (payment) => {
  try {
    const booking = await Booking.findOne({
      "paymentDetails.razorpayOrderId": payment.order_id,
    });

    if (booking) {
      booking.paymentStatus = "failed";
      booking.status = "cancelled";
      booking.paymentDetails.failureReason = payment.error_description || "Payment failed";
      await booking.save();

      console.log(`Payment failed for booking: ${booking._id}`);
    }
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
};

// Helper function to handle order paid
const handleOrderPaid = async (order) => {
  try {
    const booking = await Booking.findOne({
      "paymentDetails.razorpayOrderId": order.id,
    });

    if (booking && booking.paymentStatus !== "completed") {
      booking.paymentStatus = "completed";
      booking.status = "confirmed";
      await booking.save();

      console.log(`Order paid for booking: ${booking._id}`);
    }
  } catch (error) {
    console.error("Error handling order paid:", error);
  }
};

export {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  retryPayment,
  handleRazorpayWebhook,
};
