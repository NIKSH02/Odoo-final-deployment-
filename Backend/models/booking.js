import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      startTime: { type: String, required: true }, // Format: "HH:MM"
      endTime: { type: String, required: true }, // Format: "HH:MM"
    },
    duration: {
      type: Number, // in hours
      required: true,
      min: 0.5,
      max: 12,
    },
    pricing: {
      basePrice: { type: Number, required: true },
      equipmentRental: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    equipment: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no_show", "payment_pending"],
      default: "payment_pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refund_pending", "refunded"],
      default: "pending",
    },
    paymentDetails: {
      transactionId: String,
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paymentMethod: {
        type: String,
        enum: ["card", "upi", "wallet", "cash", "netbanking"],
        default: "card",
      },
      paymentGateway: {
        type: String,
        default: "razorpay",
      },
      paidAt: Date,
      failureReason: String,
      retryCount: {
        type: Number,
        default: 0,
      },
    },
    cancellation: {
      cancelledAt: Date,
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: String,
      refundAmount: Number,
      refundStatus: {
        type: String,
        enum: ["pending", "processed", "failed"],
        default: "pending",
      },
    },
    checkIn: {
      time: Date,
      verified: { type: Boolean, default: false },
    },
    checkOut: {
      time: Date,
      verified: { type: Boolean, default: false },
    },
    specialRequests: String,
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDetails: {
      frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
      endDate: Date,
      daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ user: 1 });
bookingSchema.index({ venue: 1 });
bookingSchema.index({ court: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({
  bookingDate: 1,
  "timeSlot.startTime": 1,
  "timeSlot.endTime": 1,
});

// Compound index for availability checking
bookingSchema.index({ court: 1, bookingDate: 1, status: 1 });

// Add aggregate paginate plugin
bookingSchema.plugin(mongooseAggregatePaginate);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
