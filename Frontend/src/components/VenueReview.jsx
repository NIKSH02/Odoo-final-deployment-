import React, { useState, useEffect } from "react";
import {
  Star,
  Calendar,
  ThumbsUp,
  ChevronDown,
  Plus,
  X,
  Upload,
  AlertCircle,
} from "lucide-react";
import {
  getVenueReviewsService,
  createReviewDirectService,
  toggleReviewLikeService,
} from "../services/reviewService";
import { useAuth } from "../hooks/useAuth";

// Reviews Component
export default function VenueReviews({ venueId, onReviewAdded }) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();

  // Review form state
  const [newReview, setNewReview] = useState({
    rating: {
      overall: 0,
      cleanliness: 0,
      facilities: 0,
      staff: 0,
      value: 0,
    },
    comment: "",
    photos: [],
  });
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (venueId) {
      fetchReviews();
    }
  }, [venueId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getVenueReviewsService(venueId, { limit: 50 });
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating.overall, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const handleRatingChange = (category, value) => {
    setNewReview((prev) => ({
      ...prev,
      rating: {
        ...prev.rating,
        [category]: value,
      },
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newReview.photos.length > 5) {
      setReviewError("Maximum 5 photos allowed");
      return;
    }
    setNewReview((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files],
    }));
  };

  const removePhoto = (index) => {
    setNewReview((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const submitReview = async () => {
    if (!user) {
      setReviewError("Please login to add a review");
      return;
    }

    if (newReview.rating.overall === 0) {
      setReviewError("Please provide an overall rating");
      return;
    }

    if (newReview.comment.trim().length < 10) {
      setReviewError("Please provide a comment with at least 10 characters");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      // Use direct review service instead of requiring booking
      const reviewData = {
        venue: venueId,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        photos: newReview.photos,
      };

      await createReviewDirectService(reviewData);

      // Reset form
      setNewReview({
        rating: {
          overall: 0,
          cleanliness: 0,
          facilities: 0,
          staff: 0,
          value: 0,
        },
        comment: "",
        photos: [],
      });
      setShowAddReview(false);

      // Refresh reviews
      fetchReviews();

      // Refresh venue data to update rating
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) return;

    try {
      await toggleReviewLikeService(reviewId);
      // Refresh reviews to update like count
      fetchReviews();
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Player Reviews & Ratings
            </h3>
            <div className="w-8 h-1 bg-black rounded-full"></div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={`${
                        i < Math.floor(averageRating)
                          ? "fill-black text-black"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {averageRating}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {reviews.length} total reviews
              </p>
            </div>

            {user && (
              <button
                onClick={() => setShowAddReview(true)}
                className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Add Review
              </button>
            )}
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {averageRating}
              </div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < Math.floor(averageRating)
                        ? "fill-black text-black"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">Overall Rating</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {reviews.length > 0
                  ? Math.round(
                      (reviews.filter((r) => r.rating.overall === 5).length /
                        reviews.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">5-Star Reviews</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {reviews.reduce((sum, r) => sum + (r.likes?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Helpful Votes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Star size={48} className="text-gray-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-gray-600 mb-2">
            No Reviews Yet
          </h4>
          <p className="text-gray-500 mb-4">
            Be the first to share your experience!
          </p>
          {user && (
            <button
              onClick={() => setShowAddReview(true)}
              className=" text-white opacity-80 px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Write First Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {displayedReviews.map((review, index) => (
            <div
              key={review._id || index}
              className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {review.user?.fullName?.charAt(0) || "U"}
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {review.user?.fullName || "Anonymous User"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < review.rating.overall
                                ? "fill-black text-black"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600 font-medium">
                        {review.rating.overall}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={16} />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4 text-base">
                {review.comment}
              </p>

              {/* Review Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {review.photos.slice(0, 3).map((photo, photoIndex) => (
                    <img
                      key={photoIndex}
                      src={photo.url}
                      alt={photo.caption || "Review photo"}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                  {review.photos.length > 3 && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-600">
                      +{review.photos.length - 3}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleLikeReview(review._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    review.likes?.some((like) => like.user === user?.id)
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  disabled={!user}
                >
                  <ThumbsUp size={16} />
                  <span>Helpful ({review.likes?.length || 0})</span>
                </button>

                <div className="flex items-center gap-2">
                  {review.isVerified && (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Verified Booking
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!showAllReviews && reviews.length > 3 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAllReviews(true)}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>Load More Reviews</span>
            <ChevronDown size={20} />
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Showing {displayedReviews.length} of {reviews.length} reviews
          </p>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddReview && (
        <div className="fixed inset-0 bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Write a Review</h3>
                  <p className="text-blue-100">
                    Share your experience with other players
                  </p>
                </div>
                <button
                  onClick={() => setShowAddReview(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {reviewError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600" />
                  <span className="text-red-700">{reviewError}</span>
                </div>
              )}

              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Overall Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange("overall", star)}
                      className="transition-colors"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= newReview.rating.overall
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-medium text-gray-700">
                    {newReview.rating.overall > 0
                      ? `${newReview.rating.overall}/5`
                      : "Select rating"}
                  </span>
                </div>
              </div>

              {/* Detailed Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "cleanliness", label: "Cleanliness" },
                  { key: "facilities", label: "Facilities" },
                  { key: "staff", label: "Staff" },
                  { key: "value", label: "Value for Money" },
                ].map((category) => (
                  <div key={category.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {category.label}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(category.key, star)}
                          className="transition-colors"
                        >
                          <Star
                            size={20}
                            className={`${
                              star <= newReview.rating[category.key]
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Your Review *
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="Share your experience about the venue, facilities, staff, and overall service..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {newReview.comment.length}/1000 characters
                </p>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Add Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">
                      Click to upload photos
                    </p>
                    <p className="text-sm text-gray-500">Maximum 5 photos</p>
                  </label>
                </div>

                {/* Selected Photos */}
                {newReview.photos.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {newReview.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowAddReview(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={
                    submittingReview ||
                    newReview.rating.overall === 0 ||
                    newReview.comment.trim().length < 10
                  }
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    submittingReview ||
                    newReview.rating.overall === 0 ||
                    newReview.comment.trim().length < 10
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
