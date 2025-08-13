import api from "../api/axiosInstance";

// Get bookings by user
export const getUserBookingsService = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(
    `/bookings/my-bookings${queryParams ? `?${queryParams}` : ""}`
  );
};

// Get booking by ID
export const getBookingByIdService = async (bookingId) => {
  return api.get(`/bookings/${bookingId}`);
};

// Create a new booking
export const createBookingService = async (bookingData) => {
  return api.post("/bookings", bookingData);
};

// Update booking status (for facility owners)
export const updateBookingStatusService = async (
  bookingId,
  status,
  notes = ""
) => {
  return api.patch(`/bookings/${bookingId}/status`, { status, notes });
};

// Cancel booking
export const cancelBookingService = async (bookingId, reason = "") => {
  return api.patch(`/bookings/${bookingId}/cancel`, { reason });
};

// Get venue bookings (for facility owners)
export const getVenueBookingsService = async (venueId, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(
    `/bookings/venue/${venueId}${queryParams ? `?${queryParams}` : ""}`
  );
};

// Get all bookings for facility owner (across all venues)
export const getOwnerBookingsService = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(`/bookings/owner/all${queryParams ? `?${queryParams}` : ""}`);
};

// Get venue bookings by specific date
export const getVenueBookingsByDateService = async (venueId, date) => {
  const formattedDate =
    date instanceof Date ? date.toISOString().split("T")[0] : date;
  return api.get(`/bookings/venue/${venueId}/date/${formattedDate}`);
};

// Get booking statistics for venue owners
export const getBookingStatsService = async (venueId, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(
    `/bookings/venue/${venueId}/stats${queryParams ? `?${queryParams}` : ""}`
  );
};

// Get bookings for a specific court and date
export const getCourtBookingsService = async (courtId, date) => {
  return api.get(`/bookings/court/${courtId}/date/${date}`);
};

// Process payment for booking
export const processPaymentService = async (bookingId, paymentData) => {
  return api.post(`/bookings/${bookingId}/payment`, paymentData);
};

// Get payment details for a booking
export const getPaymentDetailsService = async (bookingId) => {
  return api.get(`/bookings/${bookingId}/payment`);
};

// Reschedule booking
export const rescheduleBookingService = async (bookingId, newBookingData) => {
  return api.patch(`/bookings/${bookingId}/reschedule`, newBookingData);
};

// Check booking conflicts
export const checkBookingConflictService = async (courtId, bookingData) => {
  return api.post(`/bookings/check-conflict`, {
    courtId,
    ...bookingData,
  });
};
