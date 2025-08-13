import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import { getAllVenuesService, filterVenuesWithinRadius } from '../services/venueService';

// Single Venue Card
const VenueCard = ({ venue }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/venue/${venue._id || venue.id}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col p-4">
      {/* Image */}
      <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center mb-4 overflow-hidden">
        {venue.photos && venue.photos.length > 0 ? (
          <img 
            src={venue.photos[0].url || venue.photos[0]} 
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">No Image</span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-lg">{venue.name}</h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-600 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{venue.address?.city || venue.address?.street || 'Location not specified'}</span>
          {venue.distance && (
            <span className="text-xs text-blue-600 ml-auto">
              {venue.distance}km away
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 fill-gray-800 text-gray-800" />
          <span className="font-medium">{venue.rating?.average || 0}</span>
          <span className="text-gray-500">({venue.rating?.totalReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="font-semibold text-black">
          ₹ {venue.startingPrice || 0} per hour
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {(venue.amenities || venue.tags || []).slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Button */}
        <div className="mt-auto pt-3">
          <button 
            onClick={handleViewDetails}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Section
const VenueBookingSection = ({ searchLocation }) => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load venues on component mount and when searchLocation changes
  useEffect(() => {
    const loadVenues = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all venues first
        const response = await getAllVenuesService({ limit: searchLocation ? 20 : 4 });
        
        if (response.data && response.data.data && response.data.data.venues) {
          let venuesData = response.data.data.venues;

          // If searchLocation is provided, filter venues within 10km radius
          if (searchLocation && searchLocation.coordinates) {
            venuesData = filterVenuesWithinRadius(venuesData, searchLocation.coordinates, 10);
            // Limit to 4 venues for the landing page section
            venuesData = venuesData.slice(0, 4);
          }

          setVenues(venuesData);
        } else {
          setVenues([]);
        }
      } catch (err) {
        console.error('Error loading venues:', err);
        setError('Failed to load venues');
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, [searchLocation]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 bg-gray-80">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading venues...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-80">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {searchLocation ? `Venues near ${searchLocation.city || searchLocation.location}` : 'Book Venues'}
          </h2>
          {searchLocation && (
            <p className="text-sm text-gray-600 mt-1">
              Showing venues within 10km radius
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/venues')}
          className="flex items-center gap-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <span className="text-sm sm:text-base font-medium">See all venues</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {venues.map((venue, index) => (
          <VenueCard key={venue._id || venue.id || index} venue={venue} />
        ))}
      </div>

      {/* No venues message */}
      {!loading && venues.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No venues found</div>
          <div className="text-gray-400 text-sm mt-2">Try searching for a different location</div>
        </div>
      )}
    </div>
  );
};

export default VenueBookingSection;
