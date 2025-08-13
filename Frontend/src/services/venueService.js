import api from "../api/axiosInstance";
import {
  searchLocations,
  getCurrentLocation,
  reverseGeocode,
} from "./locationService.js";
import { processMultipleImages } from "../utils/imageUtils.js";

// Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Filter venues within radius
export const filterVenuesWithinRadius = (
  venues,
  centerCoordinates,
  radiusKm = 10
) => {
  if (
    !centerCoordinates ||
    !Array.isArray(centerCoordinates) ||
    centerCoordinates.length !== 2
  ) {
    return venues; // Return all venues if no valid coordinates
  }

  const [centerLon, centerLat] = centerCoordinates;

  return venues
    .filter((venue) => {
      if (
        !venue.address?.coordinates?.latitude ||
        !venue.address?.coordinates?.longitude
      ) {
        return false; // Exclude venues without coordinates
      }

      const distance = calculateDistance(
        centerLat,
        centerLon,
        venue.address.coordinates.latitude,
        venue.address.coordinates.longitude
      );

      return distance <= radiusKm;
    })
    .map((venue) => ({
      ...venue,
      distance: calculateDistance(
        centerLat,
        centerLon,
        venue.address.coordinates.latitude,
        venue.address.coordinates.longitude
      ).toFixed(2),
    }));
};

// Get all venues with pagination and filters
export const getAllVenuesService = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(`/venues${queryParams ? `?${queryParams}` : ""}`);
};

// Get venue by ID
export const getVenueByIdService = async (venueId) => {
  return api.get(`/venues/${venueId}`);
};

// Get venues by sport type
export const getVenuesBySportService = async (sportType, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(
    `/search/venues/sport/${sportType}${queryParams ? `?${queryParams}` : ""}`
  );
};

// Search venues by location
export const searchVenuesByLocationService = async (
  searchQuery,
  params = {}
) => {
  const queryParams = new URLSearchParams({
    ...params,
    q: searchQuery,
  }).toString();
  return api.get(`/search/venues?${queryParams}`);
};

// Get venue statistics (for owners)
export const getVenueStatsService = async (venueId) => {
  return api.get(`/venues/${venueId}/stats`);
};

// Create new venue (facility owners only)
export const createVenueService = async (venueData) => {
  if (venueData.photos && venueData.photos.length > 0) {
    const formData = new FormData();

    // Process images to remove EXIF data and correct orientation
    const processedPhotos = await processMultipleImages(venueData.photos, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.9,
    });

    // Append non-file fields
    Object.keys(venueData).forEach((key) => {
      if (key === "photos") {
        // Handle processed photo uploads
        processedPhotos.forEach((photo) => {
          formData.append("photos", photo);
        });
      } else if (typeof venueData[key] === "object") {
        formData.append(key, JSON.stringify(venueData[key]));
      } else {
        formData.append(key, venueData[key]);
      }
    });

    return api.post("/venues", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } else {
    return api.post("/venues", venueData);
  }
};

// Update venue (owners only)
export const updateVenueService = async (venueId, updateData) => {
  if (
    updateData.photos &&
    updateData.photos.some((photo) => photo instanceof File)
  ) {
    const formData = new FormData();

    // Process only the new File objects (not existing URLs)
    const filesToProcess = updateData.photos.filter(
      (photo) => photo instanceof File
    );
    let processedPhotos = [];

    if (filesToProcess.length > 0) {
      processedPhotos = await processMultipleImages(filesToProcess, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
      });
    }

    // Create updated photos array with processed files
    let processedIndex = 0;
    const updatedPhotos = updateData.photos.map((photo) => {
      if (photo instanceof File) {
        return processedPhotos[processedIndex++];
      }
      return photo; // Keep existing URLs as is
    });

    Object.keys(updateData).forEach((key) => {
      if (key === "photos") {
        updatedPhotos.forEach((photo) => {
          if (photo instanceof File) {
            formData.append("photos", photo);
          }
        });
      } else if (typeof updateData[key] === "object") {
        formData.append(key, JSON.stringify(updateData[key]));
      } else {
        formData.append(key, updateData[key]);
      }
    });

    return api.put(`/venues/${venueId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } else {
    return api.put(`/venues/${venueId}`, updateData);
  }
};

// Delete venue (owners only)
export const deleteVenueService = async (venueId) => {
  return api.delete(`/venues/${venueId}`);
};

// Get venues owned by current user
export const getOwnerVenuesService = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return api.get(
    `/venues/owner/my-venues${queryParams ? `?${queryParams}` : ""}`
  );
};

// Toggle venue status (activate/deactivate)
export const toggleVenueStatusService = async (venueId) => {
  return api.patch(`/venues/${venueId}/toggle-status`);
};

// Get venues with advanced filters
export const getFilteredVenuesService = async (filters) => {
  return api.post("/search/venues/filter", filters);
};

// Get nearby venues
export const getNearbyVenuesService = async (
  latitude,
  longitude,
  radius = 10
) => {
  return api.get(
    `/search/venues/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
  );
};

