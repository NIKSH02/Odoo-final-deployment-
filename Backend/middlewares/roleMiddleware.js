import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Middleware to check if user has required role(s)
export const requireRole = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    console.log('🔍 Role check - Required roles:', roles);
    console.log('🔍 Role check - User role:', req.user.role);
    console.log('🔍 Role check - User ID:', req.user._id || req.user.id);

    if (!req.user.role) {
      throw new ApiError(
        403,
        "Access denied. User role not set. Please contact administrator."
      );
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`
      );
    }

    console.log('✅ Role check passed!');
    next();
  });
};

// Specific role middlewares for cleaner route definitions
export const requirePlayer = requireRole("player");
export const requireFacilityOwner = requireRole("facility_owner");
export const requireAdmin = requireRole("admin");
export const requireAnyRole = requireRole("player", "facility_owner", "admin");
export const requireOwnerOrAdmin = requireRole("facility_owner", "admin");

// Middleware to check resource ownership (for facility owners or admins)
export const requireOwnership = (resourceModel, ownerField = "owner") => {
  return asyncHandler(async (req, res, next) => {
    const resourceId =
      req.params.venueId || req.params.courtId || req.params.id;

    if (!resourceId) {
      throw new ApiError(400, "Resource ID is required");
    }

    const resource = await resourceModel.findById(resourceId);

    if (!resource) {
      throw new ApiError(404, "Resource not found");
    }

    // Admins can access any resource, owners can access their own
    const isOwner = resource[ownerField].toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "You can only access your own resources");
    }

    // Attach resource to request for further use
    req.resource = resource;
    next();
  });
};

// Middleware to check if user can access booking (owner, booker, or admin)
export const requireBookingAccess = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;

  const Booking = (await import("../models/booking.js")).default;
  const Venue = (await import("../models/venue.js")).default;

  const booking = await Booking.findById(bookingId).populate("venue");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user is the booker, venue owner, or admin
  const isBooker = booking.user.toString() === req.user.id;
  const isVenueOwner = booking.venue.owner.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isBooker && !isVenueOwner && !isAdmin) {
    throw new ApiError(403, "Access denied");
  }

  req.booking = booking;
  next();
});
