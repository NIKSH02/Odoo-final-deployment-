import express from "express";
import {
  getCourtsByVenue,
  getCourtById,
  createCourt,
  createBulkCourts,
  updateCourt,
  deleteCourt,
  getOwnerCourts,
  toggleCourtStatus,
  addBlockedSlot,
  removeBlockedSlot,
  checkCourtAvailability,
  getCourtAvailabilityBySport,
  getCourtSchedule,
  getSportsWithCourtCounts,
  bookCourt,
} from "../controllers/courtController.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  requireFacilityOwner,
  requirePlayer,
} from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public routes
router.get("/venue/:venueId", getCourtsByVenue);
router.get("/venue/:venueId/sports", getSportsWithCourtCounts);
router.get("/venue/:venueId/availability", getCourtAvailabilityBySport);

// Owner-specific routes (must come before /:courtId to avoid conflicts)
router.get("/owner/my-courts", protect, getOwnerCourts);

// Court-specific routes
router.get("/:courtId", getCourtById);
router.get("/:courtId/availability", checkCourtAvailability);
router.get("/:courtId/schedule", getCourtSchedule);

// Protected routes (require authentication)
// Facility Owner routes
router.post("/", protect, requireFacilityOwner, createCourt);
router.post("/bulk", protect, requireFacilityOwner, createBulkCourts);
router.put("/:courtId", protect, updateCourt);
router.delete("/:courtId", protect, deleteCourt);
router.patch("/:courtId/toggle-status", protect, toggleCourtStatus);

// Player routes
router.post("/:courtId/book", protect, requirePlayer, bookCourt);

// Blocked slots management
router.post("/:courtId/blocked-slots", protect, addBlockedSlot);
router.delete("/:courtId/blocked-slots/:slotId", protect, removeBlockedSlot);

export default router;
