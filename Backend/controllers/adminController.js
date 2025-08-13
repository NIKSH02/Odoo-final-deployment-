import User from "../models/user.js";
import Venue from "../models/venue.js";
import Court from "../models/court.js";
import Booking from "../models/booking.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ====================================
// DASHBOARD ANALYTICS
// ====================================

// Get global dashboard stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await Promise.all([
    // Total users by role
    User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $ne: ["$status", "suspended"] }, 1, 0] },
          },
        },
      },
    ]),

    // Total bookings and revenue
    Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$pricing.totalAmount" },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
        },
      },
    ]),

    // Total active courts and venues
    Venue.countDocuments({ status: "approved", isActive: true }),
    Court.countDocuments({ isActive: true }),

    // Pending facility approvals
    Venue.countDocuments({ status: "pending" }),
  ]);

  const [userStats, bookingStats, totalVenues, totalCourts, pendingApprovals] =
    stats;

  // Format user stats
  const formattedUserStats = {
    totalUsers: 0,
    players: 0,
    facilityOwners: 0,
    admins: 0,
    activeUsers: 0,
  };

  userStats.forEach((stat) => {
    formattedUserStats.totalUsers += stat.count;
    formattedUserStats.activeUsers += stat.active;

    switch (stat._id) {
      case "player":
        formattedUserStats.players = stat.count;
        break;
      case "facility_owner":
        formattedUserStats.facilityOwners = stat.count;
        break;
      case "admin":
        formattedUserStats.admins = stat.count;
        break;
    }
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users: formattedUserStats,
        bookings: bookingStats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          confirmedBookings: 0,
        },
        venues: {
          totalVenues,
          totalCourts,
          pendingApprovals,
        },
      },
      "Dashboard stats fetched successfully"
    )
  );
});

// Get booking activity over time
const getBookingActivity = asyncHandler(async (req, res) => {
  const { period = "30days" } = req.query;

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

  const bookingActivity = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalBookings: { $sum: 1 },
        revenue: { $sum: "$pricing.totalAmount" },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        bookingActivity,
        "Booking activity fetched successfully"
      )
    );
});

// Get user registration trends
const getUserRegistrationTrends = asyncHandler(async (req, res) => {
  const { period = "30days" } = req.query;

  let startDate;
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

  const registrationTrends = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          role: "$role",
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.date",
        players: {
          $sum: { $cond: [{ $eq: ["$_id.role", "player"] }, "$count", 0] },
        },
        facilityOwners: {
          $sum: {
            $cond: [{ $eq: ["$_id.role", "facility_owner"] }, "$count", 0],
          },
        },
        total: { $sum: "$count" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        registrationTrends,
        "User registration trends fetched successfully"
      )
    );
});

// Get most active sports
const getMostActiveSports = asyncHandler(async (req, res) => {
  const activeSports = await Booking.aggregate([
    {
      $lookup: {
        from: "courts",
        localField: "court",
        foreignField: "_id",
        as: "courtInfo",
      },
    },
    {
      $unwind: "$courtInfo",
    },
    {
      $group: {
        _id: "$courtInfo.sportType",
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: "$pricing.totalAmount" },
        uniqueVenues: { $addToSet: "$venue" },
      },
    },
    {
      $project: {
        sportType: "$_id",
        totalBookings: 1,
        totalRevenue: 1,
        venueCount: { $size: "$uniqueVenues" },
      },
    },
    { $sort: { totalBookings: -1 } },
    { $limit: 10 },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        activeSports,
        "Most active sports fetched successfully"
      )
    );
});

// ====================================
// VENUE AND COURT VERIFICATION MANAGEMENT
// ====================================

// Get all venues (pending, approved, rejected) for admin review
const getAllVenuesForReview = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status = "all",
    ownerId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const filter = {};

  if (status && status !== "all") {
    filter.status = status;
  }

  if (ownerId) {
    filter.owner = ownerId;
  }

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const venues = await Venue.find(filter)
    .populate("owner", "fullName email profilePicture createdAt role")
    .populate("approvedBy", "fullName")
    .populate("rejectedBy", "fullName")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  const total = await Venue.countDocuments(filter);

  // Get venue statistics
  const venueStats = await Venue.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  };

  venueStats.forEach((stat) => {
    stats.total += stat.count;
    stats[stat._id] = stat.count;
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        venues,
        stats,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalVenues: total,
        },
      },
      "Venues fetched successfully for admin review"
    )
  );
});

