import Booking from "../models/booking.js";
import Court from "../models/court.js";
import Venue from "../models/venue.js";
import { updateVenueStatistics } from "./venueController.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create new booking
const createBooking = asyncHandler(async (req, res) => {
  const {
    venue,
    court,
    bookingDate,
    timeSlot,
    duration,
    equipment,
    specialRequests,
    paymentMethod,
  } = req.body;

  // Validate court and venue
  const courtDoc = await Court.findById(court).populate("venue");
  if (!courtDoc) {
    throw new ApiError(404, "Court not found");
  }

  if (courtDoc.venue._id.toString() !== venue) {
    throw new ApiError(400, "Court does not belong to the specified venue");
  }

  if (!courtDoc.isActive) {
    throw new ApiError(400, "Court is not active");
  }

  // Validate booking date (not in the past)
  const bookingDateObj = new Date(bookingDate);
  if (bookingDateObj < new Date().setHours(0, 0, 0, 0)) {
    throw new ApiError(400, "Cannot book for past dates");
  }

  // Check court availability
  const dayOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][bookingDateObj.getDay()];

  if (!courtDoc.operatingHours[dayOfWeek].isAvailable) {
    throw new ApiError(400, "Court is not available on this day");
  }

  // Check operating hours
  const courtStart = courtDoc.operatingHours[dayOfWeek].start;
  const courtEnd = courtDoc.operatingHours[dayOfWeek].end;

  // Helper function to convert time string to minutes for accurate comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (startTime, duration) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + (duration * 60);
    const hours = Math.floor(endMinutes / 60);
    const minutes = endMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const requestStartMinutes = timeToMinutes(timeSlot.startTime);
  const requestEndMinutes = timeToMinutes(timeSlot.endTime);
  const courtStartMinutes = timeToMinutes(courtStart);
  const courtEndMinutes = timeToMinutes(courtEnd);

  if (requestStartMinutes < courtStartMinutes || requestEndMinutes > courtEndMinutes) {
    throw new ApiError(400, `Court operates from ${courtStart} to ${courtEnd}`);
  }

  // Check for blocked slots
  const blockedSlot = courtDoc.blockedSlots.find((slot) => {
    if (slot.date.toDateString() !== bookingDateObj.toDateString()) return false;
    
    const slotStartMinutes = timeToMinutes(slot.startTime);
    const slotEndMinutes = timeToMinutes(slot.endTime);
    
    // Check for overlap
    return (
      (requestStartMinutes >= slotStartMinutes && requestStartMinutes < slotEndMinutes) ||
      (requestEndMinutes > slotStartMinutes && requestEndMinutes <= slotEndMinutes) ||
      (requestStartMinutes <= slotStartMinutes && requestEndMinutes >= slotEndMinutes)
    );
  });

  if (blockedSlot) {
    throw new ApiError(400, `Court is blocked for ${blockedSlot.reason}`);
  }

  // Check for duplicate booking by the same user for the same court and time slot
  const duplicateUserBooking = await Booking.findOne({
    user: req.user.id,
    court,
    bookingDate: bookingDateObj,
    status: { $in: ["pending", "confirmed"] },
    "timeSlot.startTime": timeSlot.startTime,
    "timeSlot.endTime": timeSlot.endTime,
  });

  if (duplicateUserBooking) {
    throw new ApiError(400, "You have already booked this court for the same time slot");
  }

  // Check for existing bookings (time slot conflicts) with proper time overlap detection
  // Get ALL bookings for this court on this date
  const existingBookings = await Booking.find({
    court,
    bookingDate: bookingDateObj,
    status: { $in: ["pending", "confirmed"] },
  });

  // Check each existing booking for time overlap
  for (const existingBooking of existingBookings) {
    const bookingStartMinutes = timeToMinutes(existingBooking.timeSlot.startTime);
    const bookingEndMinutes = timeToMinutes(existingBooking.timeSlot.endTime);
    
    // Check for time overlap using minutes
    const hasOverlap = (
      (requestStartMinutes < bookingEndMinutes) && 
      (requestEndMinutes > bookingStartMinutes)
    );

    if (hasOverlap) {
      throw new ApiError(400, `Court is already booked from ${existingBooking.timeSlot.startTime} to ${existingBooking.timeSlot.endTime}`);
    }
  }

  // Validate timeSlot consistency with duration
  const calculatedEndTime = calculateEndTime(timeSlot.startTime, duration);
  if (timeSlot.endTime !== calculatedEndTime) {
    throw new ApiError(400, `Time slot end time should be ${calculatedEndTime} for ${duration} hour(s) duration`);
  }

  // Calculate pricing
  const basePrice = courtDoc.pricePerHour * duration;
  let equipmentRental = 0;

  const selectedEquipment = [];
  if (equipment && equipment.length > 0) {
    equipment.forEach((eq) => {
      const courtEquipment = courtDoc.equipment.find(
        (ce) => ce.name === eq.name
      );
      if (courtEquipment && courtEquipment.available) {
        const equipmentCost = courtEquipment.rentPrice * eq.quantity * duration;
        equipmentRental += equipmentCost;
        selectedEquipment.push({
          name: eq.name,
          quantity: eq.quantity,
          price: equipmentCost,
        });
      }
    });
  }

  const taxes = (basePrice + equipmentRental) * 0.18; // 18% GST
  const totalAmount = basePrice + equipmentRental + taxes;

  // Create booking
  const booking = new Booking({
    user: req.user.id,
    venue,
    court,
    bookingDate: bookingDateObj,
    timeSlot,
    duration,
    pricing: {
      basePrice,
      equipmentRental,
      taxes,
      discount: 0,
      totalAmount,
    },
    equipment: selectedEquipment,
    specialRequests,
    status: "payment_pending", // Start with payment pending
    paymentStatus: "pending",
    paymentDetails: {
      paymentMethod: paymentMethod || "card",
      paymentGateway: "razorpay",
      retryCount: 0,
    },
  });

  await booking.save();

  await booking.populate([
    { path: "venue", select: "name address" },
    { path: "court", select: "name sportType" },
    { path: "user", select: "fullName email" },
  ]);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        booking,
        nextStep: "payment",
        message: "Booking created successfully. Please complete payment to confirm.",
      },
      "Booking created successfully"
    )
  );
});

