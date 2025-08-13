import fetch from 'node-fetch';

// Generate static map image URL using Mapbox API
export const generateStaticMap = async (req, res) => {
  try {
    const { longitude, latitude, zoom = 15, width = 600, height = 400 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    // Validate coordinates
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    if (isNaN(lon) || isNaN(lat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates out of valid range'
      });
    }

    const mapboxToken = process.env.MAP_TOKEN;
    if (!mapboxToken) {
      return res.status(500).json({
        success: false,
        message: 'Mapbox token not configured'
      });
    }

    // Create pin marker at venue location
    const marker = `pin-s-marker+ff0000(${lon},${lat})`;
    
    // Generate static map URL
    const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${marker}/${lon},${lat},${zoom}/${width}x${height}@2x?access_token=${mapboxToken}`;

    // Get reverse geocoding for address details
    const reverseGeocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxToken}`;
    
    let addressDetails = null;
    try {
      const geoResponse = await fetch(reverseGeocodeUrl);
      const geoData = await geoResponse.json();
      
      if (geoData.features && geoData.features.length > 0) {
        const feature = geoData.features[0];
        addressDetails = {
          formatted_address: feature.place_name,
          components: feature.context || []
        };
      }
    } catch (geoError) {
      console.error('Reverse geocoding error:', geoError);
      // Continue without address details
    }

    res.json({
      success: true,
      data: {
        staticMapUrl,
        coordinates: { longitude: lon, latitude: lat },
        zoom: parseInt(zoom),
        dimensions: { width: parseInt(width), height: parseInt(height) },
        addressDetails,
        interactiveMapData: {
          center: [lon, lat],
          zoom: parseInt(zoom),
          marker: {
            coordinates: [lon, lat],
            color: '#ff0000'
          }
        }
      }
    });

  } catch (error) {
    console.error('Static map generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate map'
    });
  }
};

// Get directions between two points
export const getDirections = async (req, res) => {
  try {
    const { startLng, startLat, endLng, endLat, profile = 'driving' } = req.query;

    if (!startLng || !startLat || !endLng || !endLat) {
      return res.status(400).json({
        success: false,
        message: 'Start and end coordinates are required'
      });
    }

    const mapboxToken = process.env.MAP_TOKEN;
    if (!mapboxToken) {
      return res.status(500).json({
        success: false,
        message: 'Mapbox token not configured'
      });
    }

    // Valid profiles: driving, walking, cycling
    const validProfiles = ['driving', 'walking', 'cycling'];
    const selectedProfile = validProfiles.includes(profile) ? profile : 'driving';

    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${selectedProfile}/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${mapboxToken}`;
    
    const response = await fetch(directionsUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Directions API error');
    }

    res.json({
      success: true,
      data: {
        routes: data.routes,
        profile: selectedProfile
      }
    });

  } catch (error) {
    console.error('Directions API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get directions'
    });
  }
};