// Suspend an approved venue
const suspendVenue = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const { reason, comments } = req.body;

  const venue = await Venue.findById(venueId);

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  if (venue.status !== "approved") {
    throw new ApiError(400, "Only approved venues can be suspended");
  }

  venue.status = "suspended";
  venue.suspendedBy = req.user.id;
  venue.suspendedAt = new Date();
  venue.suspensionReason = reason;
  venue.suspensionComments = comments;

  await venue.save();

  res
    .status(200)
    .json(new ApiResponse(200, venue, "Venue suspended successfully"));
});

// Reactivate a suspended venue
const reactivateVenue = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const { comments } = req.body;

  const venue = await Venue.findById(venueId);

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  if (venue.status !== "suspended") {
    throw new ApiError(400, "Only suspended venues can be reactivated");
  }

  venue.status = "approved";
  venue.reactivatedBy = req.user.id;
  venue.reactivatedAt = new Date();
  venue.reactivationComments = comments;
  venue.suspendedBy = undefined;
  venue.suspendedAt = undefined;
  venue.suspensionReason = undefined;
  venue.suspensionComments = undefined;

  await venue.save();

  res
    .status(200)
    .json(new ApiResponse(200, venue, "Venue reactivated successfully"));
});

// Get detailed venue information for verification
const getVenueDetails = asyncHandler(async (req, res) => {
  const { venueId } = req.params;

  const venue = await Venue.findById(venueId)
    .populate("owner", "fullName email phone profilePicture createdAt role")
    .populate("approvedBy", "fullName email")
    .populate("rejectedBy", "fullName email")
    .populate("suspendedBy", "fullName email");

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  // Get courts associated with this venue
  const courts = await Court.find({ venue: venueId }).select(
    "name sportType pricePerHour capacity isActive"
  );

  // Get recent bookings for this venue
  const recentBookings = await Booking.find({ venue: venueId })
    .populate("user", "fullName email")
    .populate("court", "name sportType")
    .sort({ createdAt: -1 })
    .limit(10)
    .select("user court bookingDate timeSlot status pricing createdAt");

  // Get booking statistics
  const bookingStats = await Booking.aggregate([
    { $match: { venue: new mongoose.Types.ObjectId(venueId) } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: "$pricing.totalAmount" },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        venue,
        courts,
        recentBookings,
        bookingStats: bookingStats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
        },
      },
      "Venue details fetched successfully"
    )
  );
});

// Bulk venue actions
const bulkVenueActions = asyncHandler(async (req, res) => {
  const { action, venueIds, reason, comments } = req.body;

  if (!["approve", "reject", "suspend"].includes(action)) {
    throw new ApiError(
      400,
      "Invalid action. Must be approve, reject, or suspend"
    );
  }

  if (!Array.isArray(venueIds) || venueIds.length === 0) {
    throw new ApiError(400, "Venue IDs array is required");
  }

  const venues = await Venue.find({ _id: { $in: venueIds } });

  if (venues.length !== venueIds.length) {
    throw new ApiError(404, "One or more venues not found");
  }

  const updates = {};
  const timestamp = new Date();

  switch (action) {
    case "approve":
      updates.status = "approved";
      updates.approvedBy = req.user.id;
      updates.approvedAt = timestamp;
      if (comments) updates.approvalComments = comments;
      break;
    case "reject":
      updates.status = "rejected";
      updates.rejectedBy = req.user.id;
      updates.rejectedAt = timestamp;
      updates.rejectionReason = reason;
      if (comments) updates.rejectionComments = comments;
      break;
    case "suspend":
      updates.status = "suspended";
      updates.suspendedBy = req.user.id;
      updates.suspendedAt = timestamp;
      updates.suspensionReason = reason;
      if (comments) updates.suspensionComments = comments;
      break;
  }

  await Venue.updateMany({ _id: { $in: venueIds } }, updates);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { processedVenues: venues.length },
        `Bulk ${action} completed successfully`
      )
    );
});

