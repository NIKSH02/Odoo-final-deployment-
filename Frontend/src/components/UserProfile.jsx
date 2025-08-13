import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { processImageFile } from "../utils/imageUtils";
import {
  User,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  Edit3,
  Key,
  Eye,
  DollarSign,
} from "lucide-react";
import Navbar from "./Navbar";
import ProfileImage from "./ProfileImage";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import {
  getCurrentUserService,
  updateProfileService,
  updateProfilePictureService,
} from "../services/userService";
import { forgotPasswordService } from "../services/authService";
import { getUserBookingsService } from "../services/bookingService";

const UserProfile = () => {
  const { updateUser } = useAuth();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();
  const location = useLocation();

  // Check URL parameters for default tab
  const searchParams = new URLSearchParams(location.search);
  const urlTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(
    urlTab === "bookings" ? "myBookings" : "editProfile"
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State for user data
  const [userData, setUserData] = useState({
    fullName: "",
    username: "",
    email: "",
    role: "",
    profilePicture: null,
  });

  // State for editable profile data
  const [editableProfileData, setEditableProfileData] = useState({
    fullName: "",
  });

  // State for bookings
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch user bookings
  const fetchUserBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const response = await getUserBookingsService();
      if (response.data && response.data.success) {
        // The API returns bookings in response.data.data.bookings
        setBookings(response.data.data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      // Fall back to empty array if API fails
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  // Fetch user data on component mount
  const fetchUserData = useCallback(async () => {
    try {
      const response = await getCurrentUserService();
      if (response.data && response.data.data) {
        const user = response.data.data;
        setUserData(user);
        setEditableProfileData({
          fullName: user.fullName || "",
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      showError("Failed to load user data");
    }
  }, [showError]);

  useEffect(() => {
    fetchUserData();
    fetchUserBookings();
  }, [fetchUserData, fetchUserBookings]);

  // Helper functions for formatting
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "confirmed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "completed":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  // Booking Detail Modal Component
  const BookingDetailModal = ({ booking, isOpen, onClose }) => {
    if (!isOpen || !booking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Booking Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Venue Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Venue Information
                </h3>
                <div className="space-y-2">
                  <div className="text-gray-700">{booking.venue.name}</div>
                  <div className="text-gray-600 text-sm">
                    {booking.venue.address?.street &&
                      `${booking.venue.address.street}, `}
                    {booking.venue.address.city}, {booking.venue.address.state}
                    {booking.venue.address?.zipCode &&
                      ` ${booking.venue.address.zipCode}`}
                  </div>
                </div>
              </div>

              {/* Court Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Court Information
                </h3>
                <div className="space-y-2">
                  <div className="text-gray-700">{booking.court.name}</div>
                  <div className="text-gray-600 text-sm capitalize">
                    {booking.court.sportType}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Booking Details
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {formatDate(booking.bookingDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {formatTime(booking.timeSlot.startTime)} -{" "}
                      {formatTime(booking.timeSlot.endTime)}
                    </span>
                  </div>
                  {booking.duration && (
                    <div className="text-gray-700">
                      Duration: {booking.duration} hour(s)
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pricing Details
                </h3>
                <div className="space-y-2">
                  {booking.pricing?.basePrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="text-gray-700">
                        ₹{booking.pricing.basePrice}
                      </span>
                    </div>
                  )}
                  {booking.pricing?.equipmentRental !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equipment Rental:</span>
                      <span className="text-gray-700">
                        ₹{booking.pricing.equipmentRental}
                      </span>
                    </div>
                  )}
                  {booking.pricing?.taxes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes:</span>
                      <span className="text-gray-700">
                        ₹{booking.pricing.taxes}
                      </span>
                    </div>
                  )}
                  {booking.pricing?.discount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-gray-700">
                        -₹{booking.pricing.discount}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span>₹{booking.pricing.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Status Information
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Booking Status:</span>
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </span>
                  </div>
                  {booking.paymentStatus && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={getStatusBadge(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  )}
                  {booking.paymentDetails?.paymentMethod && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="text-gray-700">
                        {booking.paymentDetails.paymentMethod}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleProfileChange = (field, value) => {
    setEditableProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Please select an image file.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError("Image size must be less than 5MB.");
      return;
    }

    // Auto-upload the image
    setIsUploading(true);
    const loadingToast = showLoading(
      "Processing and uploading profile picture..."
    );

    try {
      // Process the image to remove EXIF data and correct orientation
      const processedFile = await processImageFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.9,
      });

      const response = await updateProfilePictureService(processedFile);
      console.log("Profile picture update response:", response);

      if (response.data && response.data.data) {
        const updatedUser = response.data.data;
        console.log("Updated user data:", updatedUser);

        // Add cache busting timestamp to force image reload
        const profilePictureWithTimestamp =
          updatedUser.profilePicture + `?t=${Date.now()}`;

        setUserData((prev) => ({
          ...prev,
          profilePicture: profilePictureWithTimestamp,
        }));

        // Update auth context with original URL (without timestamp)
        updateUser({
          ...updatedUser,
          profilePicture: updatedUser.profilePicture,
        });

        dismissToast(loadingToast);
        showSuccess("Profile picture updated successfully!");
      } else {
        console.error("Invalid response structure:", response);
        showError("Invalid response from server");
      }
    } catch (err) {
      dismissToast(loadingToast);
      if (err.message && err.message.includes("process")) {
        showError("Failed to process image. Please try a different image.");
      } else {
        showError("Failed to upload profile picture");
      }
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Canceling edit mode - reset data
      setEditableProfileData({
        fullName: userData.fullName || "",
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = async () => {
    if (!editableProfileData.fullName.trim()) {
      showError("Full name is required.");
      return;
    }

    const loadingToast = showLoading("Updating profile...");

    try {
      const response = await updateProfileService({
        fullName: editableProfileData.fullName.trim(),
      });

      if (response.data && response.data.data) {
        const updatedUser = response.data.data;
        setUserData(updatedUser);
        updateUser(updatedUser); // Update auth context
        setIsEditMode(false);
        dismissToast(loadingToast);
        showSuccess("Profile updated successfully!");
      }
    } catch (err) {
      dismissToast(loadingToast);
      if (err.response?.status === 400) {
        showError(err.response.data.message || "Invalid input data");
      } else {
        showError("Failed to update profile");
      }
      console.error("Update error:", err);
    }
  };

  const handleChangePassword = async () => {
    if (!userData.email) {
      showError("Email not found. Please refresh the page.");
      return;
    }

    const loadingToast = showLoading("Sending password reset email...");

    try {
      await forgotPasswordService(userData.email);
      dismissToast(loadingToast);
      showSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      dismissToast(loadingToast);
      showError("Failed to send password reset email");
      console.error("Password reset error:", err);
    }
  };

  const handleCancelBooking = (bookingId) => {
    // TODO: Implement booking cancellation
    console.log("Cancelled booking:", bookingId);
    showSuccess("Booking cancelled successfully!");
  };

  const getRoleDisplayName = (role) => {
    if (role === "facility_owner") return "Facility Owner";
    if (role === "player") return "Player";
    return role || "Not Set";
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-gray-50">
        {/* Container for sidebar and content */}
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar - Responsive Layout */}
          <div className="w-full lg:w-80 bg-white shadow-lg border-r border-gray-200">
            {/* Mobile: Collapsed view with only buttons */}
            <div className="lg:hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab("editProfile")}
                    className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
                      activeTab === "editProfile"
                        ? "bg-green-500 text-white font-semibold"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("myBookings")}
                    className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
                      activeTab === "myBookings"
                        ? "bg-green-500 text-white font-semibold"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Bookings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop: Full sidebar */}
            <div className="hidden lg:block h-[calc(100vh-4rem)]">
              {/* Profile Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4">
                    <ProfileImage
                      src={userData.profilePicture}
                      alt={userData.fullName || "Profile"}
                      size="w-24 h-24"
                      fallbackText={
                        userData.fullName?.charAt(0)?.toUpperCase() || "?"
                      }
                    />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 truncate">
                    {userData.fullName || "Loading..."}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 truncate">
                    {userData.email}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    @{userData.username}
                  </p>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("editProfile")}
                    className={`w-full text-left px-4 py-4 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === "editProfile"
                        ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-semibold border-l-4 border-green-500 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <User className="w-5 h-5 flex-shrink-0" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("myBookings")}
                    className={`w-full text-left px-4 py-4 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === "myBookings"
                        ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-semibold border-l-4 border-green-500 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span>My Bookings</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area - Responsive */}
          <div className="flex-1 w-full">
            <div className="p-4 lg:p-6">
              {activeTab === "editProfile" && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-6xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Edit Profile
                      </h2>
                      <p className="text-gray-600">
                        Update your personal information and account settings
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {isEditMode && (
                        <button
                          onClick={toggleEditMode}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <span>Cancel</span>
                        </button>
                      )}
                      <button
                        onClick={isEditMode ? handleSave : toggleEditMode}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>
                          {isEditMode ? "Save Changes" : "Edit Profile"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Profile Image Section */}
                    <div className="lg:col-span-1 flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                          <ProfileImage
                            src={userData.profilePicture}
                            alt={userData.fullName || "Profile"}
                            size="w-32 h-32"
                            fallbackText={
                              userData.fullName?.charAt(0)?.toUpperCase() || "?"
                            }
                          />
                        </div>
                        <button
                          onClick={() =>
                            document.getElementById("mainImageUpload").click()
                          }
                          disabled={isUploading}
                          className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Camera className="w-5 h-5 text-white" />
                        </button>
                        <input
                          id="mainImageUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {userData.fullName || "Loading..."}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Click camera to upload photo
                        </p>
                        {isUploading && (
                          <p className="text-green-600 text-sm mt-1">
                            Uploading...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-green-600" />
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Full Name Field */}
                          <div>
                            <label
                              htmlFor="fullName"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Full Name
                            </label>
                            <input
                              type="text"
                              id="fullName"
                              value={editableProfileData.fullName}
                              onChange={(e) =>
                                handleProfileChange("fullName", e.target.value)
                              }
                              disabled={!isEditMode}
                              placeholder="Enter your full name"
                              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                                isEditMode
                                  ? "border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                  : "border-gray-200 bg-gray-50 text-gray-600"
                              }`}
                            />
                          </div>

                          {/* Username Field - Read Only */}
                          <div>
                            <label
                              htmlFor="username"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Username
                            </label>
                            <input
                              type="text"
                              id="username"
                              value={userData.username || ""}
                              disabled
                              className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg"
                            />
                          </div>

                          {/* Email Field - Read Only */}
                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={userData.email || ""}
                              disabled
                              className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg"
                            />
                          </div>

                          {/* Role Field - Read Only */}
                          <div>
                            <label
                              htmlFor="role"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Role
                            </label>
                            <input
                              type="text"
                              id="role"
                              value={getRoleDisplayName(userData.role)}
                              disabled
                              className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password Section */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Key className="w-5 h-5 text-green-600" />
                          Password Management
                        </h4>
                        <div className="text-center">
                          <p className="text-gray-600 mb-4">
                            To change your password, we'll send you a secure
                            reset link via email.
                          </p>
                          <button
                            onClick={handleChangePassword}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                          >
                            Send Password Reset Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "myBookings" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 px-4 lg:px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      My Bookings
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      View and manage your court bookings
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-4 lg:p-6">
                    {loadingBookings ? (
                      <div className="flex flex-col items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
                        <p className="text-gray-500 text-sm">
                          Loading your bookings...
                        </p>
                      </div>
                    ) : !Array.isArray(bookings) || bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No bookings yet
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Your booking history will appear here when you make
                          your first reservation.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Bookings Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-700">
                              {bookings.length}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              Total Bookings
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-700">
                              {
                                bookings.filter((b) => b.status === "confirmed")
                                  .length
                              }
                            </div>
                            <div className="text-xs text-blue-600 font-medium">
                              Confirmed
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                            <div className="text-2xl font-bold text-yellow-700">
                              {
                                bookings.filter((b) => b.status === "pending")
                                  .length
                              }
                            </div>
                            <div className="text-xs text-yellow-600 font-medium">
                              Pending
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                            <div className="text-2xl font-bold text-purple-700">
                              {
                                bookings.filter((b) => b.status === "completed")
                                  .length
                              }
                            </div>
                            <div className="text-xs text-purple-600 font-medium">
                              Completed
                            </div>
                          </div>
                        </div>

                        {/* Bookings List */}
                        <div className="space-y-3">
                          {bookings.map((booking, index) => (
                            <div
                              key={booking._id}
                              className="group bg-white border border-gray-200 rounded-xl p-4 lg:p-5 hover:shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1"
                            >
                              {/* Mobile Layout */}
                              <div className="block lg:hidden space-y-3">
                                {/* Header Row */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                                      {booking.venue.name}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {booking.court.name} •{" "}
                                      {booking.court.sportType}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-2">
                                    {getStatusIcon(booking.status)}
                                    <span
                                      className={`${getStatusBadge(
                                        booking.status
                                      )} text-xs px-2 py-1`}
                                    >
                                      {booking.status}
                                    </span>
                                  </div>
                                </div>

                                {/* Date and Time */}
                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {formatDate(booking.bookingDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">
                                      {formatTime(booking.timeSlot.startTime)} -{" "}
                                      {formatTime(booking.timeSlot.endTime)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({booking.duration}h)
                                    </span>
                                  </div>
                                </div>

                                {/* Location and Price */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {booking.venue.address.city},{" "}
                                      {booking.venue.address.state}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-gray-900">
                                        ₹
                                        {booking.pricing.totalAmount.toLocaleString()}
                                      </div>
                                      <div
                                        className={`text-xs font-medium ${
                                          booking.paymentStatus === "completed"
                                            ? "text-green-600"
                                            : booking.paymentStatus ===
                                              "pending"
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {booking.paymentStatus}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleViewBookingDetails(booking)
                                      }
                                      className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full transition-colors"
                                    >
                                      <Eye className="w-4 h-4 text-green-700" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Desktop Layout */}
                              <div className="hidden lg:block">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 grid grid-cols-4 gap-6 items-center">
                                    {/* Venue & Court Info */}
                                    <div className="space-y-1">
                                      <h3 className="font-semibold text-gray-900 text-sm">
                                        {booking.venue.name}
                                      </h3>
                                      <p className="text-xs text-gray-600">
                                        {booking.court.name}
                                      </p>
                                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                        {booking.court.sportType}
                                      </span>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                          {formatDate(booking.bookingDate)}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-gray-700">
                                          {formatTime(
                                            booking.timeSlot.startTime
                                          )}{" "}
                                          -{" "}
                                          {formatTime(booking.timeSlot.endTime)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-700">
                                          {booking.venue.address.city}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        {booking.venue.address.state}
                                      </p>
                                    </div>

                                    {/* Price & Status */}
                                    <div className="space-y-2">
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">
                                          ₹
                                          {booking.pricing.totalAmount.toLocaleString()}
                                        </div>
                                        <div
                                          className={`text-xs font-medium ${
                                            booking.paymentStatus ===
                                            "completed"
                                              ? "text-green-600"
                                              : booking.paymentStatus ===
                                                "pending"
                                              ? "text-yellow-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          Payment: {booking.paymentStatus}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center space-x-3 ml-6">
                                    <div className="flex items-center space-x-2">
                                      {getStatusIcon(booking.status)}
                                      <span
                                        className={`${getStatusBadge(
                                          booking.status
                                        )} text-xs px-3 py-1`}
                                      >
                                        {booking.status}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleViewBookingDetails(booking)
                                      }
                                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                    >
                                      <Eye className="w-4 h-4" />
                                      <span>Details</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Booking Number */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    Booking #
                                    {booking._id.slice(-8).toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Created:{" "}
                                    {new Date(
                                      booking.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
};

export default UserProfile;
