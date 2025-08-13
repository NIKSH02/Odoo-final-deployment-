import React from 'react';
import { MapPin, Navigation, Loader } from 'lucide-react';

const LocationModal = ({
  currentUser,
  locationQuery,
  onLocationQueryChange,
  locationSuggestions,
  showSuggestions,
  isSearchingLocation,
  isLoadingCurrentLocation,
  onLocationSelect,
  onGetCurrentLocation,
  onClose,
  locationInputRef
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Change Location</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">
          Search for a new location to join a different chat room
        </p>
        
        {/* Current location display */}
        {currentUser && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Current Location</div>
            <div className="font-medium text-gray-800 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              {currentUser.locationDisplay}
            </div>
          </div>
        )}

        {/* Location search */}
        <div className="mb-4">
          <div ref={locationInputRef} className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={locationQuery}
              onChange={onLocationQueryChange}
              className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent font-medium"
              placeholder="Search for a city..."
              autoComplete="off"
            />
            {/* Current Location Button */}
            <button
              onClick={onGetCurrentLocation}
              disabled={isLoadingCurrentLocation}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="Use current location"
            >
              {isLoadingCurrentLocation ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </button>
            
            {/* Search suggestions dropdown */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
                {locationSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id || index}
                    onClick={() => onLocationSelect(suggestion)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.parsed?.city || suggestion.place_name.split(',')[0]}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.place_name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Loading indicator */}
            {isSearchingLocation && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg z-50">
                <div className="px-4 py-3 flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Searching...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
