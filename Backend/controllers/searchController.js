import Venue from "../models/venue.js";
import Court from "../models/court.js";
import Booking from "../models/booking.js";
import { getSportsList } from "../utils/sportsConfig.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get home page data
const getHomePageData = asyncHandler(async (req, res) => {
  // Get popular venues (top rated with most bookings)
  const popularVenues = await Venue.find({
    status: "approved",
    isActive: true,
  })
    .sort({ "rating.average": -1, totalBookings: -1 })
    .limit(6)
    .populate("owner", "fullName")
    .select(
      "name address.city startingPrice rating photos sportsSupported totalBookings"
    );

  // Get popular sports (most booked sports)
  const popularSports = await Booking.aggregate([
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
        bookingCount: { $sum: 1 },
        venueCount: { $addToSet: "$venue" },
      },
    },
    {
      $project: {
        sportType: "$_id",
        bookingCount: 1,
        venueCount: { $size: "$venueCount" },
      },
    },
    {
      $sort: { bookingCount: -1 },
    },
    {
      $limit: 6,
    },
  ]);

  // Get featured venues (recently added and approved)
  const featuredVenues = await Venue.find({
    status: "approved",
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .select("name address.city startingPrice rating photos sportsSupported");

  // Get quick stats
  const stats = {
    totalVenues: await Venue.countDocuments({
      status: "approved",
      isActive: true,
    }),
    totalBookings: await Booking.countDocuments(),
    availableSports: getSportsList().length,
    totalCities: await Venue.distinct("address.city", {
      status: "approved",
      isActive: true,
    }).then((cities) => cities.length),
  };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        popularVenues,
        popularSports,
        featuredVenues,
        stats,
      },
      "Home page data fetched successfully"
    )
  );
});

// Global search
const globalSearch = asyncHandler(async (req, res) => {
  const {
    query,
    sport,
    city,
    minPrice,
    maxPrice,
    rating,
    page = 1,
    limit = 12,
  } = req.query;

  if (!query && !sport && !city) {
    throw new ApiError(400, "At least one search parameter is required");
  }

  const skip = (page - 1) * limit;
  const filter = { status: "approved", isActive: true };

  // Text search
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { "address.city": { $regex: query, $options: "i" } },
      { "address.state": { $regex: query, $options: "i" } },
    ];
  }

  // Sport filter
  if (sport) {
    filter.sportsSupported = { $in: [sport] };
  }

  // Location filter
  if (city) {
    filter["address.city"] = { $regex: city, $options: "i" };
  }

  // Price filter
  if (minPrice || maxPrice) {
    filter.startingPrice = {};
    if (minPrice) filter.startingPrice.$gte = Number(minPrice);
    if (maxPrice) filter.startingPrice.$lte = Number(maxPrice);
  }

  // Rating filter
  if (rating) {
    filter["rating.average"] = { $gte: Number(rating) };
  }

  const venues = await Venue.find(filter)
    .populate("owner", "fullName")
    .sort({ "rating.average": -1, totalBookings: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  const total = await Venue.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        venues,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalVenues: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        searchQuery: { query, sport, city, minPrice, maxPrice, rating },
      },
      "Search results fetched successfully"
    )
  );
});

// Get search suggestions
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(200).json(new ApiResponse(200, [], "Query too short"));
  }

  // Get venue name suggestions
  const venueNames = await Venue.find({
    name: { $regex: query, $options: "i" },
    status: "approved",
    isActive: true,
  })
    .select("name")
    .limit(5);

  // Get city suggestions
  const cities = await Venue.distinct("address.city", {
    "address.city": { $regex: query, $options: "i" },
    status: "approved",
    isActive: true,
  }).limit(5);

  // Get sport suggestions
  const sports = getSportsList()
    .filter((sport) => sport.label.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const suggestions = [
    ...venueNames.map((v) => ({ type: "venue", value: v.name, label: v.name })),
    ...cities.map((c) => ({ type: "city", value: c, label: c })),
    ...sports.map((s) => ({ type: "sport", value: s.value, label: s.label })),
  ];

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        suggestions,
        "Search suggestions fetched successfully"
      )
    );
});

// Get available cities
const getAvailableCities = asyncHandler(async (req, res) => {
  const cities = await Venue.aggregate([
    {
      $match: { status: "approved", isActive: true },
    },
    {
      $group: {
        _id: {
          city: "$address.city",
          state: "$address.state",
        },
        venueCount: { $sum: 1 },
      },
    },
    {
      $project: {
        city: "$_id.city",
        state: "$_id.state",
        venueCount: 1,
        _id: 0,
      },
    },
    {
      $sort: { venueCount: -1, city: 1 },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, cities, "Available cities fetched successfully")
    );
});

// Get venue availability for a specific date
const checkVenueAvailability = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const { date } = req.query;

  if (!date) {
    throw new ApiError(400, "Date is required");
  }

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  const searchDate = new Date(date);
  const dayOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][searchDate.getDay()];

  // Check if venue is open on this day
  if (!venue.operatingHours[dayOfWeek].isOpen) {
    return res.status(200).json(
      new ApiResponse(200, {
        available: false,
        reason: "Venue is closed on this day",
        openingHours: venue.operatingHours,
      })
    );
  }

  // Get all courts for this venue
  const courts = await Court.find({ venue: venueId, isActive: true });

  // Check availability for each court
  const courtAvailability = await Promise.all(
    courts.map(async (court) => {
      // Check if court is available on this day
      if (!court.operatingHours[dayOfWeek].isAvailable) {
        return {
          courtId: court._id,
          courtName: court.name,
          sportType: court.sportType,
          available: false,
          reason: "Court not available on this day",
        };
      }

      // Get existing bookings for this court on this date
      const existingBookings = await Booking.find({
        court: court._id,
        bookingDate: searchDate,
        status: { $in: ["confirmed", "pending"] },
      }).select("timeSlot");

      // Check for blocked slots
      const blockedSlots = court.blockedSlots.filter(
        (slot) => slot.date.toDateString() === searchDate.toDateString()
      );

      return {
        courtId: court._id,
        courtName: court.name,
        sportType: court.sportType,
        pricePerHour: court.pricePerHour,
        operatingHours: court.operatingHours[dayOfWeek],
        existingBookings: existingBookings.map((b) => b.timeSlot),
        blockedSlots: blockedSlots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          reason: s.reason,
        })),
        available: true,
      };
    })
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        venue: {
          name: venue.name,
          operatingHours: venue.operatingHours[dayOfWeek],
        },
        date: searchDate,
        courts: courtAvailability,
      },
      "Venue availability checked successfully"
    )
  );
});

// Get nearby venues (if coordinates provided)
const getNearbyVenues = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 10 } = req.query; // radius in km

  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const venues = await Venue.find({
    status: "approved",
    isActive: true,
    "address.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: radius * 1000, // Convert km to meters
      },
    },
  })
    .limit(20)
    .select("name address startingPrice rating photos sportsSupported");

  res
    .status(200)
    .json(new ApiResponse(200, venues, "Nearby venues fetched successfully"));
});

export {
  getHomePageData,
  globalSearch,
  getSearchSuggestions,
  getAvailableCities,
  checkVenueAvailability,
  getNearbyVenues,
};