// Location-based venue search with Mapbox integration
export const searchVenuesByMapboxLocation = async (locationQuery) => {
  try {
    // First, search for the location using Mapbox
    const locationResponse = await searchLocations(locationQuery);

    if (
      !locationResponse.success ||
      !locationResponse.data ||
      locationResponse.data.length === 0
    ) {
      throw new Error("Location not found");
    }

    const location = locationResponse.data[0]; // Use the first result
    const [longitude, latitude] = location.center;

    // Log the location details as requested
    console.log("Searching venues for location:", {
      city: location.parsed?.city,
      state: location.parsed?.state,
      country: location.parsed?.country,
      coordinates: [longitude, latitude],
    });

    // Then search for venues near that location
    return await getNearbyVenuesService(latitude, longitude);
  } catch (error) {
    console.error("Error searching venues by location:", error);
    throw error;
  }
};

// Get current location and search nearby venues
export const searchVenuesNearCurrentLocation = async (radius = 10) => {
  try {
    // Get current location
    const position = await getCurrentLocation();
    const { latitude, longitude } = position;

    // Get reverse geocoding for logging
    const locationData = await reverseGeocode(longitude, latitude);

    if (locationData.success && locationData.data) {
      console.log("Current location:", {
        city: locationData.data.parsed?.city,
        state: locationData.data.parsed?.state,
        country: locationData.data.parsed?.country,
        coordinates: [longitude, latitude],
      });
    }

    // Search for venues near current location
    return await getNearbyVenuesService(latitude, longitude, radius);
  } catch (error) {
    console.error("Error searching venues near current location:", error);
    throw error;
  }
};

// Enhanced venue search with location context
export const searchVenuesWithLocationContext = async (filters = {}) => {
  try {
    const {
      location,
      sportType,
      priceRange,
      amenities,
      rating,
      availability,
      radius = 10,
      useCurrentLocation = false,
      ...otherFilters
    } = filters;

    let coordinates = null;
    let locationInfo = null;

    if (useCurrentLocation) {
      // Use current location
      const position = await getCurrentLocation();
      coordinates = [position.longitude, position.latitude];

      // Get location details for logging
      const locationData = await reverseGeocode(
        position.longitude,
        position.latitude
      );
      if (locationData.success && locationData.data) {
        locationInfo = locationData.data;
      }
    } else if (location) {
      // Search for the specified location
      const locationResponse = await searchLocations(location);
      if (
        locationResponse.success &&
        locationResponse.data &&
        locationResponse.data.length > 0
      ) {
        const locationData = locationResponse.data[0];
        coordinates = locationData.center;
        locationInfo = locationData;
      }
    }

    // Log the search context
    if (locationInfo) {
      console.log("Searching venues with context:", {
        city: locationInfo.parsed?.city,
        state: locationInfo.parsed?.state,
        country: locationInfo.parsed?.country,
        coordinates,
        filters: {
          sportType,
          priceRange,
          amenities,
          rating,
          radius,
        },
      });
    }

    // Build search parameters
    const searchParams = {
      ...otherFilters,
      sportType,
      priceRange,
      amenities,
      rating,
      availability,
    };

    // If we have coordinates, search nearby venues
    if (coordinates) {
      const [longitude, latitude] = coordinates;
      searchParams.lat = latitude;
      searchParams.lng = longitude;
      searchParams.radius = radius;

      return api.get("/search/venues/nearby", { params: searchParams });
    } else {
      // Fallback to general search
      return api.get("/search/venues", { params: searchParams });
    }
  } catch (error) {
    console.error("Error in enhanced venue search:", error);
    throw error;
  }
};

// Refresh venue statistics (can be called after bookings)
export const refreshVenueStatisticsService = async (venueId) => {
  try {
    // This will trigger the backend to recalculate stats
    const response = await getVenueByIdService(venueId);
    return response;
  } catch (error) {
    console.error("Error refreshing venue statistics:", error);
    throw error;
  }
};
