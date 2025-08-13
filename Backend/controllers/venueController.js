import Venue from "../models/venue.js";
import Court from "../models/court.js";
import Review from "../models/review.js";
import Booking from "../models/booking.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all venues with filters and pagination
const getAllVenues = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sport,
    minPrice,
    maxPrice,
    city,
    rating,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
    includeAll = false, // New parameter for debugging
  } = req.query;

  const skip = (page - 1) * limit;

  // Build filter object
  // For debugging, allow fetching all venues regardless of status
  const filter =
    includeAll === "true" ? {} : { status: "approved", isActive: true };

  // Debug: Log the filter being used
  console.log("Filter being used:", filter);

  // Debug: Check total venues in database
  const totalVenuesInDb = await Venue.countDocuments({});
  console.log("Total venues in database:", totalVenuesInDb);

  if (sport) {
    filter.sportsSupported = { $in: [sport] };
  }

  if (minPrice || maxPrice) {
    filter.startingPrice = {};
    if (minPrice) filter.startingPrice.$gte = Number(minPrice);
    if (maxPrice) filter.startingPrice.$lte = Number(maxPrice);
  }

  if (city) {
    filter["address.city"] = { $regex: city, $options: "i" };
  }

  if (rating) {
    filter["rating.average"] = { $gte: Number(rating) };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const venues = await Venue.find(filter)
    .populate("owner", "fullName")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  const total = await Venue.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  // Debug logging
  console.log("Venues found:", venues.length);
  console.log("Total matching filter:", total);
  if (venues.length > 0) {
    console.log("Sample venue:", {
      name: venues[0].name,
      status: venues[0].status,
      isActive: venues[0].isActive,
    });
  }

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
      },
      "Venues fetched successfully"
    )
  );
});

