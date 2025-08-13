import React from 'react';

const ProfileImage = ({ 
  src, 
  alt = "Profile", 
  size = "w-24 h-24", 
  fallbackText = "?",
  className = "" 
}) => {
  // Optimize Cloudinary images and add cache busting for updates
  const getOptimizedImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    if (imageUrl.includes('cloudinary.com')) {
      // Since we're processing images on frontend, just optimize without rotation
      const transformations = 'f_auto,q_auto:good';
      let optimizedUrl = imageUrl.replace('/upload/', `/upload/${transformations}/`);
      
      // Add cache busting parameter to force reload
      const cacheBuster = `?v=${Date.now()}`;
      optimizedUrl += cacheBuster;
      
      return optimizedUrl;
    }
    
    // For non-Cloudinary images, add cache busting
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}v=${Date.now()}`;
  };

  const optimizedSrc = getOptimizedImageUrl(src);

  if (!optimizedSrc) {
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${className}`}>
        <span className="text-white font-semibold text-lg">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={`${size} rounded-full object-cover border-4 border-white shadow-lg ${className}`}
      onError={(e) => {
        // Fallback if image fails to load
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  );
};

export default ProfileImage;
