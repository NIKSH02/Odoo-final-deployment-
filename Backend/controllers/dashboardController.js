import Venue from "../models/venue.js";
import Court from "../models/court.js";
import Booking from "../models/booking.js";
import Review from "../models/review.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get dashboard overview for facility owner
const getDashboardOverview = asyncHandler(async (req, res) => {
  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can access dashboard");
  }

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
    case "1year":
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get user's venues
  const venues = await Venue.find({ owner: req.user.id });
  const venueIds = venues.map((v) => v._id);

  // Get basic stats
  const totalVenues = venues.length;
  const activeVenues = venues.filter(
    (v) => v.isActive && v.status === "approved"
  ).length;

  const totalCourts = await Court.countDocuments({
    venue: { $in: venueIds },
  });

  const activeCourts = await Court.countDocuments({
    venue: { $in: venueIds },
    isActive: true,
  });

  // Booking statistics
  const totalBookings = await Booking.countDocuments({
    venue: { $in: venueIds },
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const confirmedBookings = await Booking.countDocuments({
    venue: { $in: venueIds },
    status: "confirmed",
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const completedBookings = await Booking.countDocuments({
    venue: { $in: venueIds },
    status: "completed",
    createdAt: { $gte: startDate, $lte: endDate },
  });

  // Revenue calculation
  const revenueData = await Booking.aggregate([
    {
      $match: {
        venue: { $in: venueIds },
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$pricing.totalAmount" },
        averageBookingValue: { $avg: "$pricing.totalAmount" },
      },
    },
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;
  const averageBookingValue = revenueData[0]?.averageBookingValue || 0;

  // Today's bookings
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  const todayBookings = await Booking.countDocuments({
    venue: { $in: venueIds },
    bookingDate: { $gte: todayStart, $lte: todayEnd },
  });

  // Upcoming bookings (next 7 days)
  const upcomingBookings = await Booking.countDocuments({
    venue: { $in: venueIds },
    bookingDate: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    status: { $in: ["confirmed", "pending"] },
  });

  // Average rating
  const ratingData = await Review.aggregate([
    {
      $match: {
        venue: { $in: venueIds },
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating.overall" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = ratingData[0]?.averageRating || 0;
  const totalReviews = ratingData[0]?.totalReviews || 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          totalVenues,
          activeVenues,
          totalCourts,
          activeCourts,
          totalBookings,
          confirmedBookings,
          completedBookings,
          totalRevenue,
          averageBookingValue,
          todayBookings,
          upcomingBookings,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
        },
        period,
      },
      "Dashboard overview fetched successfully"
    )
  );
});

// Get booking trends for charts
const getBookingTrends = asyncHandler(async (req, res) => {
  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can access this data");
  }

  const { period = "30days", type = "daily" } = req.query;

  let startDate;
  const endDate = new Date();
  let groupFormat;

  switch (period) {
    case "7days":
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      groupFormat = "%Y-%m-%d";
      break;
    case "30days":
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      groupFormat = type === "daily" ? "%Y-%m-%d" : "%Y-%m";
      break;
    case "90days":
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      groupFormat = "%Y-%m";
      break;
    case "1year":
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      groupFormat = "%Y-%m";
      break;
    default:
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      groupFormat = "%Y-%m-%d";
  }

  const venues = await Venue.find({ owner: req.user.id }).select("_id");
  const venueIds = venues.map((v) => v._id);

  const bookingTrends = await Booking.aggregate([
    {
      $match: {
        venue: { $in: venueIds },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        totalBookings: { $sum: 1 },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
        completedBookings: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        revenue: {
          $sum: {
            $cond: [
              { $in: ["$status", ["confirmed", "completed"]] },
              "$pricing.totalAmount",
              0,
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, bookingTrends, "Booking trends fetched successfully")
    );
});

// Get revenue breakdown
const getRevenueBreakdown = asyncHandler(async (req, res) => {
  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can access this data");
  }

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

  const venues = await Venue.find({ owner: req.user.id }).select("_id");
  const venueIds = venues.map((v) => v._id);

  // Revenue by venue
  const revenueByVenue = await Booking.aggregate([
    {
      $match: {
        venue: { $in: venueIds },
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$venue",
        revenue: { $sum: "$pricing.totalAmount" },
        bookings: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "venues",
        localField: "_id",
        foreignField: "_id",
        as: "venue",
      },
    },
    {
      $unwind: "$venue",
    },
    {
      $project: {
        venueName: "$venue.name",
        revenue: 1,
        bookings: 1,
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  // Revenue by sport type
  const revenueBySport = await Booking.aggregate([
    {
      $match: {
        venue: { $in: venueIds },
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $lookup: {
        from: "courts",
        localField: "court",
        foreignField: "_id",
        as: "court",
      },
    },
    {
      $unwind: "$court",
    },
    {
      $group: {
        _id: "$court.sportType",
        revenue: { $sum: "$pricing.totalAmount" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        revenueByVenue,
        revenueBySport,
      },
      "Revenue breakdown fetched successfully"
    )
  );
});

// Get peak hours analysis
const getPeakHoursAnalysis = asyncHandler(async (req, res) => {
  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can access this data");
  }

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

  const venues = await Venue.find({ owner: req.user.id }).select("_id");
  const venueIds = venues.map((v) => v._id);

  // Peak hours
  const peakHours = await Booking.aggregate([
    {
      $match: {
        venue: { $in: venueIds },
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$timeSlot.startTime",
        bookings: { $sum: 1 },
        revenue: { $sum: "$pricing.totalAmount" },
      },
    },
    { $sort: { bookings: -1 } },
  ]);

  // Peak days
  const peakDays = await Booking.aggregate([
    {
      $match: {
        venue: { $in: venueIds },
        status: { $in: ["confirmed", "completed"] },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$bookingDate" },
        bookings: { $sum: 1 },
        revenue: { $sum: "$pricing.totalAmount" },
      },
    },
    {
      $project: {
        dayName: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", 1] }, then: "Sunday" },
              { case: { $eq: ["$_id", 2] }, then: "Monday" },
              { case: { $eq: ["$_id", 3] }, then: "Tuesday" },
              { case: { $eq: ["$_id", 4] }, then: "Wednesday" },
              { case: { $eq: ["$_id", 5] }, then: "Thursday" },
              { case: { $eq: ["$_id", 6] }, then: "Friday" },
              { case: { $eq: ["$_id", 7] }, then: "Saturday" },
            ],
            default: "Unknown",
          },
        },
        bookings: 1,
        revenue: 1,
      },
    },
    { $sort: { bookings: -1 } },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        peakHours,
        peakDays,
      },
      "Peak hours analysis fetched successfully"
    )
  );
});

// Get recent activity
const getRecentActivity = asyncHandler(async (req, res) => {
  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can access this data");
  }

  const { limit = 10 } = req.query;

  const venues = await Venue.find({ owner: req.user.id }).select("_id");
  const venueIds = venues.map((v) => v._id);

  // Recent bookings
  const recentBookings = await Booking.find({
    venue: { $in: venueIds },
  })
    .populate("user", "fullName")
    .populate("venue", "name")
    .populate("court", "name sportType")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .select("status bookingDate timeSlot pricing.totalAmount createdAt");

  // Recent reviews
  const recentReviews = await Review.find({
    venue: { $in: venueIds },
  })
    .populate("user", "fullName")
    .populate("venue", "name")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .select("rating comment createdAt");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        recentBookings,
        recentReviews,
      },
      "Recent activity fetched successfully"
    )
  );
});

// Get upcoming bookings calendar
const getUpcomingBookings = asyncHandler(async (req, res) => {
  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can access this data");
  }

  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate
    ? new Date(endDate)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const venues = await Venue.find({ owner: req.user.id }).select("_id");
  const venueIds = venues.map((v) => v._id);

  const bookings = await Booking.find({
    venue: { $in: venueIds },
    bookingDate: { $gte: start, $lte: end },
    status: { $in: ["confirmed", "pending"] },
  })
    .populate("user", "fullName email")
    .populate("venue", "name")
    .populate("court", "name sportType")
    .sort({ bookingDate: 1, "timeSlot.startTime": 1 })
    .select("bookingDate timeSlot status pricing user venue court");

  // Group by date for calendar view
  const calendar = {};
  bookings.forEach((booking) => {
    const dateKey = booking.bookingDate.toISOString().split("T")[0];
    if (!calendar[dateKey]) {
      calendar[dateKey] = [];
    }
    calendar[dateKey].push(booking);
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        calendar,
      },
      "Upcoming bookings fetched successfully"
    )
  );
});

export {
  getDashboardOverview,
  getBookingTrends,
  getRevenueBreakdown,
  getPeakHoursAnalysis,
  getRecentActivity,
  getUpcomingBookings,
};
