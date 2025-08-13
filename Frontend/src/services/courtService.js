import api from "../api/axiosInstance";

// Get courts by venue ID
export const getCourtsByVenueService = async (venueId, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(
    `/courts/venue/${venueId}${queryParams ? `?${queryParams}` : ""}`
  );
};

// Get court by ID
export const getCourtByIdService = async (courtId) => {
  return api.get(`/courts/${courtId}`);
};

// Get sports with court counts for a venue
export const getSportsWithCourtCountsService = async (venueId) => {
  return api.get(`/courts/venue/${venueId}/sports`);
};

// Get court availability by sport type
export const getCourtAvailabilityBySportService = async (venueId, params) => {
  const { sportType, date, startTime, endTime } = params;
  const queryParams = new URLSearchParams({
    sportType,
    date,
    startTime,
    endTime,
  }).toString();
  return api.get(`/courts/venue/${venueId}/availability?${queryParams}`);
};

// Check specific court availability
export const checkCourtAvailabilityService = async (courtId, params) => {
  const { date, startTime, endTime } = params;
  const queryParams = new URLSearchParams({
    date,
    startTime,
    endTime,
  }).toString();
  return api.get(`/courts/${courtId}/availability?${queryParams}`);
};

// Create a new court (facility owners only)
export const createCourtService = async (courtData) => {
  return api.post("/courts", courtData);
};

// Create multiple courts at once (facility owners only)
export const createBulkCourtsService = async (bulkCourtData) => {
  return api.post("/courts/bulk", bulkCourtData);
};

// Update court (owners only)
export const updateCourtService = async (courtId, updateData) => {
  return api.put(`/courts/${courtId}`, updateData);
};

// Delete court (owners only)
export const deleteCourtService = async (courtId) => {
  return api.delete(`/courts/${courtId}`);
};

// Get courts owned by current user
export const getOwnerCourtsService = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(
    `/courts/owner/my-courts${queryParams ? `?${queryParams}` : ""}`
  );
};

// Toggle court active status
export const toggleCourtStatusService = async (courtId) => {
  return api.patch(`/courts/${courtId}/toggle-status`);
};

// Book a specific court
export const bookCourtService = async (courtId, bookingData) => {
  return api.post(`/courts/${courtId}/book`, bookingData);
};

// Add blocked slot for maintenance
export const addBlockedSlotService = async (courtId, slotData) => {
  return api.post(`/courts/${courtId}/blocked-slots`, slotData);
};

// Remove blocked slot
export const removeBlockedSlotService = async (courtId, slotId) => {
  return api.delete(`/courts/${courtId}/blocked-slots/${slotId}`);
};
