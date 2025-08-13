import Review from "../models/review.js";
import Booking from "../models/booking.js";
import Venue from "../models/venue.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create review (only for completed bookings)
const createReview = asyncHandler(async (req, res) => {
  const { booking, venue, rating, comment } = req.body;

  // Verify booking exists and belongs to user
  const bookingDoc = await Booking.findById(booking);
  if (!bookingDoc) {
    throw new ApiError(404, "Booking not found");
  }

  if (bookingDoc.user.toString() !== req.user.id) {
    throw new ApiError(403, "You can only review your own bookings");
  }

  if (bookingDoc.status !== "completed") {
    throw new ApiError(400, "You can only review completed bookings");
  }

  if (bookingDoc.venue.toString() !== venue) {
    throw new ApiError(400, "Venue does not match booking");
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ booking });
  if (existingReview) {
    throw new ApiError(400, "Review already exists for this booking");
  }

  // Handle photo uploads
  let photos = [];
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      try {
        const uploadResult = await uploadToCloudinary(req.files[i].buffer, {
          folder: "quickcourt/reviews",
          public_id: `review_${req.user.id}_${Date.now()}_${i}`,
        });
        photos.push({
          url: uploadResult.secure_url,
          caption: req.files[i].originalname,
        });
      } catch (error) {
        console.error("Photo upload failed:", error);
      }
    }
  }

  // Parse rating if it's a string
  const parsedRating = typeof rating === "string" ? JSON.parse(rating) : rating;

  const review = new Review({
    user: req.user.id,
    venue,
    booking,
    rating: parsedRating,
    comment,
    photos,
    isVerified: true, // Since it's based on actual booking
  });

  await review.save();

  // Update venue rating
  await updateVenueRating(venue);

  await review.populate([
    { path: "user", select: "fullName profilePicture" },
    { path: "venue", select: "name" },
  ]);

  res
    .status(201)
    .json(new ApiResponse(201, review, "Review created successfully"));
});

// Create review without booking requirement (for testing/demo)
const createReviewDirect = asyncHandler(async (req, res) => {
  const { venue, rating, comment } = req.body;

  // Verify venue exists
  const venueDoc = await Venue.findById(venue);
  if (!venueDoc) {
    throw new ApiError(404, "Venue not found");
  }

  // Check if user already reviewed this venue (limit one review per venue per user without booking)
  const existingReview = await Review.findOne({
    user: req.user.id,
    venue: venue,
    booking: { $exists: false },
  });
  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this venue");
  }

  // Handle photo uploads
  let photos = [];
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      try {
        const uploadResult = await uploadToCloudinary(req.files[i].buffer, {
          folder: "quickcourt/reviews",
          public_id: `review_${req.user.id}_${Date.now()}_${i}`,
        });
        photos.push({
          url: uploadResult.secure_url,
          caption: req.files[i].originalname,
        });
      } catch (error) {
        console.error("Photo upload failed:", error);
      }
    }
  }

  // Parse rating if it's a string
  const parsedRating = typeof rating === "string" ? JSON.parse(rating) : rating;

  const review = new Review({
    user: req.user.id,
    venue,
    rating: parsedRating,
    comment,
    photos,
    isVerified: false, // Not based on actual booking
  });

  await review.save();

  // Update venue rating
  await updateVenueRating(venue);

  await review.populate([
    { path: "user", select: "fullName profilePicture" },
    { path: "venue", select: "name" },
  ]);

  res
    .status(201)
    .json(new ApiResponse(201, review, "Review created successfully"));
});

// Get reviews for a venue
const getVenueReviews = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const {
    page = 1,
    limit = 10,
    rating,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const filter = { venue: venueId };

  if (rating) {
    filter["rating.overall"] = Number(rating);
  }

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const reviews = await Review.find(filter)
    .populate("user", "fullName profilePicture")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  const total = await Review.countDocuments(filter);

  // Get rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { venue: venueId } },
    {
      $group: {
        _id: "$rating.overall",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
        },
        ratingDistribution,
      },
      "Reviews fetched successfully"
    )
  );
});

// Get review by ID
const getReviewById = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId)
    .populate("user", "fullName profilePicture")
    .populate("venue", "name")
    .populate("booking", "bookingDate court")
    .select("-__v");

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, review, "Review details fetched successfully"));
});

