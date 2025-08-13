import axiosInstance from "../api/axiosInstance";

// Get reviews for a venue
export const getVenueReviewsService = async (venueId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/reviews/venue/${venueId}`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        rating: params.rating,
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching venue reviews:", error);
    throw error;
  }
};

// Update a review
export const createReviewService = async (reviewData) => {
  try {
    const formData = new FormData();

    // Add text fields
    formData.append("booking", reviewData.booking);
    formData.append("venue", reviewData.venue);
    formData.append("comment", reviewData.comment);
    formData.append("rating", JSON.stringify(reviewData.rating));

    // Add photos if any
    if (reviewData.photos && reviewData.photos.length > 0) {
      reviewData.photos.forEach((photo, index) => {
        formData.append("photos", photo);
      });
    }

    const response = await axiosInstance.post("/reviews", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

// Create a direct review (without booking requirement)
export const createReviewDirectService = async (reviewData) => {
  try {
    const formData = new FormData();

    // Add text fields
    formData.append("venue", reviewData.venue);
    formData.append("comment", reviewData.comment);
    formData.append("rating", JSON.stringify(reviewData.rating));

    // Add photos if any
    if (reviewData.photos && reviewData.photos.length > 0) {
      reviewData.photos.forEach((photo, index) => {
        formData.append("photos", photo);
      });
    }

    const response = await axiosInstance.post("/reviews/direct", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating direct review:", error);
    throw error;
  }
};

// Update a review
export const updateReviewService = async (reviewId, reviewData) => {
  try {
    const formData = new FormData();

    // Add text fields
    if (reviewData.comment) formData.append("comment", reviewData.comment);
    if (reviewData.rating)
      formData.append("rating", JSON.stringify(reviewData.rating));

    // Add new photos if any
    if (reviewData.photos && reviewData.photos.length > 0) {
      reviewData.photos.forEach((photo, index) => {
        formData.append("photos", photo);
      });
    }

    const response = await axiosInstance.put(`/reviews/${reviewId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

// Delete a review
export const deleteReviewService = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

// Like/Unlike a review
export const toggleReviewLikeService = async (reviewId) => {
  try {
    const response = await axiosInstance.patch(`/reviews/${reviewId}/like`);
    return response.data;
  } catch (error) {
    console.error("Error toggling review like:", error);
    throw error;
  }
};

// Add response to a review
export const addReviewResponseService = async (reviewId, message) => {
  try {
    const response = await axiosInstance.post(`/reviews/${reviewId}/response`, {
      message,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding review response:", error);
    throw error;
  }
};

// Report a review
export const reportReviewService = async (reviewId, reason) => {
  try {
    const response = await axiosInstance.post(`/reviews/${reviewId}/report`, {
      reason,
    });
    return response.data;
  } catch (error) {
    console.error("Error reporting review:", error);
    throw error;
  }
};

// Get user's reviews
export const getUserReviewsService = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/reviews/user/my-reviews", {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
};

// Get review by ID
export const getReviewByIdService = async (reviewId) => {
  try {
    const response = await axiosInstance.get(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching review:", error);
    throw error;
  }
};
