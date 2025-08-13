import api from "../api/axiosInstance";

// Get current user details
export const getCurrentUserService = async () => {
  return api.get("/users/me");
};

// Update user profile
export const updateProfileService = async (data) => {
  // Handle FormData for profile picture upload
  if (data instanceof FormData) {
    return api.put("/users/profile", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  return api.put("/users/profile", data);
};

// Update profile picture only
export const updateProfilePictureService = async (file) => {
  const formData = new FormData();
  formData.append("profilePicture", file);

  return api.put("/users/profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Get user by ID
export const getUserByIdService = async (userId) => {
  return api.get(`/users/${userId}`);
};

// Delete user account
export const deleteAccountService = async () => {
  return api.delete("/users/account");
};

// Update user role (for Google login users)
export const updateUserRoleService = async (data) => {
  return api.put("/users/role", data);
};
