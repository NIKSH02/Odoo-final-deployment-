import api from '../api/axiosInstance.js';

// Search for locations using the backend Mapbox integration
export const searchLocations = async (query) => {
  try {
    const response = await api.get(`/location/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Reverse geocode coordinates to get location details
export const reverseGeocode = async (longitude, latitude) => {
  try {
    const response = await api.get(`/location/reverse?longitude=${longitude}&latitude=${latitude}`);
    return response.data;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
};

// Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  });
};
