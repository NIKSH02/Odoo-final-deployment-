import express from "express";
import {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenuePhoto,
  getOwnerVenues,
  toggleVenueStatus,
  getPopularVenues,
} from "../controllers/venueController.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  requireFacilityOwner,
  requireAnyRole,
  requireOwnership,
} from "../middlewares/roleMiddleware.js";
import Venue from "../models/venue.js";
import upload from "../middlewares/uploadMiddleware.js";
import handleUploadError from "../middlewares/uploadErrorHandler.js";

const router = express.Router();

// ================================
// PUBLIC ROUTES (No Authentication)
// ================================
router.get("/", getAllVenues); // Anyone can browse venues
router.get("/popular", getPopularVenues); // Anyone can see popular venues
router.get("/:venueId", getVenueById); // Anyone can view venue details

// ================================
// FACILITY OWNER ONLY ROUTES
// ================================
// Create new venue
router.post(
  "/",
  protect,
  requireFacilityOwner,
  upload.array("photos", 10),
  handleUploadError,
  createVenue
);

// Update venue (owner only)
router.put(
  "/:venueId",
  protect,
  requireFacilityOwner,
  requireOwnership(Venue),
  upload.array("photos", 10),
  handleUploadError,
  updateVenue
);

// Delete venue photo (owner only)
router.delete(
  "/:venueId/photos/:photoIndex",
  protect,
  requireFacilityOwner,
  requireOwnership(Venue),
  deleteVenuePhoto
);

// Get owner's venues
router.get("/owner/my-venues", protect, requireFacilityOwner, getOwnerVenues);

// Toggle venue status (owner only)
router.patch(
  "/:venueId/toggle-status",
  protect,
  requireFacilityOwner,
  requireOwnership(Venue),
  toggleVenueStatus
);

export default router;
