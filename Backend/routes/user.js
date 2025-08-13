import express from "express";
import {
  getCurrentUser,
  updateProfile,
  updateProfilePicture,
  updateUserRole,
  getUserById,
  deleteAccount,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import handleUploadError from "../middlewares/uploadErrorHandler.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/me", protect, getCurrentUser);
router.put(
  "/profile",
  protect,
  upload.single("profilePicture"),
  handleUploadError,
  updateProfile
);
router.put(
  "/profile-picture",
  protect,
  upload.single("profilePicture"),
  handleUploadError,
  updateProfilePicture
);
router.put("/role", protect, updateUserRole);
router.delete("/account", protect, deleteAccount);

// Public routes
router.get("/:userId", getUserById);

export default router;
