import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Building,
  Calendar,
  Star,
  TrendingUp,
  Menu,
  Loader,
} from "lucide-react";
import OwnerSidebar from "../components/OwnerSidebar";
import {
  getCurrentUserService,
  updateProfileService,
} from "../services/userService";
import { useAuth } from "../hooks/useAuth";

const OwnerProfile = () => {
  const { user: _user, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Backend-compatible profile data structure (only fields that exist in User model)
  const [profileData, setProfileData] = useState({
    _id: "",
    fullName: "",
    username: "",
    email: "",
    isEmailVerified: false,
    role: "",
    authProvider: "",
    profilePicture: "",
    address: {
      country: "",
    },
    googleId: "",
  });

  // Editable profile data separate from backend data
  const [editableProfileData, setEditableProfileData] = useState({
    fullName: "",
    username: "",
    role: "",
  });

  const [businessStats, setBusinessStats] = useState({
    totalVenues: 0,
    totalCourts: 0,
    totalBookings: 0,
    totalEarnings: 0,
    rating: 0,
    memberSince: "",
  });

  // Load user data from backend
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getCurrentUserService();

        let userData;
        if (response.data && response.data.success && response.data.data) {
          userData = response.data.data;
        } else if (response.data && response.data.data) {
          // Fallback for different response structure
          userData = response.data.data;
        } else if (response.data) {
          // Another fallback
          userData = response.data;
        } else {
          console.error("Unexpected response structure:", response);
          setError("Failed to load profile data - unexpected response format");
          return;
        }

        // Only show data for facility owners
        if (userData.role === "facility_owner") {
            setProfileData({
              _id: userData._id || "",
              fullName: userData.fullName || "",
              username: userData.username || "",
              email: userData.email || "",
              isEmailVerified: userData.isEmailVerified || false,
              role: userData.role || "",
              authProvider: userData.authProvider || "",
              profilePicture: userData.profilePicture || "",
              address: {
                country: "India", // Default since User model doesn't have address field
              },
              googleId: userData.googleId || "",
            });

            // Set editable data
            setEditableProfileData({
              fullName: userData.fullName || "",
              username: userData.username || "",
              role: userData.role || "",
            });

            // Set business stats if available
            setBusinessStats({
              totalVenues: 0, // These would come from separate API calls
              totalCourts: 0,
              totalBookings: 0,
              totalEarnings: 0,
              rating: 4.5,
              memberSince: userData.createdAt || "",
            });
          } else {
            setError("Access denied. This page is only for facility owners.");
          }
      } catch (error) {
        console.error("Error loading user data:", error);
        setError(error.message || "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (field, value) => {
    setEditableProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      // Store the actual file for upload
      setProfileImage(file);

      // Create preview URL for display during edit mode
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Basic validation
      if (!editableProfileData.fullName || !editableProfileData.username) {
        alert("Full Name and Username are required fields");
        return;
      }

      // Prepare data for backend (only include fields that the backend expects)
      const updateData = {
        fullName: editableProfileData.fullName.trim(),
        username: editableProfileData.username.trim(),
        role: editableProfileData.role,
      };

      // Add profile picture if it's a file
      if (profileImage && profileImage instanceof File) {
        updateData.profilePicture = profileImage;
      }

      console.log("Updating profile with data:", updateData);

      const response = await updateProfileService(updateData);

      if (response.data && response.data.success) {
        const updatedUserData = response.data.data || response.data;
        
        // Update the auth context with new user data
        updateUser(updatedUserData);

        // Update local state with response data
        setProfileData((prev) => ({
          ...prev,
          _id: updatedUserData._id || "",
          fullName: updatedUserData.fullName || "",
          username: updatedUserData.username || "",
          email: updatedUserData.email || "",
          isEmailVerified: updatedUserData.isEmailVerified || false,
          role: updatedUserData.role || "",
          authProvider: updatedUserData.authProvider || "",
          profilePicture: updatedUserData.profilePicture || "",
          address: {
            country: updatedUserData.address?.country || "India",
          },
          googleId: updatedUserData.googleId || "",
        }));

        // Update editable data
        setEditableProfileData({
          fullName: updatedUserData.fullName || "",
          username: updatedUserData.username || "",
          role: updatedUserData.role || "",
        });

        setIsEditMode(false);
        setProfileImage(null);
        setImagePreview(null);
        alert("Profile updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setError(error.message || "Failed to update profile");
      alert(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset editable data to original profile data
    setEditableProfileData({
      fullName: profileData.fullName,
      username: profileData.username,
      role: profileData.role,
    });
    setIsEditMode(false);
    setProfileImage(null);
    setImagePreview(null);
  };

  const formatMemberSince = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <OwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Only show if not loading and no error */}
      {!isLoading && !error && (
        <>
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Owner Profile
                  </h1>
                </div>

                <button
                  onClick={() =>
                    isEditMode ? handleCancel() : setIsEditMode(true)
                  }
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditMode ? "Cancel" : "Edit Profile"}</span>
                </button>
              </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Profile Card & Stats */}
                  <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                            {(() => {
                              // Priority: image preview (edit mode) > profile picture from data
                              let imageSource = null;
                              let showImage = false;
                              
                              if (isEditMode && imagePreview) {
                                imageSource = imagePreview;
                                showImage = true;
                              } else if (profileData.profilePicture) {
                                imageSource = profileData.profilePicture;
                                showImage = true;
                              }
                              
                              return showImage ? (
                                <img
                                  src={imageSource}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error("Image load error:", e.target.src);
                                    setImageError(true);
                                  }}
                                  onLoad={() => setImageError(false)}
                                />
                              ) : (
                                <User className="w-16 h-16 text-gray-400" />
                              );
                            })()}
                          </div>
                          {isEditMode && (
                            <button
                              onClick={() =>
                                document
                                  .getElementById("profileImageUpload")
                                  .click()
                              }
                              className="absolute bottom-0 right-0 w-10 h-10 bg-black rounded-full border-3 border-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
                            >
                              <Camera className="w-5 h-5 text-white" />
                            </button>
                          )}
                          <input
                            id="profileImageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {profileData.fullName}
                        </h2>
                        <p className="text-gray-600 mt-1">
                          {profileData.username && `@${profileData.username}`}
                        </p>
                        <p className="text-gray-600 mt-1">Facility Owner</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Member since{" "}
                          {formatMemberSince(businessStats.memberSince)}
                        </p>

                        <div className="flex items-center justify-center space-x-1 mt-3">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-900">
                            {businessStats.rating}
                          </span>
                          <span className="text-gray-500 text-sm">rating</span>
                        </div>
                      </div>
                    </div>

                    {/* Business Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Business Overview
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Building className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">Total Venues</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {businessStats.totalVenues}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">Total Courts</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {businessStats.totalCourts}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">
                              Total Bookings
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {businessStats.totalBookings.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">
                              Total Earnings
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            ₹{businessStats.totalEarnings.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">
                              Average Rating
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {businessStats.rating > 0
                              ? `${businessStats.rating}/5.0`
                              : "No ratings yet"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">Member Since</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatMemberSince(businessStats.memberSince)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Profile Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={
                              isEditMode
                                ? editableProfileData.fullName
                                : profileData.fullName
                            }
                            onChange={(e) =>
                              handleInputChange("fullName", e.target.value)
                            }
                            disabled={!isEditMode}
                            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                              isEditMode
                                ? "border-gray-300 focus:ring-2 focus:ring-black focus:border-black bg-white"
                                : "border-gray-200 bg-gray-50 text-gray-600"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={
                              isEditMode
                                ? editableProfileData.username
                                : profileData.username
                            }
                            onChange={(e) =>
                              handleInputChange("username", e.target.value)
                            }
                            disabled={!isEditMode}
                            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                              isEditMode
                                ? "border-gray-300 focus:ring-2 focus:ring-black focus:border-black bg-white"
                                : "border-gray-200 bg-gray-50 text-gray-600"
                            }`}
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={profileData.email}
                            disabled={true}
                            className="w-full px-4 py-3 border rounded-lg border-gray-200 bg-gray-50 text-gray-600"
                            title="Email cannot be changed"
                          />
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              Email cannot be changed
                            </p>
                            {profileData.isEmailVerified ? (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="text-xs text-orange-600 font-medium">
                                ⚠ Not Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                          </label>
                          <select
                            value={
                              isEditMode
                                ? editableProfileData.role
                                : profileData.role
                            }
                            onChange={(e) =>
                              handleInputChange("role", e.target.value)
                            }
                            disabled={!isEditMode}
                            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                              isEditMode
                                ? "border-gray-300 focus:ring-2 focus:ring-black focus:border-black bg-white"
                                : "border-gray-200 bg-gray-50 text-gray-600"
                            }`}
                          >
                            <option value="player">Player</option>
                            <option value="facility_owner">
                              Facility Owner
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Account Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            value={profileData.address.country}
                            disabled={true}
                            className="w-full px-4 py-3 border rounded-lg border-gray-200 bg-gray-50 text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Type
                          </label>
                          <input
                            type="text"
                            value={
                              profileData.authProvider === "google"
                                ? "Google Account"
                                : "Local Account"
                            }
                            disabled={true}
                            className="w-full px-4 py-3 border rounded-lg border-gray-200 bg-gray-50 text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            User ID
                          </label>
                          <input
                            type="text"
                            value={profileData._id}
                            disabled={true}
                            className="w-full px-4 py-3 border rounded-lg border-gray-200 bg-gray-50 text-gray-600 font-mono text-sm"
                          />
                        </div>
                        {profileData.googleId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Google ID
                            </label>
                            <input
                              type="text"
                              value={profileData.googleId}
                              disabled={true}
                              className="w-full px-4 py-3 border rounded-lg border-gray-200 bg-gray-50 text-gray-600 font-mono text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditMode && (
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={handleCancel}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                            isSaving
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-black hover:bg-gray-800"
                          } text-white`}
                        >
                          {isSaving ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerProfile;
