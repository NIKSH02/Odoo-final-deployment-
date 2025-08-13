import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sportsSupported: [
      {
        type: String,
        enum: [
          "badminton",
          "tennis",
          "football",
          "basketball",
          "cricket",
          "volleyball",
          "table_tennis",
        ],
        required: true,
      },
    ],
    amenities: [
      {
        type: String,
        enum: [
          "parking",
          "washroom",
          "drinking_water",
          "changing_room",
          "equipment_rental",
          "cafeteria",
          "ac",
          "lighting",
        ],
      },
    ],
    photos: [
      {
        url: String,
        caption: String,
        isMainPhoto: { type: Boolean, default: false },
      },
    ],
    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    operatingHours: {
      monday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true },
      },
      tuesday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true },
      },
      wednesday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true },
      },
      thursday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true },
      },
      friday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true },
      },
      saturday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true },
      },
      sunday: {
        open: String,
        close: String,
        isOpen: { type: Boolean, default: true },
      },
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Approval workflow fields
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    approvalComments: {
      type: String,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    rejectionComments: {
      type: String,
    },

    // Suspension and reactivation fields
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    suspendedAt: {
      type: Date,
    },
    suspensionReason: {
      type: String,
    },
    suspensionComments: {
      type: String,
    },
    reactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reactivatedAt: {
      type: Date,
    },
    reactivationComments: {
      type: String,
    },

    totalBookings: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for location-based queries
venueSchema.index({ "address.coordinates": "2dsphere" });
venueSchema.index({ sportsSupported: 1 });
venueSchema.index({ startingPrice: 1 });
venueSchema.index({ "rating.average": -1 });
venueSchema.index({ status: 1, isActive: 1 });

const Venue = mongoose.model("Venue", venueSchema);
export default Venue;
