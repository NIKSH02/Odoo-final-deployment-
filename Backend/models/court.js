import mongoose from "mongoose";

const courtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    courtNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    sportType: {
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
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    dimensions: {
      length: Number,
      width: Number,
      unit: { type: String, enum: ["meters", "feet"], default: "meters" },
    },
    features: [
      {
        type: String,
        enum: [
          "indoor",
          "outdoor",
          "air_conditioned",
          "floodlights",
          "synthetic_turf",
          "wooden_floor",
          "concrete",
        ],
      },
    ],
    equipment: [
      {
        name: String,
        available: { type: Boolean, default: true },
        rentPrice: { type: Number, default: 0 },
      },
    ],
    operatingHours: {
      monday: {
        start: String,
        end: String,
        isAvailable: { type: Boolean, default: true },
      },
      tuesday: {
        start: String,
        end: String,
        isAvailable: { type: Boolean, default: true },
      },
      wednesday: {
        start: String,
        end: String,
        isAvailable: { type: Boolean, default: true },
      },
      thursday: {
        start: String,
        end: String,
        isAvailable: { type: Boolean, default: true },
      },
      friday: {
        start: String,
        end: String,
        isAvailable: { type: Boolean, default: true },
      },
      saturday: {
        start: String,
        end: String,
        isAvailable: { type: Boolean, default: true },
      },
      sunday: {
        start: String,
        end: String,
        isAvailable: { type: Boolean, default: true },
      },
    },
    blockedSlots: [
      {
        date: Date,
        startTime: String,
        endTime: String,
        reason: String,
        type: {
          type: String,
          enum: ["maintenance", "private_event", "holiday"],
          default: "maintenance",
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courtSchema.index({ venue: 1 });
courtSchema.index({ sportType: 1 });
courtSchema.index({ pricePerHour: 1 });
courtSchema.index({ isActive: 1 });
// Compound index to ensure unique court numbers per sport type per venue
courtSchema.index({ venue: 1, sportType: 1, courtNumber: 1 }, { unique: true });

const Court = mongoose.model("Court", courtSchema);
export default Court;
