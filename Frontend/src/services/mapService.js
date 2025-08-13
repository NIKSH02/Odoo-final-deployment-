import api from '../api/axiosInstance';

// Get static map data from backend
export const getStaticMapService = async (longitude, latitude, options = {}) => {
  const { zoom = 15, width = 600, height = 400 } = options;
  
  const params = new URLSearchParams({
    longitude: longitude.toString(),
    latitude: latitude.toString(),
    zoom: zoom.toString(),
    width: width.toString(),
    height: height.toString()
  });

  return api.get(`/map/static-map?${params}`);
};

// Get directions between two points
export const getDirectionsService = async (startLng, startLat, endLng, endLat, profile = 'driving') => {
  const params = new URLSearchParams({
    startLng: startLng.toString(),
    startLat: startLat.toString(),
    endLng: endLng.toString(),
    endLat: endLat.toString(),
    profile
  });

  return api.get(`/map/directions?${params}`);
};
