import User from "../models/user.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get current user details
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password -refreshToken -otp -otpExpiry"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched successfully"));
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, username, role } = req.body;
  const userId = req.user.id;

  // Check if username is already taken by another user
  if (username) {
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      throw new ApiError(400, "Username already taken");
    }
  }

  // Validate role if provided
  if (role && !["player", "facility_owner"].includes(role)) {
    throw new ApiError(
      400,
      'Invalid role. Must be either "player" or "facility_owner"'
    );
  }

  const updateData = {
    ...(fullName && { fullName }),
    ...(username && { username }),
    ...(role && { role }),
  };

  // Handle profile picture upload if file is provided
  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        public_id: `profile_${userId}_${Date.now()}`,
      });
      updateData.profilePicture = uploadResult.secure_url;
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      throw new ApiError(500, "Failed to upload profile picture");
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password -refreshToken -otp -otpExpiry");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Get user profile by ID (for admin or public profiles)
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select(
    "-password -refreshToken -otp -otpExpiry -email"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

// Update profile picture
const updateProfilePicture = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    throw new ApiError(400, "Profile picture file is required");
  }

  try {
    // Get current user to check for existing profile picture
    const currentUser = await User.findById(userId);

    // Delete old profile picture from Cloudinary if it exists and is not from Google
    if (currentUser.profilePicture && currentUser.authProvider === "local") {
      // Extract public ID from Cloudinary URL
      const publicId = currentUser.profilePicture
        .split("/")
        .pop()
        .split(".")[0];
      if (publicId.startsWith("profile_")) {
        await deleteFromCloudinary(`quickcourt/profile-pictures/${publicId}`);
      }
    }

    // Upload new profile picture
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      public_id: `profile_${userId}_${Date.now()}`,
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResult.secure_url },
      { new: true, runValidators: true }
    ).select("-password -refreshToken -otp -otpExpiry");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, user, "Profile picture updated successfully"));
  } catch (error) {
    console.error("Profile picture update failed:", error);
    throw new ApiError(500, "Failed to update profile picture");
  }
});

// Delete user account
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete profile picture from Cloudinary if it exists and is not from Google
  if (user.profilePicture && user.authProvider === "local") {
    try {
      // Extract public ID from Cloudinary URL
      const publicId = user.profilePicture.split("/").pop().split(".")[0];
      if (publicId.startsWith("profile_")) {
        await deleteFromCloudinary(`quickcourt/profile-pictures/${publicId}`);
      }
    } catch (error) {
      console.error("Failed to delete profile picture from Cloudinary:", error);
      // Continue with account deletion even if profile picture deletion fails
    }
  }

  await User.findByIdAndDelete(userId);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Account deleted successfully"));
});

// Update user role (for Google login users who haven't set a role)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const userId = req.user.id;

  // Validate role
  if (!role || !["player", "facility_owner"].includes(role)) {
    throw new ApiError(
      400,
      'Invalid role. Must be either "player" or "facility_owner"'
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select("-password -refreshToken -otp -otpExpiry");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "Role updated successfully"));
});

export {
  getCurrentUser,
  updateProfile,
  updateProfilePicture,
  updateUserRole,
  getUserById,
  deleteAccount,
};
