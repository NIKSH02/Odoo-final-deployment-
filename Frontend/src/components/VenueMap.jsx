import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, ExternalLink, Loader } from 'lucide-react';
import { getStaticMapService, getDirectionsService } from '../services/mapService';

const VenueMap = ({ 
  venue,
  height = '400px',
  className = '',
  showFullAddress = true,
  showDirections = true 
}) => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loadingDirections, setLoadingDirections] = useState(false);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate venue coordinates
        if (!venue?.address?.coordinates?.latitude || !venue?.address?.coordinates?.longitude) {
          setError('Venue location coordinates not available');
          return;
        }

        const { latitude, longitude } = venue.address.coordinates;

        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude)) {
          setError('Invalid venue coordinates');
          return;
        }

        // Get map data from backend
        const response = await getStaticMapService(longitude, latitude, {
          zoom: 15,
          width: 600,
          height: 400
        });

        if (response.data?.success) {
          setMapData(response.data.data);
        } else {
          setError('Failed to load map data');
        }

      } catch (err) {
        console.error('Map loading error:', err);
        setError('Failed to load map');
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [venue]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Get directions to venue
  const getDirectionsToVenue = async () => {
    if (!userLocation || !venue?.address?.coordinates) {
      // If no user location, try to get it first
      if (!userLocation) {
        getCurrentLocation();
      }
      return;
    }

    try {
      setLoadingDirections(true);
      const response = await getDirectionsService(
        userLocation.longitude,
        userLocation.latitude,
        venue.address.coordinates.longitude,
        venue.address.coordinates.latitude,
        'driving'
      );

      if (response.data?.success) {
        setDirections(response.data.data);
      }
    } catch (error) {
      console.error('Error getting directions:', error);
    } finally {
      setLoadingDirections(false);
    }
  };

  // Open in external map app
  const openInMaps = () => {
    if (!venue?.address?.coordinates) return;
    
    const { latitude, longitude } = venue.address.coordinates;
    const label = encodeURIComponent(venue.name || 'Venue');
    
    // Try to open in Apple Maps on iOS/macOS, Google Maps otherwise
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('Mac')) {
      window.open(`maps://?q=${latitude},${longitude}&ll=${latitude},${longitude}&t=m`);
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="flex flex-col items-center space-y-2">
          <Loader className="w-6 h-6 animate-spin text-gray-500" />
          <span className="text-sm text-gray-500">Loading map...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <MapPin className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Map not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-sm border ${className}`}>
      {/* Map Image */}
      <div className="relative" style={{ height }}>
        <img
          src={mapData.staticMapUrl}
          alt={`Map showing ${venue.name} location`}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Controls */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <button
            onClick={openInMaps}
            className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Open in Maps"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </button>
          
          {showDirections && (
            <button
              onClick={getDirectionsToVenue}
              disabled={loadingDirections}
              className="bg-blue-500 text-white p-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              title="Get Directions"
            >
              {loadingDirections ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Address Information */}
      {showFullAddress && (
        <div className="p-4 border-t">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {venue.name}
              </p>
              {venue.address && (
                <p className="text-sm text-gray-600 mt-1">
                  {venue.address.street}, {venue.address.city}, {venue.address.state} {venue.address.zipCode}
                </p>
              )}
              {mapData.addressDetails && (
                <p className="text-xs text-gray-500 mt-1">
                  {mapData.addressDetails.formatted_address}
                </p>
              )}
            </div>
          </div>

          {/* Directions Info */}
          {directions && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">
                  Distance: {(directions.routes[0]?.distance / 1000).toFixed(1)} km
                </span>
                <span className="text-blue-600">
                  Duration: {Math.ceil(directions.routes[0]?.duration / 60)} min
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueMap;
      