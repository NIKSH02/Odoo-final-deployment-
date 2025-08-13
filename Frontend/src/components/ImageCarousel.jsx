import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Image Carousel Component
export default function ImageCarousel({ images: propImages = [] }) {
  const [currentImage, setCurrentImage] = useState(0);

  // Use only the actual images from backend, no defaults
  const images = propImages || [];

  // If no images available, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="mb-8">
        <div className="relative bg-gray-200 rounded-2xl overflow-hidden h-64 md:h-80 lg:h-96 mb-6 shadow-2xl">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl text-gray-400 mb-4">📷</div>
              <h4 className="text-gray-600 text-xl font-semibold mb-2">
                No Images Available
              </h4>
              <p className="text-gray-500">
                Images will be displayed here once uploaded
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentImageUrl = () => {
    const currentImg = images[currentImage];
    // Backend photos have structure: { url, caption, isMainPhoto }
    return currentImg?.url || currentImg;
  };

  const getCurrentImageCaption = () => {
    const currentImg = images[currentImage];
    // Backend photos have structure: { url, caption, isMainPhoto }
    return currentImg?.caption || `Image ${currentImage + 1}`;
  };

  return (
    <div className="mb-8">
      {/* Main Image Display */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden h-64 md:h-80 lg:h-96 mb-6 shadow-2xl group">
        <img
          src={getCurrentImageUrl()}
          alt={getCurrentImageCaption()}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
          <div className="absolute bottom-6 left-6">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
              <h4 className="text-white text-xl font-bold mb-1">
                {getCurrentImageCaption()}
              </h4>
              <p className="text-white/80 text-sm">
                Image {currentImage + 1} of {images.length}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() =>
            setCurrentImage((prev) =>
              prev === 0 ? images.length - 1 : prev - 1
            )
          }
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() =>
            setCurrentImage((prev) =>
              prev === images.length - 1 ? 0 : prev + 1
            )
          }
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>

        {/* Image Indicators */}
        <div className="absolute bottom-6 right-6">
          <div className="flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentImage === index
                    ? "bg-white shadow-lg scale-125"
                    : "bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnail Strip - Continuous without gaps */}
      <div className={`grid grid-cols-7`}>
        {images.map((image, index) => {
          const imageUrl = image?.url || image;
          return (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`relative aspect-video overflow-hidden transition-all duration-200 hover:scale-102 ${
                currentImage === index ? "shadow-md" : "hover:shadow-sm"
              }`}
              style={{ height: "60px" }}
            >
              <img
                src={imageUrl}
                alt={image?.caption || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute inset-0 transition-opacity duration-200 ${
                  currentImage === index
                    ? "bg-black/10"
                    : "bg-transparent hover:bg-black/5"
                }`}
              />
              <div
                className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  currentImage === index ? "bg-white shadow-sm" : "bg-white/70"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Image Counter - Smaller and more subtle */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full">
          {currentImage + 1} of {images.length}
        </span>
      </div>
    </div>
  );
}
