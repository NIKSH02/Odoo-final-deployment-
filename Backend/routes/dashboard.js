import express from "express";
import {
  getDashboardOverview,
  getBookingTrends,
  getRevenueBreakdown,
  getPeakHoursAnalysis,
  getRecentActivity,
  getUpcomingBookings,
} from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected and for facility owners only
router.get("/overview", protect, getDashboardOverview);
router.get("/booking-trends", protect, getBookingTrends);
router.get("/revenue-breakdown", protect, getRevenueBreakdown);
router.get("/peak-hours", protect, getPeakHoursAnalysis);
router.get("/recent-activity", protect, getRecentActivity);
router.get("/upcoming-bookings", protect, getUpcomingBookings);

export default router;
