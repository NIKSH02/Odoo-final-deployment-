import express from "express";
import {
  getHomePageData,
  globalSearch,
  getSearchSuggestions,
  getAvailableCities,
  checkVenueAvailability,
  getNearbyVenues,
} from "../controllers/searchController.js";

const router = express.Router();

// Public routes
router.get("/home", getHomePageData);
router.get("/search", globalSearch);
router.get("/suggestions", getSearchSuggestions);
router.get("/cities", getAvailableCities);
router.get("/venue/:venueId/availability", checkVenueAvailability);
router.get("/nearby", getNearbyVenues);

export default router;
