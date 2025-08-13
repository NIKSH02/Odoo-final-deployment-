import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Upload,
  MapPin,
  Clock,
  Star,
  Image,
  Save,
  X,
  Menu,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Navigation,
  Loader,
} from "lucide-react";
import OwnerSidebar from "../components/OwnerSidebar";
import * as venueService from "../services/venueService";
import * as courtService from "../services/courtService";
import { searchLocations, getCurrentLocation, reverseGeocode } from '../services/locationService.js';
// import { useAuth } from '../hooks/useAuth'; // Currently unused but may be needed for user authentication

// Facility Modal Component (moved outside to prevent re-creation)
const FacilityModal = ({
  isOpen,
  onClose,
  title,
  formData,
  setFormData,
  handleInputChange,
  handleNestedInputChange,
  handleOperatingHoursChange,
  handlePhotoUpload,
  removePhoto,
  sportsOptions,
  amenityOptions,
  days,
  handleSave,
  isSubmittingRequest,
  editingVenue,
}) => {
  // Location search state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);
  const locationInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Location search functionality
  const handleLocationSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const response = await searchLocations(searchQuery);
      if (response.success && response.data) {
        setLocationSuggestions(response.data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Debounced search
  const handleLocationQueryChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      handleLocationSearch(value);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = async (locationItem) => {
    setLocationQuery(locationItem.place_name);
    setShowSuggestions(false);
    setLocationSuggestions([]);
    
    // Auto-fill form fields with location data
    let addressUpdate = {
      city: locationItem.parsed?.city || '',
      state: locationItem.parsed?.state || '',
      zipCode: locationItem.parsed?.zipCode || locationItem.parsed?.postcode || '',
      coordinates: {
        latitude: locationItem.center[1] || 0,
        longitude: locationItem.center[0] || 0
      }
    };

    // If no zipCode found from search, try reverse geocoding with coordinates
    if (!addressUpdate.zipCode && locationItem.center) {
      try {
        console.log('No zip code from search, trying reverse geocoding...');
        const reverseData = await reverseGeocode(locationItem.center[0], locationItem.center[1]);
        if (reverseData.success && reverseData.data?.parsed?.zipCode) {
          addressUpdate.zipCode = reverseData.data.parsed.zipCode;
          console.log('Found zip code from reverse geocoding:', addressUpdate.zipCode);
        }
      } catch (error) {
        console.log('Reverse geocoding for zip code failed:', error);
      }
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ...addressUpdate
      }
    }));
  };

  // Get current location
  const handleCurrentLocation = async () => {
    setIsLoadingCurrentLocation(true);
    try {
      const position = await getCurrentLocation();
      const locationData = await reverseGeocode(position.longitude, position.latitude);
      
      if (locationData.success && locationData.data) {
        setLocationQuery(locationData.data.place_name);
        setShowSuggestions(false);
        
        // Auto-fill form fields with location data
        const addressUpdate = {
          city: locationData.data.parsed?.city || '',
          state: locationData.data.parsed?.state || '',
          zipCode: locationData.data.parsed?.zipCode || locationData.data.parsed?.postcode || '',
          coordinates: {
            latitude: position.latitude,
            longitude: position.longitude
          }
        };

        // Update form data
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            ...addressUpdate
          }
        }));
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get your current location. Please check your browser permissions.');
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset location query when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // If editing and has address data, set initial location query
      if (editingVenue && formData.address) {
        const { city, state } = formData.address;
        if (city || state) {
          setLocationQuery(`${city || ''}${city && state ? ', ' : ''}${state || ''}`);
        }
      }
    } else {
      setLocationQuery('');
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  }, [isOpen, editingVenue, formData.address]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter venue name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Price (₹/hour) *
                </label>
                <input
                  type="number"
                  value={formData.startingPrice}
                  onChange={(e) =>
                    handleInputChange("startingPrice", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter starting price"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Describe your venue"
              />
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Address
            </h3>
            
            {/* Location Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Location
              </label>
              <div ref={locationInputRef} className="relative">
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={handleLocationQueryChange}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="Search for city, state or area..."
                      autoComplete="off"
                    />
                    {/* Current Location Button */}
                    <button
                      type="button"
                      onClick={handleCurrentLocation}
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
                  </div>
                </div>
                
                {/* Search suggestions dropdown */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id || index}
                        onClick={() => handleLocationSelect(suggestion)}
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
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50">
                    <div className="px-4 py-3 flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">Searching...</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Search and select a location to auto-fill city, state, zip code, and coordinates
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    handleNestedInputChange("address", "street", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter street address (e.g., 123 Main Street)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    handleNestedInputChange("address", "city", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-gray-50"
                  placeholder="Auto-filled from location search"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-filled from location search</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) =>
                    handleNestedInputChange("address", "state", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-gray-50"
                  placeholder="Auto-filled from location search"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-filled from location search</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "address",
                      "zipCode",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-gray-50"
                  placeholder="Auto-filled from location search"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-filled from location search</p>
              </div>
            </div>

            {/* Coordinates (Auto-filled) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude{" "}
                  <span className="text-sm text-gray-500">(Auto-filled)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.address.coordinates.latitude}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "address.coordinates",
                      "latitude",
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-gray-50"
                  placeholder="Auto-filled from location search"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude{" "}
                  <span className="text-sm text-gray-500">(Auto-filled)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.address.coordinates.longitude}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "address.coordinates",
                      "longitude",
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-gray-50"
                  placeholder="Auto-filled from location search"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Sports Supported */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sports Supported
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sportsOptions.map((sport) => (
                <label key={sport} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.sportsSupported.includes(sport)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          sportsSupported: [...prev.sportsSupported, sport],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          sportsSupported: prev.sportsSupported.filter(
                            (s) => s !== sport
                          ),
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">{sport}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Amenities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amenityOptions.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          amenities: [...prev.amenities, amenity],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          amenities: prev.amenities.filter(
                            (a) => a !== amenity
                          ),
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Photos Upload */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Photos{" "}
              <span className="text-sm text-gray-500">(Maximum 4 photos)</span>
            </h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload venue photos</p>
                <p className="text-sm text-gray-500 mb-4">
                  {formData.photos.length}/4 photos uploaded
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photoUpload"
                  disabled={formData.photos.length >= 4}
                />
                <label
                  htmlFor="photoUpload"
                  className={`px-6 py-3 rounded-lg transition-colors cursor-pointer inline-block ${
                    formData.photos.length >= 4
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {formData.photos.length >= 4
                    ? "Maximum Photos Reached"
                    : "Choose Photos"}
                </label>
              </div>
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.url}
                        alt={photo.alt}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Operating Hours
            </h3>
            <div className="space-y-3">
              {days.map((day) => (
                <div
                  key={day}
                  className="flex items-center space-x-4 p-3 bg-white rounded-lg"
                >
                  <div className="w-20">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </span>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.operatingHours[day].isOpen}
                      onChange={(e) =>
                        handleOperatingHoursChange(
                          day,
                          "isOpen",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-600">Open</span>
                  </label>
                  {formData.operatingHours[day].isOpen && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={formData.operatingHours[day].open}
                        onChange={(e) =>
                          handleOperatingHoursChange(
                            day,
                            "open",
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={formData.operatingHours[day].close}
                        onChange={(e) =>
                          handleOperatingHoursChange(
                            day,
                            "close",
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmittingRequest}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
              isSubmittingRequest
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            } text-white`}
          >
            {isSubmittingRequest ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending Request...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editingVenue ? "Update Venue" : "Send Request"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Court Modal Component (moved outside to prevent re-creation)
const CourtModal = ({ isOpen, onClose, courtData, onSave, isEditing }) => {
  const [courtFormData, setCourtFormData] = useState({
    name: "",
    sportType: "",
    pricePerHour: "",
    capacity: "",
    dimensions: { length: "", width: "", unit: "meters" },
    features: [],
    equipment: [],
    operatingHours: {
      monday: { start: "06:00", end: "22:00", isAvailable: true },
      tuesday: { start: "06:00", end: "22:00", isAvailable: true },
      wednesday: { start: "06:00", end: "22:00", isAvailable: true },
      thursday: { start: "06:00", end: "22:00", isAvailable: true },
      friday: { start: "06:00", end: "22:00", isAvailable: true },
      saturday: { start: "06:00", end: "22:00", isAvailable: true },
      sunday: { start: "06:00", end: "22:00", isAvailable: true },
    },
  });

  useEffect(() => {
    if (courtData) {
      setCourtFormData(courtData);
    } else {
      setCourtFormData({
        name: "",
        sportType: "",
        pricePerHour: "",
        capacity: "",
        dimensions: { length: "", width: "", unit: "meters" },
        features: [],
        equipment: [],
        operatingHours: {
          monday: { start: "06:00", end: "22:00", isAvailable: true },
          tuesday: { start: "06:00", end: "22:00", isAvailable: true },
          wednesday: { start: "06:00", end: "22:00", isAvailable: true },
          thursday: { start: "06:00", end: "22:00", isAvailable: true },
          friday: { start: "06:00", end: "22:00", isAvailable: true },
          saturday: { start: "06:00", end: "22:00", isAvailable: true },
          sunday: { start: "06:00", end: "22:00", isAvailable: true },
        },
      });
    }
  }, [courtData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setCourtFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setCourtFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayChange = (arrayName, value) => {
    if (arrayName === "equipment") {
      // Handle equipment as objects with name, available, and rentPrice
      const equipmentNames = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);

      const equipmentObjects = equipmentNames.map((name) => ({
        name,
        available: true,
        rentPrice: 0,
      }));

      setCourtFormData((prev) => ({
        ...prev,
        [arrayName]: equipmentObjects,
      }));
    } else if (arrayName === "features") {
      // Map user-friendly feature names to backend enum values
      const featureMapping = {
        "air conditioning": "air_conditioned",
        ac: "air_conditioned",
        "air conditioned": "air_conditioned",
        "air-conditioned": "air_conditioned",
        indoor: "indoor",
        outdoor: "outdoor",
        floodlights: "floodlights",
        "flood lights": "floodlights",
        "synthetic turf": "synthetic_turf",
        "artificial turf": "synthetic_turf",
        "wooden floor": "wooden_floor",
        "wood floor": "wooden_floor",
        concrete: "concrete",
        "concrete floor": "concrete",
      };

      const features = value
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item)
        .map((feature) => featureMapping[feature] || feature);

      setCourtFormData((prev) => ({
        ...prev,
        [arrayName]: features,
      }));
    } else {
      // Handle other arrays as simple strings
      const values = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
      setCourtFormData((prev) => ({
        ...prev,
        [arrayName]: values,
      }));
    }
  };

  // Helper function to convert backend enum values to user-friendly names for display
  const formatFeaturesForDisplay = (features) => {
    const displayMapping = {
      air_conditioned: "Air Conditioning",
      indoor: "Indoor",
      outdoor: "Outdoor",
      floodlights: "Floodlights",
      synthetic_turf: "Synthetic Turf",
      wooden_floor: "Wooden Floor",
      concrete: "Concrete",
    };

    return features
      .map((feature) => displayMapping[feature] || feature)
      .join(", ");
  };

  // Available feature options for dropdown
  const featureOptions = [
    { value: "indoor", label: "Indoor" },
    { value: "outdoor", label: "Outdoor" },
    { value: "air_conditioned", label: "Air Conditioning" },
    { value: "floodlights", label: "Floodlights" },
    { value: "synthetic_turf", label: "Synthetic Turf" },
    { value: "wooden_floor", label: "Wooden Floor" },
    { value: "concrete", label: "Concrete" },
  ];

  // Available sport type options for dropdown
  const sportTypeOptions = [
    { value: "badminton", label: "Badminton" },
    { value: "tennis", label: "Tennis" },
    { value: "football", label: "Football" },
    { value: "basketball", label: "Basketball" },
    { value: "cricket", label: "Cricket" },
    { value: "volleyball", label: "Volleyball" },
    { value: "table_tennis", label: "Table Tennis" },
  ];

  // Available unit options for dimensions
  const unitOptions = [
    { value: "meters", label: "Meters" },
    { value: "feet", label: "Feet" },
  ];

  // Handle feature selection from dropdown
  const handleFeatureToggle = (featureValue) => {
    setCourtFormData((prev) => {
      const currentFeatures = prev.features || [];
      const isSelected = currentFeatures.includes(featureValue);

      if (isSelected) {
        // Remove feature if already selected
        return {
          ...prev,
          features: currentFeatures.filter((f) => f !== featureValue),
        };
      } else {
        // Add feature if not selected
        return {
          ...prev,
          features: [...currentFeatures, featureValue],
        };
      }
    });
  };

  const handleSave = () => {
    onSave(courtFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Court" : "Add New Court"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={courtFormData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., Basketball Court A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Type *
                </label>
                <select
                  name="sportType"
                  value={courtFormData.sportType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select Sport</option>
                  {sportTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour *
                </label>
                <input
                  type="number"
                  name="pricePerHour"
                  value={courtFormData.pricePerHour}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={courtFormData.capacity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Maximum players"
                />
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Dimensions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length
                </label>
                <input
                  type="number"
                  name="dimensions.length"
                  value={courtFormData.dimensions.length}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Length"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  name="dimensions.width"
                  value={courtFormData.dimensions.width}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Width"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="dimensions.unit"
                  value={courtFormData.dimensions.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {unitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Operating Hours
            </h3>
            <div className="space-y-3">
              {Object.keys(courtFormData.operatingHours).map((day) => (
                <div
                  key={day}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-20">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </span>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={courtFormData.operatingHours[day].isAvailable}
                      onChange={(e) => {
                        setCourtFormData((prev) => ({
                          ...prev,
                          operatingHours: {
                            ...prev.operatingHours,
                            [day]: {
                              ...prev.operatingHours[day],
                              isAvailable: e.target.checked,
                            },
                          },
                        }));
                      }}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-600">Available</span>
                  </label>
                  {courtFormData.operatingHours[day].isAvailable && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={courtFormData.operatingHours[day].start}
                        onChange={(e) => {
                          setCourtFormData((prev) => ({
                            ...prev,
                            operatingHours: {
                              ...prev.operatingHours,
                              [day]: {
                                ...prev.operatingHours[day],
                                start: e.target.value,
                              },
                            },
                          }));
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={courtFormData.operatingHours[day].end}
                        onChange={(e) => {
                          setCourtFormData((prev) => ({
                            ...prev,
                            operatingHours: {
                              ...prev.operatingHours,
                              [day]: {
                                ...prev.operatingHours[day],
                                end: e.target.value,
                              },
                            },
                          }));
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
            <div className="space-y-2">
              {featureOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={courtFormData.features.includes(option.value)}
                    onChange={() => handleFeatureToggle(option.value)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {/* Display selected features */}
            {courtFormData.features.length > 0 && (
              <div className="mt-3 p-2 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">Selected: </span>
                <span className="text-sm font-medium">
                  {courtFormData.features
                    .map(
                      (feature) =>
                        featureOptions.find((opt) => opt.value === feature)
                          ?.label || feature
                    )
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Equipment */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Equipment
            </h3>
            <textarea
              value={courtFormData.equipment
                .map((eq) => (typeof eq === "string" ? eq : eq.name))
                .join(", ")}
              onChange={(e) => handleArrayChange("equipment", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              rows="3"
              placeholder="Enter equipment separated by commas (e.g., Basketball Hoops, Scoreboards, First Aid Kit)"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? "Update Court" : "Add Court"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const FacilityManagement = () => {
  // const { user } = useAuth(); // Currently unused but may be needed for user info
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [venues, setVenues] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage] = useState(false); // Currently unused but may be needed for success messages

  // Court management states
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [selectedVenueForCourts, setSelectedVenueForCourts] = useState(null);
  const [editingCourt, setEditingCourt] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "", // Changed from pincode to zipCode to match backend
      coordinates: {
        latitude: 19.076, // Default Mumbai coordinates as numbers
        longitude: 72.8777,
      },
    },
    sportsSupported: [],
    amenities: [],
    photos: [],
    startingPrice: "",
    operatingHours: {
      monday: { isOpen: true, open: "06:00", close: "22:00" },
      tuesday: { isOpen: true, open: "06:00", close: "22:00" },
      wednesday: { isOpen: true, open: "06:00", close: "22:00" },
      thursday: { isOpen: true, open: "06:00", close: "22:00" },
      friday: { isOpen: true, open: "06:00", close: "22:00" },
      saturday: { isOpen: true, open: "06:00", close: "22:00" },
      sunday: { isOpen: true, open: "06:00", close: "22:00" },
    },
  });

  // Backend enum values (exact match required)
  const sportsOptions = [
    "badminton",
    "tennis",
    "football",
    "basketball",
    "cricket",
    "volleyball",
    "table_tennis",
  ];
  const amenityOptions = [
    "parking",
    "washroom",
    "drinking_water",
    "changing_room",
    "equipment_rental",
    "cafeteria",
    "ac",
    "lighting",
  ];
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Load static sample venues
  useEffect(() => {
    const loadOwnerVenues = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await venueService.getOwnerVenuesService();

        if (response.data && response.data.data) {
          const venues = response.data.data.venues || response.data.data || [];
          setVenues(venues);

          // Load courts for each approved venue
          try {
            const courtsResponse = await courtService.getOwnerCourtsService();
            const courts =
              courtsResponse.data?.data?.courts ||
              courtsResponse.data?.data ||
              [];

            // Group courts by venue
            const courtsByVenue = courts.reduce((acc, court) => {
              const venueId = court.venue;
              if (!acc[venueId]) acc[venueId] = [];
              acc[venueId].push(court);
              return acc;
            }, {});

            // Update venues with their courts
            setVenues((prev) =>
              prev.map((venue) => ({
                ...venue,
                courts: courtsByVenue[venue._id] || [],
              }))
            );
          } catch (courtError) {
            console.error("Error loading courts:", courtError);
            // Don't show error for courts, just continue without them
          }
        }
      } catch (error) {
        console.error("Error loading venues:", error);
        setError(error.message || "Failed to load venues");
        // Fallback to empty array for development
        setVenues([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOwnerVenues();
  }, []);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleNestedInputChange = (parent, child, value) => {
    if (parent.includes(".")) {
      // Handle deeper nested objects like address.coordinates
      const [parentKey, nestedKey] = parent.split(".");
      setFormData((prev) => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [nestedKey]: {
            ...prev[parentKey][nestedKey],
            [child]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    }
  };

  // Function to get coordinates from address (currently unused but ready for geocoding integration)
  // const getCoordinatesFromAddress = async (address) => {
  //   try {
  //     // For now, return default coordinates for Mumbai
  //     // In production, you would integrate with Google Maps Geocoding API or similar
  //     console.log('Getting coordinates for address:', address);
  //     return {
  //       latitude: 19.0760,
  //       longitude: 72.8777
  //     };
  //   } catch (error) {
  //     console.error('Error getting coordinates:', error);
  //     return {
  //       latitude: 19.0760, // Default to Mumbai coordinates
  //       longitude: 72.8777
  //     };
  //   }
  // };

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 4 - formData.photos.length;

    if (remainingSlots <= 0) {
      alert("You can only upload maximum 4 photos per venue");
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(
        `Only ${remainingSlots} more photos can be added. Maximum 4 photos allowed.`
      );
    }

    // Store actual File objects for backend upload
    setFormData((prev) => ({
      ...prev,
      photos: [
        ...prev.photos,
        ...filesToProcess.map((file) => ({
          file: file,
          url: URL.createObjectURL(file),
          alt: file.name,
        })),
      ],
    }));
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        coordinates: {
          latitude: "",
          longitude: "",
        },
      },
      sportsSupported: [],
      amenities: [],
      photos: [],
      startingPrice: "",
      operatingHours: {
        monday: { isOpen: true, open: "06:00", close: "22:00" },
        tuesday: { isOpen: true, open: "06:00", close: "22:00" },
        wednesday: { isOpen: true, open: "06:00", close: "22:00" },
        thursday: { isOpen: true, open: "06:00", close: "22:00" },
        friday: { isOpen: true, open: "06:00", close: "22:00" },
        saturday: { isOpen: true, open: "06:00", close: "22:00" },
        sunday: { isOpen: true, open: "06:00", close: "22:00" },
      },
    });
  };

  const handleSave = async () => {
    setIsSubmittingRequest(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.startingPrice) {
        throw new Error("Please fill in all required fields");
      }

      if (
        !formData.address.street ||
        !formData.address.city ||
        !formData.address.state ||
        !formData.address.zipCode
      ) {
        throw new Error("Please fill in all address fields");
      }

      if (formData.sportsSupported.length === 0) {
        throw new Error("Please select at least one sport");
      }

      // Ensure coordinates are always set as numbers (required by backend)
      const coordinates = {
        latitude: Number(formData.address.coordinates.latitude) || 19.076, // Default Mumbai coordinates
        longitude: Number(formData.address.coordinates.longitude) || 72.8777,
      };

      if (editingVenue) {
        // Update existing venue
        const updateData = {
          ...formData,
          address: {
            ...formData.address,
            coordinates,
          },
          startingPrice: Number(formData.startingPrice),
          newPhotos: formData.photos
            .filter((photo) => photo.file)
            .map((photo) => photo.file),
        };

        const response = await venueService.updateVenueService(
          editingVenue._id,
          updateData
        );

        if (response.data && response.data.data) {
          // Update venues list with updated venue
          setVenues((prev) =>
            prev.map((venue) =>
              venue._id === editingVenue._id ? response.data.data : venue
            )
          );
          setIsEditModalOpen(false);
          setEditingVenue(null);
          alert("Venue updated successfully!");
        }
      } else {
        // Create new venue data for backend
        const newVenue = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: {
            street: formData.address.street.trim(),
            city: formData.address.city.trim(),
            state: formData.address.state.trim(),
            zipCode: formData.address.zipCode.trim(),
            coordinates,
          },
          sportsSupported: Array.isArray(formData.sportsSupported) ? formData.sportsSupported : [],
          amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
          startingPrice: Number(formData.startingPrice),
          operatingHours: formData.operatingHours || {},
          photos: formData.photos.map((photo) => photo.file).filter(Boolean),
        };

        const response = await venueService.createVenueService(newVenue);

        if (response.data && response.data.data) {
          // Add new venue to list (it will have status 'pending')
          setVenues((prev) => [...prev, response.data.data]);
          setIsAddModalOpen(false);
          alert(
            "Venue request submitted successfully! It will be reviewed by admin."
          );
        }
      }
    } catch (error) {
      console.error("Error saving venue:", error);
      setError(error.message || "Failed to save venue. Please try again.");
      alert(error.message || "Failed to save venue. Please try again.");
    } finally {
      setIsSubmittingRequest(false);
    }
    resetForm();
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setFormData(venue);
    setIsEditModalOpen(true);
  };

  const handleDelete = (venueId) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      setVenues((prev) => prev.filter((venue) => venue._id !== venueId));
    }
  };

  // Court management functions
  const handleManageCourts = (venue) => {
    setSelectedVenueForCourts(venue);
    setEditingCourt(null); // Clear any existing editing state
    setIsCourtModalOpen(true);
  };

  const handleCourtSave = async (courtData) => {
    try {
      if (editingCourt) {
        // Update existing court
        const updatedCourt = await courtService.updateCourtService(
          editingCourt._id,
          courtData
        );

        // Update local venues state with the updated court
        setVenues((prev) =>
          prev.map((venue) => ({
            ...venue,
            courts:
              venue.courts?.map((court) =>
                court._id === editingCourt._id ? updatedCourt : court
              ) || [],
          }))
        );

        console.log("Court updated successfully:", updatedCourt);
      } else {
        // Create new court
        // Ensure all operating hours have complete data
        const completeOperatingHours = {};
        Object.keys(courtData.operatingHours).forEach((day) => {
          const dayData = courtData.operatingHours[day];
          completeOperatingHours[day] = {
            start: dayData.start || "06:00",
            end: dayData.end || "22:00",
            isAvailable:
              dayData.isAvailable !== undefined ? dayData.isAvailable : true,
          };
        });

        const finalCourtData = {
          venue: selectedVenueForCourts._id,
          customName: courtData.name, // Use customName for backend
          sportType: courtData.sportType,
          pricePerHour: parseFloat(courtData.pricePerHour),
          capacity: parseInt(courtData.capacity),
          dimensions: {
            length: parseFloat(courtData.dimensions.length) || 0,
            width: parseFloat(courtData.dimensions.width) || 0,
            unit: courtData.dimensions.unit || "meters",
          },
          features: courtData.features || [],
          equipment: courtData.equipment || [],
          operatingHours: completeOperatingHours,
        };

        console.log("Sending court data:", finalCourtData);

        const response = await courtService.createCourtService(finalCourtData);
        const newCourt = response.data.data; // Extract court from API response

        // Update local venues state with the new court
        setVenues((prev) =>
          prev.map((venue) =>
            venue._id === selectedVenueForCourts._id
              ? { ...venue, courts: [...(venue.courts || []), newCourt] }
              : venue
          )
        );

        console.log("Court created successfully:", newCourt);
      }

      setEditingCourt(null);
      setIsCourtModalOpen(false);
    } catch (error) {
      console.error("Error saving court:", error);
      alert("Failed to save court. Please try again.");
    }
  };

  // Delete court function
  const handleDeleteCourt = async (courtId) => {
    try {
      await courtService.deleteCourtService(courtId);

      // Remove court from local venues state
      setVenues((prev) =>
        prev.map((venue) => ({
          ...venue,
          courts: venue.courts?.filter((court) => court._id !== courtId) || [],
        }))
      );

      console.log("Court deleted successfully");
    } catch (error) {
      console.error("Error deleting court:", error);
      alert("Failed to delete court. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <OwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <span className="ml-3 text-gray-600">Loading venues...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="text-red-400">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Facility Management
              </h1>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Venue</span>
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Venue Request Sent Successfully!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Your venue request has been sent to the admin for
                        approval. You will be notified once it's reviewed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Venues List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <div
                  key={venue._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {venue.photos && venue.photos.length > 0 ? (
                      <img
                        src={venue.photos[0].url}
                        alt={venue.photos[0].alt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-16 h-16 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {venue.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          venue.status === "pending_approval"
                            ? "bg-yellow-100 text-yellow-800"
                            : venue.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : venue.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {venue.status === "pending_approval"
                          ? "Pending Approval"
                          : venue.status === "approved"
                          ? "Approved"
                          : venue.status === "rejected"
                          ? "Rejected"
                          : venue.status}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {venue.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {venue.address.city}, {venue.address.state}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="w-4 h-4" />
                        <span>₹{venue.startingPrice}/hour starting</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {venue.sportsSupported.slice(0, 3).map((sport, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {sport}
                        </span>
                      ))}
                      {venue.sportsSupported.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{venue.sportsSupported.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-600">
                        <div>Bookings: {venue.totalBookings}</div>
                        <div>Earnings: ₹{venue.totalEarnings}</div>
                      </div>
                      <div className="flex space-x-2">
                        {venue.status === "approved" ? (
                          <button
                            onClick={() => handleEdit(venue)}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit venue"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        ) : (
                          <div
                            className="p-2 text-gray-300 cursor-not-allowed rounded-lg"
                            title={
                              venue.status === "pending_approval"
                                ? "Cannot edit while pending approval"
                                : "Cannot edit rejected venue"
                            }
                          >
                            <Edit3 className="w-4 h-4" />
                          </div>
                        )}

                        <button
                          onClick={() => handleDelete(venue._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete venue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Courts Management Section - Only for approved venues */}
                    {venue.status === "approved" && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Courts:</span>{" "}
                            {venue.courts?.length || 0} configured
                          </div>
                          <button
                            onClick={() => handleManageCourts(venue)}
                            className="text-xs bg-gray-900 text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            Manage Courts
                          </button>
                        </div>

                        {/* Court List Display */}
                        {venue.courts && venue.courts.length > 0 && (
                          <div className="space-y-2">
                            {venue.courts.slice(0, 3).map((court, index) => (
                              <div
                                key={court._id || index}
                                className="bg-gray-50 rounded-lg p-3 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <span className="font-medium text-gray-900">
                                      {court.name ||
                                        `Court ${court.courtNumber}`}
                                    </span>
                                    <span className="text-gray-500 ml-2">
                                      ({court.sportType})
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-600">
                                      ₹{court.pricePerHour}/hr
                                    </span>
                                    <button
                                      onClick={() => {
                                        setEditingCourt(court);
                                        setSelectedVenueForCourts(venue);
                                        setIsCourtModalOpen(true);
                                      }}
                                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="Edit court"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            "Are you sure you want to delete this court?"
                                          )
                                        ) {
                                          handleDeleteCourt(court._id);
                                        }
                                      }}
                                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Delete court"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                {court.features &&
                                  court.features.length > 0 && (
                                    <div className="text-gray-500 mt-1">
                                      {court.features.slice(0, 2).join(", ")}
                                      {court.features.length > 2 &&
                                        ` +${court.features.length - 2} more`}
                                    </div>
                                  )}
                              </div>
                            ))}
                            {venue.courts.length > 3 && (
                              <div className="text-xs text-gray-500 text-center py-1">
                                +{venue.courts.length - 3} more courts
                              </div>
                            )}
                          </div>
                        )}

                        {/* Empty state for courts */}
                        {(!venue.courts || venue.courts.length === 0) && (
                          <div className="text-center py-3 text-gray-500 text-xs">
                            No courts added yet. Click "Manage Courts" to add
                            courts.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {venues.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Venues Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by adding your first venue
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(true);
                  }}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add Your First Venue
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Modal */}
      <FacilityModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New Venue"
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        handleNestedInputChange={handleNestedInputChange}
        handleOperatingHoursChange={handleOperatingHoursChange}
        handlePhotoUpload={handlePhotoUpload}
        removePhoto={removePhoto}
        sportsOptions={sportsOptions}
        amenityOptions={amenityOptions}
        days={days}
        handleSave={handleSave}
        isSubmittingRequest={isSubmittingRequest}
        editingVenue={editingVenue}
      />

      {/* Edit Modal */}
      <FacilityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingVenue(null);
          resetForm();
        }}
        title="Edit Venue"
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        handleNestedInputChange={handleNestedInputChange}
        handleOperatingHoursChange={handleOperatingHoursChange}
        handlePhotoUpload={handlePhotoUpload}
        removePhoto={removePhoto}
        sportsOptions={sportsOptions}
        amenityOptions={amenityOptions}
        days={days}
        handleSave={handleSave}
        isSubmittingRequest={isSubmittingRequest}
        editingVenue={editingVenue}
      />

      {/* Court Modal */}
      <CourtModal
        isOpen={isCourtModalOpen}
        onClose={() => {
          setIsCourtModalOpen(false);
          setSelectedVenueForCourts(null);
          setEditingCourt(null);
        }}
        courtData={editingCourt}
        onSave={handleCourtSave}
        isEditing={!!editingCourt}
      />
    </div>
  );
};

export default FacilityManagement;
