import multer from "multer";
import ApiError from "../utils/ApiError.js";

// Error handler for file upload operations
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size allowed is 5MB",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field name for file upload",
      });
    }
  }

  if (error.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: "Only image files (jpg, jpeg, png, gif) are allowed",
    });
  }

  // Pass other errors to the main error handler
  next(error);
};

export default handleUploadError;
