import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

console.log(
  "Cloudinary config:",
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image buffer to Cloudinary
export const uploadToCloudinary = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: "quickcourt/profile-pictures",
        transformation: [
          { angle: "exif" }, // Auto-rotate based on EXIF orientation
          { width: 400, height: 400, crop: "fill" },
          { quality: "auto", fetch_format: "auto" },
        ],
        // Strip all metadata including EXIF data
        strip_exif: true,
        // Ensure consistent format
        format: "jpg",
        ...options,
      };

      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(buffer);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

export default cloudinary;
