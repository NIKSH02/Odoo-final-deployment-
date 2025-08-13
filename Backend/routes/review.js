import express from "express";
import {
  createReview,
  createReviewDirect,
  getVenueReviews,
  getReviewById,
  updateReview,
  deleteReview,
  toggleReviewLike,
  addReviewResponse,
  reportReview,
  getUserReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import handleUploadError from "../middlewares/uploadErrorHandler.js";

const router = express.Router();

// Public routes
router.get("/venue/:venueId", getVenueReviews);
router.get("/:reviewId", getReviewById);

// Protected routes (require authentication)
router.post(
  "/",
  protect,
  upload.array("photos", 5),
  handleUploadError,
  createReview
);

router.post(
  "/direct",
  protect,
  upload.array("photos", 5),
  handleUploadError,
  createReviewDirect
);

router.put(
  "/:reviewId",
  protect,
  upload.array("photos", 5),
  handleUploadError,
  updateReview
);

router.delete("/:reviewId", protect, deleteReview);
router.patch("/:reviewId/like", protect, toggleReviewLike);
router.post("/:reviewId/response", protect, addReviewResponse);
router.post("/:reviewId/report", protect, reportReview);
router.get("/user/my-reviews", protect, getUserReviews);

export default router;
