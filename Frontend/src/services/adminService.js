import axiosInstance from "../api/axiosInstance";

// Dashboard APIs
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getBookingActivity = async () => {
  try {
    const response = await axiosInstance.get(
      "/admin/dashboard/booking-activity"
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserRegistrationTrends = async () => {
  try {
    const response = await axiosInstance.get(
      "/admin/dashboard/registration-trends"
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMostActiveSports = async () => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/active-sports");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFacilityApprovalTrends = async (period = "30days") => {
  try {
    const response = await axiosInstance.get(
      "/admin/dashboard/facility-approval-trends",
      {
        params: { period },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Booking Management APIs
export const getAllBookingsService = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/admin/bookings${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getBookingStatsService = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/admin/bookings/stats${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRevenueAnalyticsService = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/admin/analytics/revenue${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const adminUpdateBookingStatusService = async (
  bookingId,
  status,
  notes = ""
) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/bookings/${bookingId}/status`,
      { status, notes }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const adminGetBookingByIdService = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/admin/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllUsersWithBookingsService = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/admin/users/bookings${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getVenuePerformanceService = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/admin/venues/performance${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRevenueData = async (period = "30days") => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/revenue", {
      params: { period },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// User Management APIs
export const getAllUsers = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/users", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const suspendUser = async (userId) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/users/${userId}/suspend`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const unsuspendUser = async (userId) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/users/${userId}/unsuspend`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const banUser = async (userId) => {
  try {
    const response = await axiosInstance.patch(`/admin/users/${userId}/ban`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserBookingHistory = async (userId) => {
  try {
    const response = await axiosInstance.get(`/admin/users/${userId}/bookings`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Facility Management APIs
export const getAllVenues = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/facilities", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPendingFacilities = async () => {
  try {
    const response = await axiosInstance.get("/admin/facilities/pending");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getVenueDetails = async (venueId) => {
  try {
    const response = await axiosInstance.get(`/admin/facilities/${venueId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approveFacility = async (venueId, data = {}) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/facilities/${venueId}/approve`,
      {
        comments: data.comments || "Venue approved by admin",
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rejectFacility = async (venueId, data = {}) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/facilities/${venueId}/reject`,
      {
        reason: data.reason || "Venue rejected by admin",
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const suspendVenue = async (venueId, data = {}) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/facilities/${venueId}/suspend`,
      {
        reason: data.reason || "Venue suspended by admin",
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const reactivateVenue = async (venueId, data = {}) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/facilities/${venueId}/reactivate`,
      {
        reason: data.reason || "Venue reactivated by admin",
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const bulkVenueActions = async (actions) => {
  try {
    const response = await axiosInstance.post(
      "/admin/facilities/bulk-actions",
      actions
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reporting APIs
export const getComplianceReport = async () => {
  try {
    const response = await axiosInstance.get("/admin/reports/compliance");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Court Management APIs
export const getAllCourts = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/courts", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCourtStatus = async (courtId, data) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/courts/${courtId}/status`,
      data
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCourt = async (courtId, data) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/courts/${courtId}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCourtAnalytics = async (period = "30days") => {
  try {
    const response = await axiosInstance.get("/admin/courts/analytics", {
      params: { period },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