// Get user bookings
const getUserBookings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    upcoming = false,
    past = false,
  } = req.query;

  const skip = (page - 1) * limit;
  const filter = { user: req.user.id };

  if (status) {
    filter.status = status;
  }

  if (upcoming === "true") {
    filter.bookingDate = { $gte: new Date() };
  }

  if (past === "true") {
    filter.bookingDate = { $lt: new Date() };
  }

  const bookings = await Booking.find(filter)
    .populate("venue", "name address photos")
    .populate("court", "name sportType")
    .sort({ bookingDate: -1, "timeSlot.startTime": -1 })
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  const total = await Booking.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
        },
      },
      "User bookings fetched successfully"
    )
  );
});

// Get booking by ID
const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate("user", "fullName email profilePicture")
    .populate("venue", "name address photos operatingHours")
    .populate("court", "name sportType features")
    .select("-__v");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user can access this booking
  const venueOwner = await Venue.findById(booking.venue._id).select("owner");
  const canAccess =
    booking.user._id.toString() === req.user.id ||
    venueOwner.owner.toString() === req.user.id;

  if (!canAccess) {
    throw new ApiError(403, "Access denied");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, booking, "Booking details fetched successfully")
    );
});

// Cancel booking
const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.user.toString() !== req.user.id) {
    throw new ApiError(403, "You can only cancel your own bookings");
  }

  if (booking.status === "cancelled") {
    throw new ApiError(400, "Booking is already cancelled");
  }

  if (booking.status === "completed") {
    throw new ApiError(400, "Cannot cancel completed booking");
  }

  // Check if booking is in the future
  const now = new Date();
  const bookingDateTime = new Date(booking.bookingDate);
  const [hours, minutes] = booking.timeSlot.startTime.split(":");
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes));

  if (bookingDateTime <= now) {
    throw new ApiError(400, "Cannot cancel past or ongoing bookings");
  }

  // Calculate refund based on cancellation time
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  let refundPercentage = 0;

  if (hoursUntilBooking >= 24) {
    refundPercentage = 0.9; // 90% refund
  } else if (hoursUntilBooking >= 6) {
    refundPercentage = 0.5; // 50% refund
  } else {
    refundPercentage = 0; // No refund
  }

  const refundAmount = booking.pricing.totalAmount * refundPercentage;

  booking.status = "cancelled";
  booking.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: req.user.id,
    reason: reason || "User cancellation",
    refundAmount,
    refundStatus: refundAmount > 0 ? "pending" : "processed",
  };

  await booking.save();

  res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
});