// Update review (only by review author)
const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.user.toString() !== req.user.id) {
    throw new ApiError(403, "You can only update your own reviews");
  }

  // Handle new photo uploads
  let newPhotos = [...review.photos];
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      try {
        const uploadResult = await uploadToCloudinary(req.files[i].buffer, {
          folder: "quickcourt/reviews",
          public_id: `review_${reviewId}_${Date.now()}_${i}`,
        });
        newPhotos.push({
          url: uploadResult.secure_url,
          caption: req.files[i].originalname,
        });
      } catch (error) {
        console.error("Photo upload failed:", error);
      }
    }
  }

  const updateData = {};
  if (rating) {
    updateData.rating =
      typeof rating === "string" ? JSON.parse(rating) : rating;
  }
  if (comment) updateData.comment = comment;
  if (newPhotos.length > review.photos.length) {
    updateData.photos = newPhotos;
  }

  const updatedReview = await Review.findByIdAndUpdate(reviewId, updateData, {
    new: true,
    runValidators: true,
  }).populate("user", "fullName profilePicture");

  // Update venue rating if rating changed
  if (rating) {
    await updateVenueRating(review.venue);
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedReview, "Review updated successfully"));
});

// Delete review
const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.user.toString() !== req.user.id) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  await Review.findByIdAndDelete(reviewId);

  // Update venue rating
  await updateVenueRating(review.venue);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Review deleted successfully"));
});

// Like/Unlike review
const toggleReviewLike = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  const existingLikeIndex = review.likes.findIndex(
    (like) => like.user.toString() === req.user.id
  );

  if (existingLikeIndex > -1) {
    // Unlike
    review.likes.splice(existingLikeIndex, 1);
  } else {
    // Like
    review.likes.push({
      user: req.user.id,
      likedAt: new Date(),
    });
  }

  await review.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        liked: existingLikeIndex === -1,
        likesCount: review.likes.length,
      },
      "Review like status updated"
    )
  );
});

// Add response to review (venue owner)
const addReviewResponse = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { message } = req.body;

  const review = await Review.findById(reviewId).populate("venue");

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user is venue owner
  const isOwner = review.venue.owner.toString() === req.user.id;

  if (!isOwner && req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only venue owners can respond to reviews");
  }

  review.responses.push({
    user: req.user.id,
    message,
    respondedAt: new Date(),
    isOwnerResponse: isOwner,
  });

  await review.save();
  await review.populate("responses.user", "fullName profilePicture");

  res
    .status(200)
    .json(new ApiResponse(200, review, "Response added successfully"));
});

// Report review
const reportReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reason } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user already reported this review
  if (review.reportDetails.reportedBy.includes(req.user.id)) {
    throw new ApiError(400, "You have already reported this review");
  }

  review.reportDetails.reportedBy.push(req.user.id);
  review.reportDetails.reason = reason;
  review.reportDetails.reportedAt = new Date();
  review.isReported = true;

  await review.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Review reported successfully"));
});

// Get user's reviews
const getUserReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const filter = { user: req.user.id };

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const reviews = await Review.find(filter)
    .populate("venue", "name address photos")
    .populate("booking", "bookingDate")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  const total = await Review.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
        },
      },
      "User reviews fetched successfully"
    )
  );
});

// Helper function to update venue rating
const updateVenueRating = async (venueId) => {
  try {
    console.log("Updating venue rating for venue:", venueId);

    const ratingStats = await Review.aggregate([
      { $match: { venue: new mongoose.Types.ObjectId(venueId) } },
      {
        $group: {
          _id: "$venue",
          averageRating: { $avg: "$rating.overall" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    console.log("Rating stats:", ratingStats);

    if (ratingStats.length > 0) {
      const { averageRating, totalReviews } = ratingStats[0];
      const updateResult = await Venue.findByIdAndUpdate(
        venueId,
        {
          "rating.average": Math.round(averageRating * 10) / 10, // Round to 1 decimal
          "rating.totalReviews": totalReviews,
        },
        { new: true }
      );
      console.log("Updated venue rating:", updateResult?.rating);
    } else {
      // No reviews left
      const updateResult = await Venue.findByIdAndUpdate(
        venueId,
        {
          "rating.average": 0,
          "rating.totalReviews": 0,
        },
        { new: true }
      );
      console.log("Reset venue rating to 0:", updateResult?.rating);
    }
  } catch (error) {
    console.error("Error updating venue rating:", error);
  }
};

export {
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
};