// Get venue by ID with full details
const getVenueById = asyncHandler(async (req, res) => {
  const { venueId } = req.params;

  const venue = await Venue.findById(venueId)
    .populate("owner", "fullName email profilePicture")
    .select("-__v");

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  // Get courts for this venue with more detailed information
  const courts = await Court.find({ venue: venueId, isActive: true })
    .select("-__v")
    .populate("venue", "name");

  // Calculate real booking statistics
  const courtIds = courts.map((court) => court._id);

  // Get total completed bookings count
  const totalBookings = await Booking.countDocuments({
    court: { $in: courtIds },
    status: { $in: ["confirmed", "completed"] },
  });

  // Get total earnings from completed bookings
  const earningsResult = await Booking.aggregate([
    {
      $match: {
        court: { $in: courtIds },
        status: { $in: ["confirmed", "completed"] },
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalEarnings =
    earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;

  // Group courts by sport for better organization
  const courtsBySport = courts.reduce((acc, court) => {
    const sport = court.sport;
    if (!acc[sport]) {
      acc[sport] = [];
    }
    acc[sport].push({
      _id: court._id,
      name: court.name,
      features: court.features,
      pricePerHour: court.pricePerHour,
      isActive: court.isActive,
      courtType: court.courtType,
      description: court.description,
    });
    return acc;
  }, {});

  // Get recent reviews with rating breakdown
  const reviews = await Review.find({ venue: venueId })
    .populate("user", "fullName profilePicture")
    .sort({ createdAt: -1 })
    .limit(10)
    .select("-__v");

  // Calculate rating breakdown
  const ratingBreakdown = await Review.aggregate([
    { $match: { venue: venue._id } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  // Ensure photos are properly formatted
  const formattedVenue = {
    ...venue.toObject(),
    photos: venue.photos.map((photo) => ({
      url: photo.url,
      caption: photo.caption || "Venue Photo",
      isMainPhoto: photo.isMainPhoto || false,
      _id: photo._id,
    })),
    // Override with real booking statistics
    totalBookings,
    totalEarnings,
  };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        venue: formattedVenue,
        courts,
        courtsBySport,
        reviews,
        ratingBreakdown,
        totalCourts: courts.length,
        availableSports: Object.keys(courtsBySport),
      },
      "Venue details fetched successfully"
    )
  );
});

// Helper function to update venue statistics (can be called from booking controller)
const updateVenueStatistics = async (venueId) => {
  try {
    // Get all courts for this venue
    const courts = await Court.find({ venue: venueId, isActive: true });
    const courtIds = courts.map((court) => court._id);

    // Calculate real booking statistics
    const totalBookings = await Booking.countDocuments({
      court: { $in: courtIds },
      status: { $in: ["confirmed", "completed"] },
    });

    const earningsResult = await Booking.aggregate([
      {
        $match: {
          court: { $in: courtIds },
          status: { $in: ["confirmed", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalEarnings =
      earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;

    // Update venue with real statistics
    await Venue.findByIdAndUpdate(venueId, {
      totalBookings,
      totalEarnings,
    });

    return { totalBookings, totalEarnings };
  } catch (error) {
    console.error("Error updating venue statistics:", error);
    return { totalBookings: 0, totalEarnings: 0 };
  }
};

// Create new venue (Facility Owner only)
const createVenue = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    address,
    sportsSupported,
    amenities,
    startingPrice,
    operatingHours,
  } = req.body;

  // Check if user is facility owner
  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can create venues");
  }

  // Handle photo uploads
  let photos = [];
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      try {
        const uploadResult = await uploadToCloudinary(req.files[i].buffer, {
          folder: "quickcourt/venues",
          public_id: `venue_${req.user.id}_${Date.now()}_${i}`,
        });
        photos.push({
          url: uploadResult.secure_url,
          caption: req.files[i].originalname,
          isMainPhoto: i === 0,
        });
      } catch (error) {
        console.error("Photo upload failed:", error);
      }
    }
  }

  const venue = new Venue({
    name,
    description,
    address: typeof address === 'string' ? JSON.parse(address) : address,
    owner: req.user.id,
    sportsSupported: typeof sportsSupported === 'string' ? JSON.parse(sportsSupported) : sportsSupported,
    amenities: amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : [],
    photos,
    startingPrice,
    operatingHours: typeof operatingHours === 'string' ? JSON.parse(operatingHours) : operatingHours,
    status: "pending", // All new venues require admin approval
  });

  await venue.save();

  res
    .status(201)
    .json(new ApiResponse(201, venue, "Venue created successfully"));
});

// Update venue (Owner only)
const updateVenue = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const updateData = req.body;

  const venue = await Venue.findById(venueId);

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  // Check if user is the owner
  if (venue.owner.toString() !== req.user.id) {
    throw new ApiError(403, "You can only update your own venues");
  }

  // Handle new photo uploads
  if (req.files && req.files.length > 0) {
    const newPhotos = [];
    for (let i = 0; i < req.files.length; i++) {
      try {
        const uploadResult = await uploadToCloudinary(req.files[i].buffer, {
          folder: "quickcourt/venues",
          public_id: `venue_${venueId}_${Date.now()}_${i}`,
        });
        newPhotos.push({
          url: uploadResult.secure_url,
          caption: req.files[i].originalname,
          isMainPhoto: venue.photos.length === 0 && i === 0,
        });
      } catch (error) {
        console.error("Photo upload failed:", error);
      }
    }
    updateData.photos = [...venue.photos, ...newPhotos];
  }

  // Parse JSON fields if they exist
  ["address", "sportsSupported", "amenities", "operatingHours"].forEach(
    (field) => {
      if (updateData[field] && typeof updateData[field] === "string") {
        updateData[field] = JSON.parse(updateData[field]);
      }
    }
  );

  const updatedVenue = await Venue.findByIdAndUpdate(venueId, updateData, {
    new: true,
    runValidators: true,
  }).populate("owner", "fullName email");

  res
    .status(200)
    .json(new ApiResponse(200, updatedVenue, "Venue updated successfully"));
});

// Delete venue photo
const deleteVenuePhoto = asyncHandler(async (req, res) => {
  const { venueId, photoIndex } = req.params;

  const venue = await Venue.findById(venueId);

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  if (venue.owner.toString() !== req.user.id) {
    throw new ApiError(403, "You can only modify your own venues");
  }

  if (photoIndex >= venue.photos.length) {
    throw new ApiError(404, "Photo not found");
  }

  const photoToDelete = venue.photos[photoIndex];

  // Delete from Cloudinary
  try {
    const publicId = photoToDelete.url.split("/").pop().split(".")[0];
    await deleteFromCloudinary(`quickcourt/venues/${publicId}`);
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
  }

  // Remove photo from array
  venue.photos.splice(photoIndex, 1);
  await venue.save();

  res
    .status(200)
    .json(new ApiResponse(200, venue, "Photo deleted successfully"));
});

// Get venues by owner (Facility Owner only)
const getOwnerVenues = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  if (req.user.role !== "facility_owner") {
    throw new ApiError(403, "Only facility owners can access this endpoint");
  }

  const skip = (page - 1) * limit;
  const filter = { owner: req.user.id };

  if (status) {
    filter.status = status;
  }

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const venues = await Venue.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .select("-__v");

  const total = await Venue.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        venues,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalVenues: total,
        },
      },
      "Owner venues fetched successfully"
    )
  );
});

// Toggle venue active status
const toggleVenueStatus = asyncHandler(async (req, res) => {
  const { venueId } = req.params;

  const venue = await Venue.findById(venueId);

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  if (venue.owner.toString() !== req.user.id) {
    throw new ApiError(403, "You can only modify your own venues");
  }

  venue.isActive = !venue.isActive;
  await venue.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        venue,
        `Venue ${venue.isActive ? "activated" : "deactivated"} successfully`
      )
    );
});

// Get popular venues
const getPopularVenues = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const venues = await Venue.find({
    status: "approved",
    isActive: true,
  })
    .sort({ "rating.average": -1, totalBookings: -1 })
    .limit(Number(limit))
    .populate("owner", "fullName")
    .select("name address.city startingPrice rating photos sportsSupported");

  res
    .status(200)
    .json(new ApiResponse(200, venues, "Popular venues fetched successfully"));
});

export {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenuePhoto,
  getOwnerVenues,
  toggleVenueStatus,
  getPopularVenues,
  updateVenueStatistics,
};
