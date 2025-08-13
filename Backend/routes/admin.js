import express from "express";
import {
  // Dashboard
  getDashboardStats,
  getBookingActivity,
  getUserRegistrationTrends,
  getMostActiveSports,

  // Venue and Court Verification
  getAllVenuesForReview,
  suspendVenue,
  reactivateVenue,
  getVenueDetails,
  bulkVenueActions,
  getComplianceReport,

  // Facility Management
  getPendingFacilities,
  approveFacility,
  rejectFacility,

  // User Management
  getAllUsers,
  suspendUser,
  unsuspendUser,
  banUser,
  getUserBookingHistory,

  // Court Management
  getAllCourts,
  updateCourtStatus,
  updateCourt,
  getCourtAnalytics,

  // Booking Management
  getAllBookings,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// ====================================
// DASHBOARD ROUTES
// ====================================
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/booking-activity", getBookingActivity);
router.get("/dashboard/registration-trends", getUserRegistrationTrends);
router.get("/dashboard/active-sports", getMostActiveSports);

// ====================================
// FACILITY APPROVAL ROUTES
// ====================================
router.get("/facilities/pending", getPendingFacilities);
router.get("/facilities", getAllVenuesForReview);
router.get("/facilities/:venueId", getVenueDetails);
router.patch("/facilities/:venueId/approve", approveFacility);
router.patch("/facilities/:venueId/reject", rejectFacility);
router.patch("/facilities/:venueId/suspend", suspendVenue);
router.patch("/facilities/:venueId/reactivate", reactivateVenue);
router.post("/facilities/bulk-actions", bulkVenueActions);

// ====================================
// REPORTING AND COMPLIANCE ROUTES
// ====================================
router.get("/reports/compliance", getComplianceReport);

// ====================================
// USER MANAGEMENT ROUTES
// ====================================
router.get("/users", getAllUsers);
router.patch("/users/:userId/suspend", suspendUser);
router.patch("/users/:userId/unsuspend", unsuspendUser);
router.patch("/users/:userId/ban", banUser);
router.get("/users/:userId/bookings", getUserBookingHistory);

// ====================================
// COURT MANAGEMENT ROUTES
// ====================================
router.get("/courts", getAllCourts);
router.patch("/courts/:courtId/status", updateCourtStatus);
router.patch("/courts/:courtId", updateCourt);
router.get("/courts/analytics", getCourtAnalytics);

// ====================================
// BOOKING MANAGEMENT ROUTES
// ====================================
router.get("/bookings", getAllBookings);

export default router;