// Update payment status (simulate payment)
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { transactionId, paymentGateway } = req.body;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.user.toString() !== req.user.id) {
    throw new ApiError(403, "Access denied");
  }

  if (booking.paymentStatus === "completed") {
    throw new ApiError(400, "Payment already completed");
  }

  // Simulate payment processing
  booking.paymentStatus = "completed";
  booking.status = "confirmed";
  booking.paymentDetails = {
    ...booking.paymentDetails,
    transactionId: transactionId || `TXN_${Date.now()}`,
    paymentGateway: paymentGateway || "razorpay",
    paidAt: new Date(),
  };

  await booking.save();

  // Get the venue ID from the court
  const court = await Court.findById(booking.court).populate("venue");
  const venueId = court.venue._id;

  // Update venue statistics with real calculated data
  await updateVenueStatistics(venueId);

  // Update court statistics
  await Court.findByIdAndUpdate(booking.court, {
    $inc: { totalBookings: 1, totalRevenue: booking.pricing.totalAmount },
  });

  res
    .status(200)
    .json(new ApiResponse(200, booking, "Payment completed successfully"));
});

// Get venue bookings (for facility owners)
const getVenueBookings = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const { page = 1, limit = 10, status, date, court } = req.query;

  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can access this endpoint");
  }

  // Verify ownership
  const venue = await Venue.findById(venueId);
  if (!venue || venue.owner.toString() !== req.user.id) {
    throw new ApiError(403, "Access denied");
  }

  const skip = (page - 1) * limit;
  const filter = { venue: venueId };

  if (status) {
    filter.status = status;
  }

  if (date) {
    const searchDate = new Date(date);
    filter.bookingDate = {
      $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
      $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
    };
  }

  if (court) {
    filter.court = court;
  }

  const bookings = await Booking.find(filter)
    .populate("user", "fullName email profilePicture")
    .populate("court", "name sportType")
    .sort({ bookingDate: -1, "timeSlot.startTime": -1 })
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  const total = await Booking.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
        },
      },
      "Venue bookings fetched successfully"
    )
  );
});

// Get all bookings for facility owner (across all venues)
const getOwnerBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status, date, sport } = req.query;

  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can access this endpoint");
  }

  // Get all venues owned by the user
  const ownedVenues = await Venue.find({ owner: req.user.id }).select("_id");
  const venueIds = ownedVenues.map((v) => v._id);

  if (venueIds.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No venues found for this owner"));
  }

  const skip = (page - 1) * limit;
  const filter = { venue: { $in: venueIds } };

  if (status) {
    filter.status = status;
  }

  if (date) {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    filter.bookingDate = {
      $gte: targetDate,
      $lt: nextDay,
    };
  }

  if (sport) {
    // Get courts of specific sport type
    const courts = await Court.find({
      venue: { $in: venueIds },
      sportType: sport,
    }).select("_id");
    const courtIds = courts.map((c) => c._id);
    filter.court = { $in: courtIds };
  }

  const bookings = await Booking.find(filter)
    .populate({
      path: "user",
      select: "name email phone",
    })
    .populate({
      path: "court",
      select: "name sportType pricePerHour",
      populate: {
        path: "venue",
        select: "name address",
      },
    })
    .populate({
      path: "venue",
      select: "name address",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Booking.countDocuments(filter);

  res
    .status(200)
    .json(
      new ApiResponse(200, bookings, "Owner bookings fetched successfully")
    );
});

