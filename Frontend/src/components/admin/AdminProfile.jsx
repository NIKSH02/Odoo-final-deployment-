import React, { useState, useEffect } from "react";
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import {
  updateProfileService,
  deleteAccountService,
} from "../../services/userService";
import toast from "react-hot-toast";

const AdminProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [originalData, setOriginalData] = useState({});

  // Show loading if user data is not yet available
  if (!user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  useEffect(() => {
    if (user) {
      console.log("Admin Profile - User data:", user); // Debug log
      const userData = {
        fullName: user.fullName || "",
        email: user.email || "",
        phone:
          user.phone ||
          user.phoneNumber ||
          user.mobile ||
          user.contactNumber ||
          "",
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await updateProfileService(formData);

      if (response.data && response.data.data) {
        updateUser(response.data.data);
        setOriginalData(formData);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    try {
      setIsLoading(true);
      await deleteAccountService();
      toast.success("Account deleted successfully");
      logout();
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return null;
    }
  };

  const getUserStatus = () => {
    if (!user) return null;

    // Check various status fields based on actual user structure
    if (user.status) return user.status;
    if (user.isActive !== undefined)
      return user.isActive ? "Active" : "Inactive";
    if (user.isEmailVerified !== undefined)
      return user.isEmailVerified ? "Verified" : "Email Pending";

    return "Active"; // Default status for admin
  };

  const getStatusColor = (status) => {
    if (!status) return "text-gray-600";

    switch (status.toLowerCase()) {
      case "active":
      case "verified":
        return "text-green-600";
      case "inactive":
      case "suspended":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-black rounded-lg">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-gray-600">
              Manage your admin account information
            </p>
          </div>
        </div>

        {!isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              <span>{isLoading ? "Saving..." : "Save"}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Information Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Personal Information
          </h2>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile Picture"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-gray-400" />
                )}
                <div className="w-full h-full items-center justify-center hidden">
                  <UserIcon className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {formData.fullName || user?.fullName || "Admin User"}
                </h3>
                <p className="text-gray-600">Administrator</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {formData.fullName || "Not provided"}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {formData.email || "Not provided"}
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {formData.phone || "Not provided"}
                  </div>
                )}
              </div>

              {/* Role Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 capitalize">
                  {user?.role || "Administrator"}
                </div>
              </div>

              {/* Username Field (if available) */}
              {user?.username && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {user.username}
                  </div>
                </div>
              )}

              {/* Auth Provider (if available) */}
              {user?.authProvider && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Login Method
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 capitalize">
                    {user.authProvider === "google"
                      ? "Google Account"
                      : "Email & Password"}
                    {user.authProvider === "google" && user.googleId && (
                      <span className="text-xs text-gray-500 block mt-1">
                        Google ID: {user.googleId.slice(-8)}...
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Email Verification Status */}
              {user?.isEmailVerified !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Status
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <span
                      className={`font-medium ${
                        user.isEmailVerified
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {user.isEmailVerified
                        ? "Verified"
                        : "Pending Verification"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-black capitalize">
                {user?.role || "Admin"}
              </div>
              <div className="text-sm text-gray-600">Account Type</div>
            </div>

            {formatJoinDate(user?.createdAt || user?.joinedAt) && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-black">
                  {formatJoinDate(user?.createdAt || user?.joinedAt)}
                </div>
                <div className="text-sm text-gray-600">Member Since</div>
              </div>
            )}

            {getUserStatus() && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div
                  className={`text-xl font-bold ${getStatusColor(
                    getUserStatus()
                  )}`}
                >
                  {getUserStatus()}
                </div>
                <div className="text-sm text-gray-600">Account Status</div>
              </div>
            )}

            {user?._id && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div
                  className="text-sm font-bold text-black truncate"
                  title={user._id}
                >
                  {user._id.slice(-8)}...
                </div>
                <div className="text-sm text-gray-600">User ID</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete your account? This will
                permanently remove all your data and cannot be reversed.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "DELETE" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="DELETE"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading || deleteConfirmText !== "DELETE"}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Deleting..." : "Delete Account"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