// Get compliance report
const getComplianceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const matchFilter =
    dateFilter.$gte || dateFilter.$lte ? { createdAt: dateFilter } : {};

  const [venueCompliance, userCompliance, bookingCompliance, disputedBookings] =
    await Promise.all([
      // Venue compliance stats
      Venue.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgProcessingTime: {
              $avg: {
                $cond: [
                  { $ne: ["$approvedAt", null] },
                  { $subtract: ["$approvedAt", "$createdAt"] },
                  { $subtract: ["$rejectedAt", "$createdAt"] },
                ],
              },
            },
          },
        },
      ]),

      // User compliance stats
      User.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            byRole: {
              $push: {
                role: "$role",
                status: "$status",
              },
            },
          },
        },
      ]),

      // Booking compliance stats
      Booking.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$pricing.totalAmount" },
          },
        },
      ]),

      // Disputed/problematic bookings
      Booking.find({
        ...matchFilter,
        $or: [
          { status: "cancelled" },
          { status: "disputed" },
          { "issues.length": { $gt: 0 } },
        ],
      })
        .populate("venue", "name owner")
        .populate("user", "fullName email")
        .limit(20),
    ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        venueCompliance,
        userCompliance,
        bookingCompliance,
        disputedBookings,
        reportGeneratedAt: new Date(),
        reportPeriod: { startDate, endDate },
      },
      "Compliance report generated successfully"
    )
  );
});

// ====================================
// FACILITY APPROVAL MANAGEMENT
// ====================================

// Get pending facility approvals
const getPendingFacilities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const pendingFacilities = await Venue.find({ status: "pending" })
    .populate("owner", "fullName email profilePicture createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  const total = await Venue.countDocuments({ status: "pending" });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        facilities: pendingFacilities,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalFacilities: total,
        },
      },
      "Pending facilities fetched successfully"
    )
  );
});

// Approve facility
const approveFacility = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const { comments } = req.body;

  const venue = await Venue.findById(venueId).populate("owner");

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  if (venue.status !== "pending") {
    throw new ApiError(400, "Venue is not pending approval");
  }

  venue.status = "approved";
  venue.approvedBy = req.user.id;
  venue.approvedAt = new Date();
  venue.approvalComments = comments;

  await venue.save();

  res
    .status(200)
    .json(new ApiResponse(200, venue, "Facility approved successfully"));
});

// Reject facility
const rejectFacility = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const { reason, comments } = req.body;

  const venue = await Venue.findById(venueId);

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  if (venue.status !== "pending") {
    throw new ApiError(400, "Venue is not pending approval");
  }

  venue.status = "rejected";
  venue.rejectedBy = req.user.id;
  venue.rejectedAt = new Date();
  venue.rejectionReason = reason;
  venue.rejectionComments = comments;

  await venue.save();

  res
    .status(200)
    .json(new ApiResponse(200, venue, "Facility rejected successfully"));
});

// ====================================
// USER MANAGEMENT
// ====================================

// Get all users with filters
const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    role,
    status,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const filter = {};

  if (role && role !== "all") {
    filter.role = role;
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const users = await User.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .select("-password -refreshToken -otp")
    .lean();

  const total = await User.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
        },
      },
      "Users fetched successfully"
    )
  );
});

// Suspend user
const suspendUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason, duration } = req.body; // duration in days

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(403, "Cannot suspend admin users");
  }

  user.status = "suspended";
  user.suspendedBy = req.user.id;
  user.suspensionReason = reason;

  if (duration) {
    user.suspensionEndDate = new Date(
      Date.now() + duration * 24 * 60 * 60 * 1000
    );
  }

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, user, "User suspended successfully"));
});

// Unsuspend user
const unsuspendUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.status = "active";
  user.suspendedBy = undefined;
  user.suspensionReason = undefined;
  user.suspensionEndDate = undefined;

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, user, "User unsuspended successfully"));
});

// Ban user permanently
const banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(403, "Cannot ban admin users");
  }

  user.status = "banned";
  user.suspendedBy = req.user.id;
  user.suspensionReason = reason;

  await user.save();

  res.status(200).json(new ApiResponse(200, user, "User banned successfully"));
});

