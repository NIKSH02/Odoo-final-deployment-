/**
 * Process image file to remove EXIF data and correct orientation
 * @param {File} file - The original image file
 * @param {Object} options - Options for processing
 * @param {number} options.maxWidth - Maximum width (default: 1920)
 * @param {number} options.maxHeight - Maximum height (default: 1080)
 * @param {number} options.quality - JPEG quality (default: 0.9)
 * @returns {Promise<File>} - Processed image file without EXIF data
 */
export const processImageFile = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.9
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create image element
      const img = new Image();
      
      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          
          // Calculate scaling factor
          const scaleX = maxWidth / width;
          const scaleY = maxHeight / height;
          const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
          
          const newWidth = Math.floor(width * scale);
          const newHeight = Math.floor(height * scale);
          
          // Set canvas dimensions
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          // Draw image on canvas (this strips EXIF data)
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create new file without EXIF data
                const processedFile = new File(
                  [blob], 
                  file.name.replace(/\.[^/.]+$/, '.jpg'), // Ensure .jpg extension
                  { 
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  }
                );
                resolve(processedFile);
              } else {
                reject(new Error('Failed to process image'));
              }
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Load image
      img.src = URL.createObjectURL(file);
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Create a preview URL for an image file
 * @param {File} file - The image file
 * @returns {Promise<string>} - Data URL for preview
 */
export const createOrientedPreview = async (file) => {
  try {
    const processedFile = await processImageFile(file, {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.8
    });
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read processed file'));
      reader.readAsDataURL(processedFile);
    });
  } catch (error) {
    console.error('Error creating oriented preview:', error);
    // Fallback to original file
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(error);
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Process multiple image files
 * @param {FileList|File[]} files - Array of image files
 * @param {Object} options - Processing options
 * @returns {Promise<File[]>} - Array of processed files
 */
export const processMultipleImages = async (files, options = {}) => {
  const fileArray = Array.from(files);
  const processedFiles = [];
  
  for (const file of fileArray) {
    try {
      const processedFile = await processImageFile(file, options);
      processedFiles.push(processedFile);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      // Include original file if processing fails
      processedFiles.push(file);
    }
  }
  
  return processedFiles;
};