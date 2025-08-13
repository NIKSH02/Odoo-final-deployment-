import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false, // Made optional for direct reviews
    },
    rating: {
      overall: { type: Number, required: true, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      facilities: { type: Number, min: 1, max: 5 },
      staff: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    photos: [
      {
        url: String,
        caption: String,
      },
    ],
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        likedAt: { type: Date, default: Date.now },
      },
    ],
    responses: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        respondedAt: { type: Date, default: Date.now },
        isOwnerResponse: { type: Boolean, default: false },
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportDetails: {
      reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      reason: String,
      reportedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ venue: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ "rating.overall": -1 });
reviewSchema.index({ createdAt: -1 });

// Ensure one review per booking (only when booking exists)
reviewSchema.index({ booking: 1 }, { unique: true, sparse: true });

// Ensure one direct review per user per venue (when no booking)
reviewSchema.index(
  { user: 1, venue: 1 },
  {
    unique: true,
    partialFilterExpression: { booking: { $exists: false } },
  }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