// Get user booking history
const getUserBookingHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const bookings = await Booking.find({ user: userId })
    .populate("venue", "name address")
    .populate("court", "name sportType")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  const total = await Booking.countDocuments({ user: userId });

  const userStats = await Booking.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: "$pricing.totalAmount" },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        stats: userStats[0] || {
          totalBookings: 0,
          totalSpent: 0,
          confirmedBookings: 0,
        },
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
        },
      },
      "User booking history fetched successfully"
    )
  );
});

// ====================================
// COURT MANAGEMENT
// ====================================

// Get all courts with filtering and pagination for admin
const getAllCourts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sport,
    status,
    venue,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter object
  const filter = {};

  if (sport && sport !== "all") {
    filter.sportType = sport;
  }

  if (status && status !== "all") {
    filter.isActive = status === "active";
  }

  if (venue) {
    filter.venue = venue;
  }

  // Build search criteria
  let searchFilter = {};
  if (search) {
    searchFilter = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { sportType: { $regex: search, $options: "i" } },
      ],
    };
  }

  // Combine filters
  const finalFilter = { ...filter, ...searchFilter };

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [courts, totalCount] = await Promise.all([
    Court.find(finalFilter)
      .populate("venue", "name address city state owner")
      .populate("venue.owner", "fullName email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v"),
    Court.countDocuments(finalFilter),
  ]);

  // Calculate additional metrics for each court
  const courtsWithMetrics = await Promise.all(
    courts.map(async (court) => {
      const bookingStats = await Booking.aggregate([
        { $match: { court: court._id } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: "$pricing.totalAmount" },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
      ]);

      const stats = bookingStats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
      };

      return {
        ...court.toObject(),
        stats,
      };
    })
  );

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        courts: courtsWithMetrics,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
      "Courts fetched successfully"
    )
  );
});

// Update court status (activate/deactivate)
const updateCourtStatus = asyncHandler(async (req, res) => {
  const { courtId } = req.params;
  const { isActive, reason } = req.body;

  const court = await Court.findById(courtId).populate("venue", "name");

  if (!court) {
    throw new ApiError(404, "Court not found");
  }

  court.isActive = isActive;

  // Add status change log if needed
  if (reason) {
    court.statusChangeLog = court.statusChangeLog || [];
    court.statusChangeLog.push({
      changedBy: req.user.id,
      previousStatus: court.isActive,
      newStatus: isActive,
      reason: reason,
      timestamp: new Date(),
    });
  }

  await court.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        court,
        `Court ${isActive ? "activated" : "deactivated"} successfully`
      )
    );
});

// Update court details
const updateCourt = asyncHandler(async (req, res) => {
  const { courtId } = req.params;
  const updateData = req.body;

  const court = await Court.findById(courtId).populate("venue", "name");

  if (!court) {
    throw new ApiError(404, "Court not found");
  }

  // Update only allowed fields
  const allowedFields = [
    "name",
    "courtNumber",
    "sportType",
    "capacity",
    "pricePerHour",
    "features",
    "description",
    "isActive",
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      court[field] = updateData[field];
    }
  });

  await court.save();

  res
    .status(200)
    .json(new ApiResponse(200, court, "Court updated successfully"));
});

