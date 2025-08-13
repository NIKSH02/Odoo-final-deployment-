import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updatePaymentStatus,
  getVenueBookings,
  getOwnerBookings,
  getVenueBookingsByDate,
  getBookingAnalytics,
  markBookingCompleted,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  requirePlayer,
  requireFacilityOwner,
  requireAnyRole,
  requireBookingAccess,
  requireOwnership,
} from "../middlewares/roleMiddleware.js";
import Venue from "../models/venue.js";

const router = express.Router();

// ================================
// PLAYER ONLY ROUTES
// ================================
// Create new booking (players only)
router.post("/", protect, requirePlayer, createBooking);

// Get user's own bookings (players only)
router.get("/my-bookings", protect, requirePlayer, getUserBookings);

// Cancel own booking (players only)
router.patch("/:bookingId/cancel", protect, requirePlayer, cancelBooking);

// Update payment status (players only)
router.patch(
  "/:bookingId/payment",
  protect,
  requirePlayer,
  updatePaymentStatus
);

// ================================
// BOTH PLAYER & FACILITY OWNER ROUTES
// ================================
// Get booking details (booker or venue owner can access)
router.get(
  "/:bookingId",
  protect,
  requireAnyRole,
  requireBookingAccess,
  getBookingById
);

// Mark booking as completed (booker or venue owner can mark)
router.patch(
  "/:bookingId/complete",
  protect,
  requireAnyRole,
  requireBookingAccess,
  markBookingCompleted
);

// ================================
// FACILITY OWNER ONLY ROUTES
// ================================
// Get all bookings across all venues for owner (facility owners only)
router.get("/owner/all", protect, requireFacilityOwner, getOwnerBookings);

// Update booking status (accept/reject bookings - facility owners only)
router.patch(
  "/:bookingId/status",
  protect,
  requireFacilityOwner,
  updateBookingStatus
);

// Get all bookings for a venue (facility owners only)
router.get(
  "/venue/:venueId",
  protect,
  requireFacilityOwner,
  requireOwnership(Venue),
  getVenueBookings
);

// Get venue bookings by specific date (public for availability checking)
router.get("/venue/:venueId/date/:date", getVenueBookingsByDate);

// Get booking analytics for a venue (facility owners only)
router.get(
  "/venue/:venueId/analytics",
  protect,
  requireFacilityOwner,
  requireOwnership(Venue),
  getBookingAnalytics
);

export default router;
