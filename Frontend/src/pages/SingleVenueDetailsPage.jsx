import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Clock,
  Star,
  Wifi,
  Car,
  AirVent,
  Shield,
  Droplets,
  Zap,
  Thermometer,
  Cloud,
  Sun,
  AlertTriangle,
} from "lucide-react";
import ImageCarousel from "../components/ImageCarousel";
import SportsAvailable from "../components/SportsAvailable";
import VenueReviews from "../components/VenueReview";
import Amenities from "../components/Amenities";
import VenueMap from "../components/VenueMap";
import { getVenueByIdService } from "../services/venueService";
import { getSportsWithCourtCountsService } from "../services/courtService";
import { getWeatherData } from '../utils/helper';


// Weather Recommendations Component
const WeatherRecommendations = ({ weatherData }) => {
  if (!weatherData || !weatherData.recommendations) return null;

  const { temp, feelsLike, description, humidity, recommendations } = weatherData;

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Weather & Activity Recommendations
        </h3>
        <div className="w-8 h-1 bg-black rounded-full"></div>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
        {/* Current Weather Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{recommendations.icon}</span>
              <div>
                <h4 className="font-bold text-blue-900">Current Temperature</h4>
                <p className="text-2xl font-bold text-blue-700">{Math.round(temp)}°C</p>
              </div>
            </div>
            <p className="text-sm text-blue-600">Feels like {Math.round(feelsLike)}°C</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <Cloud size={24} className="text-green-600" />
              <div>
                <h4 className="font-bold text-green-900">Conditions</h4>
                <p className="text-lg font-bold text-green-700 capitalize">{description}</p>
              </div>
            </div>
            <p className="text-sm text-green-600">Humidity: {humidity}%</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <Sun size={24} className="text-purple-600" />
              <div>
                <h4 className="font-bold text-purple-900">Activity Level</h4>
                <p className="text-sm font-bold text-purple-700">{recommendations.activityLevel}</p>
              </div>
            </div>
            <p className="text-xs text-purple-600">{recommendations.bestTime}</p>
          </div>
        </div>

        {/* Main Recommendation Message */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6 border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-orange-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-orange-900 mb-1">Weather Advisory</h4>
              <p className="text-orange-800 font-medium">{recommendations.message}</p>
            </div>
          </div>
        </div>

        {/* Detailed Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activity Suggestions */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg mb-3">🏃‍♂️ Activity Suggestions</h4>
            {recommendations.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700 font-medium">{suggestion}</p>
              </div>
            ))}
          </div>

          {/* Health & Safety Tips */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg mb-3">🏥 Health & Safety Tips</h4>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Droplets size={18} className="text-blue-600 mt-1" />
                <div>
                  <h5 className="font-bold text-blue-900 text-sm">Hydration</h5>
                  <p className="text-sm text-blue-700">{recommendations.hydrationTip}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-purple-600 mt-1" />
                <div>
                  <h5 className="font-bold text-purple-900 text-sm">Clothing</h5>
                  <p className="text-sm text-purple-700">{recommendations.clothing}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-orange-600 mt-1" />
                <div>
                  <h5 className="font-bold text-orange-900 text-sm">Best Time</h5>
                  <p className="text-sm text-orange-700">{recommendations.bestTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// About Venue Component
const AboutVenue = ({ venue }) => {
  if (!venue?.description) return null;

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          About This Venue
        </h3>
        <div className="w-8 h-1 bg-black rounded-full"></div>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">About This Venue</h4>
              <p className="text-sm text-gray-600">{venue.description}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Starting Price</h4>
              <p className="text-sm text-gray-600">
                From ₹{venue.startingPrice} per hour
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Total Bookings</h4>
              <p className="text-sm text-gray-600">
                {venue.totalBookings || 0} successful bookings
                {venue.totalBookings > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active Venue
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t-2 border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Thank You for Visiting
          </h3>
          <div className="w-8 h-1 bg-black rounded-full mx-auto"></div>
        </div>
        <p className="text-gray-600 font-medium">
          © 2025 Sports Venue Booking Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

// Main Component
const SingleVenueDetailsPage = () => {
  const { id: venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [sportsData, setSportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWeeklyCalendar, setShowWeeklyCalendar] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Check for refresh flag in URL
  const searchParams = new URLSearchParams(window.location.search);
  const shouldRefresh = searchParams.get("refresh") === "true";

  const fetchVenueData = async () => {
    try {
      setLoading(true);

      // Show a success message if this is a refresh after booking
      if (shouldRefresh) {
        // Optional: Show a toast notification instead of alert
        setTimeout(() => {
          const successDiv = document.createElement("div");
          successDiv.innerHTML = `
            <div style="
              position: fixed; 
              top: 20px; 
              right: 20px; 
              background: #10B981; 
              color: white; 
              padding: 12px 20px; 
              border-radius: 8px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              z-index: 1000;
              font-family: system-ui;
              font-weight: 500;
            ">
              ✅ Booking successful! Venue data updated.
            </div>
          `;
          document.body.appendChild(successDiv);
          setTimeout(() => {
            if (document.body.contains(successDiv)) {
              document.body.removeChild(successDiv);
            }
          }, 3000);
        }, 500);
      }

      // Fetch venue details
      const venueResponse = await getVenueByIdService(venueId);
      const venueData = venueResponse.data.data.venue;
      setVenue(venueData);

      // Fetch weather data for the venue's city
      if (venueData?.address?.city) {
        fetchWeatherData(venueData.address.city);
      }

      // Fetch sports with court counts - try both new and old response structure
      try {
        const sportsResponse = await getSportsWithCourtCountsService(venueId);
        const sportsData =
          sportsResponse.data.data.sports || sportsResponse.data.data;

        // If no courts exist but venue has sportsSupported, create placeholder data
        if (
          (!sportsData || sportsData.length === 0) &&
          venueData.sportsSupported &&
          venueData.sportsSupported.length > 0
        ) {
          const placeholderSports = venueData.sportsSupported.map((sport) => ({
            _id: sport,
            totalCourts: 0,
            averagePrice: 0,
            minPrice: 0,
            maxPrice: 0,
            courts: [],
            isPlaceholder: true,
          }));
          setSportsData(placeholderSports);
        } else {
          setSportsData(sportsData);
        }
      } catch (sportErr) {
        console.warn("Could not fetch sports data:", sportErr);

        // Fallback: create placeholder data from venue's sportsSupported
        if (venueData.sportsSupported && venueData.sportsSupported.length > 0) {
          const placeholderSports = venueData.sportsSupported.map((sport) => ({
            _id: sport,
            totalCourts: 0,
            averagePrice: 0,
            minPrice: 0,
            maxPrice: 0,
            courts: [],
            isPlaceholder: true,
          }));
          setSportsData(placeholderSports);
        } else if (venueResponse.data.data.courts) {
          // Fallback: use venue's courts data if available
          const courtsData = venueResponse.data.data.courts;
          setSportsData(courtsData);
        }
      }
    } catch (err) {
      console.error("Error fetching venue data:", err);
      setError(err.response?.data?.message || "Failed to fetch venue data");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (city) => {
    try {
      setWeatherLoading(true);
      const weather = await getWeatherData(city);
      setWeatherData(weather);
      console.log("Weather data fetched:", weather);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      // Don't set error state for weather, just log it
    } finally {
      setWeatherLoading(false);
    }
  };

  // Callback to refresh venue data when a review is added
  const handleReviewAdded = () => {
    // Refresh venue data to get updated rating
    fetchVenueData();
  };

  useEffect(() => {
    if (venueId) {
      fetchVenueData();

      // Clean the URL if refresh flag was present
      if (shouldRefresh) {
        window.history.replaceState({}, "", `/venue/${venueId}`);
      }
    }
  }, [venueId, shouldRefresh]);

  const formatOperatingHours = (operatingHours) => {
    if (!operatingHours) return "Operating hours not available";

    // Find first available day to show hours
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const firstOpenDay = days.find((day) => operatingHours[day]?.isOpen);

    if (firstOpenDay) {
      const dayHours = operatingHours[firstOpenDay];
      return `${dayHours.open} - ${dayHours.close}`;
    }

    return "Closed";
  };

  const formatWeeklySchedule = (operatingHours) => {
    if (!operatingHours) return [];

    const days = [
      { key: "monday", name: "Monday" },
      { key: "tuesday", name: "Tuesday" },
      { key: "wednesday", name: "Wednesday" },
      { key: "thursday", name: "Thursday" },
      { key: "friday", name: "Friday" },
      { key: "saturday", name: "Saturday" },
      { key: "sunday", name: "Sunday" },
    ];

    const schedule = days.map((day) => {
      const dayData = operatingHours[day.key];

      const result = {
        day: day.name,
        isOpen: dayData?.isOpen === true,
        hours:
          dayData?.isOpen === true
            ? `${dayData.open} - ${dayData.close}`
            : "Closed",
        openTime: dayData?.open || null,
        closeTime: dayData?.close || null,
      };

      return result;
    });

    return schedule;
  };

  const WeeklyCalendar = ({ operatingHours, isOpen, onClose }) => {
    const weeklySchedule = formatWeeklySchedule(operatingHours);

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-2">
                  Weekly Operating Hours
                </h3>
                <p className="text-blue-100">
                  Complete schedule for all days of the week
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          {/* Weekly Schedule Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {weeklySchedule.map((schedule, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${
                    schedule.isOpen
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300 hover:shadow-md"
                      : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-4 h-4 rounded-full shadow-sm ${
                        schedule.isOpen ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {schedule.day}
                      </h4>
                      <p
                        className={`text-sm font-medium ${
                          schedule.isOpen ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {schedule.isOpen ? "Open" : "Closed"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold text-xl ${
                        schedule.isOpen ? "text-green-700" : "text-gray-500"
                      }`}
                    >
                      {schedule.hours}
                    </p>
                    {schedule.isOpen &&
                      schedule.openTime &&
                      schedule.closeTime && (
                        <p className="text-sm text-gray-500 mt-1">
                          {Math.abs(
                            parseInt(schedule.closeTime.split(":")[0]) -
                              parseInt(schedule.openTime.split(":")[0])
                          )}{" "}
                          hours
                        </p>
                      )}
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={24} className="text-blue-600" />
                  <h4 className="font-bold text-blue-900 text-lg">Open Days</h4>
                </div>
                <p className="text-3xl font-bold text-blue-700">
                  {weeklySchedule.filter((s) => s.isOpen).length}
                </p>
                <p className="text-blue-600 text-sm mt-1">days per week</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <Star size={24} className="text-purple-600" />
                  <h4 className="font-bold text-purple-900 text-lg">
                    Typical Hours
                  </h4>
                </div>
                <p className="text-lg font-bold text-purple-700">
                  {weeklySchedule.find((s) => s.isOpen)?.hours || "Varies"}
                </p>
                <p className="text-purple-600 text-sm mt-1">standard timing</p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin size={24} className="text-emerald-600" />
                  <h4 className="font-bold text-emerald-900 text-lg">Status</h4>
                </div>
                <p className="text-lg font-bold text-emerald-700">
                  {weeklySchedule.filter((s) => s.isOpen).length > 0
                    ? "Active"
                    : "Closed"}
                </p>
                <p className="text-emerald-600 text-sm mt-1">venue status</p>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-8 text-center">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatAddress = (address) => {
    if (!address) return "Address not available";

    return `${address.street || ""}, ${address.area || ""}, ${
      address.city || ""
    }, ${address.state || ""} - ${address.pincode || ""}`
      .replace(/^,\s*|,\s*,/g, ",")
      .replace(/^,|,$/, "");
  };

  const handleBookVenue = () => {
    navigate(`/venue/${venueId}/booking`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Venue not found</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Venue Header */}
        <div className="mb-6">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {venue.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-600">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPin size={16} className="text-gray-700" />
                </div>
                <span className="font-medium text-sm">
                  {formatAddress(venue.address)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Star size={16} className="fill-black text-black" />
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {venue.rating?.average || "0.0"}
                </span>
                <span className="text-gray-500 text-sm">
                  ({venue.rating?.totalReviews || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image and Sidebar Section - 70/30 split */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Image Carousel - 70% width */}
          <div className="w-full lg:w-[70%]">
            <ImageCarousel images={venue.photos} />
            
          </div>

          {/* Sidebar - 30% width */}
          <div className="w-full lg:w-[30%] space-y-4">
            <button
              onClick={handleBookVenue}
              className="w-full bg-black text-white py-4 px-6 rounded-2xl font-bold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              📅 Book This Venue
            </button>

            {/* Weather Quick Info */}
            {/* {weatherData && (
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Thermometer size={20} className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Current Weather</h3>
                    <div className="w-6 h-0.5 bg-black rounded-full mt-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(weatherData.temp)}°C</p>
                    <p className="text-sm text-gray-600 capitalize">{weatherData.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl">{weatherData.recommendations.icon}</span>
                    <p className="text-xs text-gray-500 mt-1">Feels like {Math.round(weatherData.feelsLike)}°C</p>
                  </div>
                </div>
                {weatherLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                  </div>
                )}
              </div>
            )} */}

            {/* Weather Quick Info */}
            {/* {weatherData && (
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Thermometer size={20} className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Current Weather</h3>
                    <div className="w-6 h-0.5 bg-black rounded-full mt-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(weatherData.temp)}°C</p>
                    <p className="text-sm text-gray-600 capitalize">{weatherData.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl">{weatherData.recommendations.icon}</span>
                    <p className="text-xs text-gray-500 mt-1">Feels like {Math.round(weatherData.feelsLike)}°C</p>
                  </div>
                </div>
                {weatherLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                  </div>
                )}
              </div>
            )} */}

            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <Clock size={18} className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Operating Hours
                  </h3>
                  <div className="w-6 h-0.5 bg-black rounded-full mt-1"></div>
                </div>
              </div>
              <p className="text-base font-bold text-gray-900 bg-gray-50 p-2 rounded-lg mb-2">
                {formatOperatingHours(venue.operatingHours)}
              </p>
              <p className="text-xs text-gray-600 mb-3">
                {venue.status === "active"
                  ? "Open all days"
                  : "Check availability"}
              </p>

              {/* Check Availability Button */}
              <button
                onClick={() => setShowWeeklyCalendar(true)}
                className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <Clock size={14} />
                Check Weekly Schedule
              </button>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <MapPin size={18} className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Venue Address
                  </h3>
                  <div className="w-6 h-0.5 bg-black rounded-full mt-1"></div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="text-gray-700 leading-relaxed font-medium text-sm">
                  {formatAddress(venue.address)}
                </p>
              </div>

              {/* Interactive Map */}
              <VenueMap
                venue={venue}
                height="200px"
                className="rounded-lg"
                showFullAddress={true}
                showDirections={false}
              />
            </div>
          </div>
        </div>

        {/* Sports Available Section - More prominent */}
        <div className="mb-6">
          <SportsAvailable sportsData={sportsData} />
          <WeatherRecommendations weatherData={weatherData} />
          <Amenities amenities={venue.amenities} />
          <AboutVenue venue={venue} />
          <VenueReviews venueId={venueId} onReviewAdded={handleReviewAdded} />
        </div>
      </div>

      <Footer />

      {/* Weekly Calendar Modal */}
      <WeeklyCalendar
        operatingHours={venue?.operatingHours}
        isOpen={showWeeklyCalendar}
        onClose={() => setShowWeeklyCalendar(false)}
      />
    </div>
  );
};

export default SingleVenueDetailsPage;