// Get court analytics for admin dashboard
const getCourtAnalytics = asyncHandler(async (req, res) => {
  const { period = "30days" } = req.query;

  // Calculate date range
  let startDate = new Date();
  switch (period) {
    case "7days":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30days":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "1year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  const analytics = await Promise.all([
    // Court statistics by sport
    Court.aggregate([
      {
        $group: {
          _id: "$sportType",
          totalCourts: { $sum: 1 },
          activeCourts: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          averagePrice: { $avg: "$pricePerHour" },
          totalCapacity: { $sum: "$capacity" },
        },
      },
      { $sort: { totalCourts: -1 } },
    ]),

    // Top performing courts by revenue
    Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: "courts",
          localField: "court",
          foreignField: "_id",
          as: "courtInfo",
        },
      },
      { $unwind: "$courtInfo" },
      {
        $lookup: {
          from: "venues",
          localField: "venue",
          foreignField: "_id",
          as: "venueInfo",
        },
      },
      { $unwind: "$venueInfo" },
      {
        $group: {
          _id: "$court",
          courtName: { $first: "$courtInfo.name" },
          sportType: { $first: "$courtInfo.sportType" },
          venueName: { $first: "$venueInfo.name" },
          totalRevenue: { $sum: "$pricing.totalAmount" },
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]),

    // Court utilization trends
    Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          bookings: { $sum: 1 },
          revenue: { $sum: "$pricing.totalAmount" },
          uniqueCourts: { $addToSet: "$court" },
        },
      },
      {
        $addFields: {
          uniqueCourtCount: { $size: "$uniqueCourts" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]),

    // Total court statistics
    Court.aggregate([
      {
        $group: {
          _id: null,
          totalCourts: { $sum: 1 },
          activeCourts: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          inactiveCourts: {
            $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
          },
          averagePrice: { $avg: "$pricePerHour" },
          totalCapacity: { $sum: "$capacity" },
        },
      },
    ]),
  ]);

  const [
    sportStatistics,
    topPerformingCourts,
    utilizationTrends,
    overallStats,
  ] = analytics;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        sportStatistics,
        topPerformingCourts,
        utilizationTrends,
        overallStats: overallStats[0] || {
          totalCourts: 0,
          activeCourts: 0,
          inactiveCourts: 0,
          averagePrice: 0,
          totalCapacity: 0,
        },
        period,
      },
      "Court analytics fetched successfully"
    )
  );
});

// ====================================
// BOOKING MANAGEMENT
// ====================================

// Get all bookings for admin management
const getAllBookings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = req.query;

  // Build match conditions
  const matchConditions = {};

  if (status && status !== "all") {
    matchConditions.status = status;
  }

  if (paymentStatus && paymentStatus !== "all") {
    matchConditions.paymentStatus = paymentStatus;
  }

  // Build aggregation pipeline
  const pipeline = [
    { $match: matchConditions },

    // Populate user details
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              fullName: 1,
              email: 1,
              phoneNumber: 1,
              profilePicture: 1,
              role: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$user" },

    // Populate venue details
    {
      $lookup: {
        from: "venues",
        localField: "venue",
        foreignField: "_id",
        as: "venue",
        pipeline: [
          {
            $project: {
              name: 1,
              address: 1,
              contactInfo: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$venue" },

    // Populate court details
    {
      $lookup: {
        from: "courts",
        localField: "court",
        foreignField: "_id",
        as: "court",
        pipeline: [
          {
            $project: {
              name: 1,
              sport: 1,
              pricePerHour: 1,
              capacity: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$court" },
  ];

  // Add search functionality
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { "user.fullName": { $regex: search, $options: "i" } },
          { "user.email": { $regex: search, $options: "i" } },
          { "venue.name": { $regex: search, $options: "i" } },
          { "court.name": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  // Add sorting
  const sortStage = {};
  sortStage[sortBy] = sortOrder === "desc" ? -1 : 1;
  pipeline.push({ $sort: sortStage });

  // Execute aggregation with pagination
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    pagination: true,
  };

  const result = await Booking.aggregatePaginate(
    Booking.aggregate(pipeline),
    options
  );

  // If aggregatePaginate is not available, fall back to manual pagination
  if (!result) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    const totalDocs = await Booking.aggregate([
      ...pipeline.slice(0, -2), // Remove sort and pagination stages
      { $count: "total" },
    ]);

    const total = totalDocs[0]?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bookings,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalDocs: total,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
            limit: parseInt(limit),
          },
        },
        "Bookings fetched successfully"
      )
    );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings: result.docs,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalDocs: result.totalDocs,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
          limit: result.limit,
        },
      },
      "Bookings fetched successfully"
    )
  );
});

export {
  // Dashboard
  getDashboardStats,
  getBookingActivity,
  getUserRegistrationTrends,
  getMostActiveSports,

  // Venue and Court Verification
  getAllVenuesForReview,
  suspendVenue,
  reactivateVenue,
  getVenueDetails,
  bulkVenueActions,
  getComplianceReport,

  // Facility Management
  getPendingFacilities,
  approveFacility,
  rejectFacility,

  // User Management
  getAllUsers,
  suspendUser,
  unsuspendUser,
  banUser,
  getUserBookingHistory,

  // Court Management
  getAllCourts,
  updateCourtStatus,
  updateCourt,
  getCourtAnalytics,

  // Booking Management
  getAllBookings,
};
