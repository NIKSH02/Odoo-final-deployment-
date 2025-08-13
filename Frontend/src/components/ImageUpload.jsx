import React, { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { processImageFile, createOrientedPreview } from '../utils/imageUtils';

const ImageUpload = ({ onImageSelect, existingImage = null, disabled = false }) => {
  const [previewImage, setPreviewImage] = useState(existingImage);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { showError } = useToast();

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file.');
      return false;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB.');
      return false;
    }
    
    return true;
  };

  const handleFileSelect = async (file) => {
    if (!validateFile(file)) return;

    try {
      // Process the image to remove EXIF data and correct orientation
      const processedFile = await processImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9
      });

      // Create oriented preview
      const previewUrl = await createOrientedPreview(file);
      setPreviewImage(previewUrl);

      // Pass processed file to parent component
      onImageSelect(processedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      showError('Failed to process image. Please try again.');
      
      // Fallback to original file if processing fails
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    if (!disabled) {
      setPreviewImage(null);
      onImageSelect(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-400'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }
        `}
      >
        {previewImage ? (
          <div className="relative">
            <img
              src={previewImage}
              alt="Preview"
              className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                ×
              </button>
            )}
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Click to change image
            </p>
          </div>
        ) : (
          <div>
            <div className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUpload;