// Get booking analytics for facility owner
const getBookingAnalytics = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const { period = "30days" } = req.query;

  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can access this endpoint");
  }

  // Verify ownership
  const venue = await Venue.findById(venueId);
  if (!venue || venue.owner.toString() !== req.user.id) {
    throw new ApiError(403, "Access denied");
  }

  let startDate;
  const endDate = new Date();

  switch (period) {
    case "7days":
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30days":
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90days":
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get booking statistics
  const totalBookings = await Booking.countDocuments({
    venue: venueId,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const confirmedBookings = await Booking.countDocuments({
    venue: venueId,
    status: "confirmed",
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const totalRevenue = await Booking.aggregate([
    {
      $match: {
        venue: venue._id,
        status: "confirmed",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$pricing.totalAmount" },
      },
    },
  ]);

  // Daily booking trends
  const dailyBookings = await Booking.aggregate([
    {
      $match: {
        venue: venue._id,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        revenue: { $sum: "$pricing.totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Peak hours analysis
  const peakHours = await Booking.aggregate([
    {
      $match: {
        venue: venue._id,
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$timeSlot.startTime",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          totalBookings,
          confirmedBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          cancellationRate:
            totalBookings > 0
              ? (
                  ((totalBookings - confirmedBookings) / totalBookings) *
                  100
                ).toFixed(1)
              : 0,
        },
        dailyBookings,
        peakHours,
      },
      "Booking analytics fetched successfully"
    )
  );
});

// Mark booking as completed
const markBookingCompleted = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId).populate("venue");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user is venue owner or the booking user
  const canUpdate =
    booking.venue.owner.toString() === req.user.id ||
    booking.user.toString() === req.user.id;

  if (!canUpdate) {
    throw new ApiError(403, "Access denied");
  }

  if (booking.status !== "confirmed") {
    throw new ApiError(
      400,
      "Only confirmed bookings can be marked as completed"
    );
  }

  booking.status = "completed";
  booking.checkOut = {
    time: new Date(),
    verified: true,
  };

  await booking.save();

  res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking marked as completed"));
});

// Update booking status (for facility owners to accept/reject bookings)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status, reason } = req.body;

  // Validate status
  const validStatuses = ["confirmed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      400,
      "Invalid status. Must be 'confirmed' or 'cancelled'"
    );
  }

  const booking = await Booking.findById(bookingId).populate("venue");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user is the venue owner
  if (booking.venue.owner.toString() !== req.user.id) {
    throw new ApiError(403, "Only venue owner can update booking status");
  }

  // Only pending bookings can be updated
  if (booking.status !== "pending") {
    throw new ApiError(400, "Only pending bookings can be updated");
  }

  const oldStatus = booking.status;
  booking.status = status;

  // Add status change history
  if (!booking.statusHistory) {
    booking.statusHistory = [];
  }

  booking.statusHistory.push({
    status: oldStatus,
    changedAt: new Date(),
    changedBy: req.user.id,
    reason:
      reason ||
      `Status changed from ${oldStatus} to ${status} by facility owner`,
  });

  // If booking is confirmed, update payment status if needed
  if (status === "confirmed") {
    // If payment was already completed, keep it as is
    // If payment is pending, it remains pending until user pays
    booking.confirmedAt = new Date();
    booking.confirmedBy = req.user.id;
  }

  // If booking is cancelled by owner
  if (status === "cancelled") {
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: req.user.id,
      reason: reason || "Booking rejected by facility owner",
      refundAmount: booking.pricing.totalAmount, // Full refund for owner cancellation
      refundStatus: "pending",
    };
  }

  await booking.save();

  // Populate the response
  await booking.populate([
    { path: "venue", select: "name address" },
    { path: "court", select: "name sportType" },
    { path: "user", select: "fullName email" },
  ]);

  const message =
    status === "confirmed"
      ? "Booking accepted successfully"
      : "Booking rejected successfully";

  res.status(200).json(new ApiResponse(200, booking, message));
});

// Get venue bookings by specific date (public endpoint for availability checking)
const getVenueBookingsByDate = asyncHandler(async (req, res) => {
  const { venueId, date } = req.params;

  // Validate venue exists
  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  // Parse the date and ensure it's treated as local date
  const searchDate = new Date(date + 'T00:00:00');
  const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 23, 59, 59, 999);

  // Find all bookings for this venue on the specified date
  const bookings = await Booking.find({
    venue: venueId,
    bookingDate: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
    status: { $in: ["confirmed", "pending"] }, // Only confirmed and pending bookings affect availability
  })
    .populate("court", "name sportType")
    .select("court bookingDate timeSlot sport startTime endTime")
    .sort({ "timeSlot.startTime": 1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        date: date,
        total: bookings.length,
      },
      "Venue bookings retrieved successfully"
    )
  );
});

export {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updatePaymentStatus,
  getVenueBookings,
  getOwnerBookings,
  getVenueBookingsByDate,
  getBookingAnalytics,
  markBookingCompleted,
  updateBookingStatus,
};
