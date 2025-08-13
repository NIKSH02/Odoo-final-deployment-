import React, { useState, useEffect } from 'react';
import { Star, MapPin, Search, ChevronDown, X, Filter, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAllVenuesService } from '../services/venueService';

const VenueCard = ({ venue }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/venue/${venue._id}`);
  };

  return (
    <div
      className="bg-white border border-gray-300 rounded-lg p-3 transition-all duration-300 relative group hover:shadow-xl hover:-translate-y-2 hover:border-black cursor-pointer"
      style={{
        width: "280px",
        height: "350px",
        minWidth: "280px",
        maxWidth: "280px",
        minHeight: "350px",
        maxHeight: "350px",
      }}
      onClick={handleViewDetails}
    >
      {/* Image */}
      <div className="bg-gray-200 rounded-md h-28 flex items-center justify-center border border-gray-300 mb-3 mt-2 transition-all duration-300 group-hover:bg-gray-300 group-hover:border-gray-400 overflow-hidden">
        {venue.photos && venue.photos.length > 0 ? (
          <img 
            src={venue.photos[0].url || venue.photos[0]} 
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-600 text-sm group-hover:text-gray-700">No Image</span>
        )}
      </div>

      {/* Venue Details - Fixed height container */}
      <div style={{ height: '200px' }} className="flex flex-col">
        {/* Venue Name */}
        <div style={{ height: '20px' }} className="flex items-center mb-2">
          <span className="text-sm font-semibold text-black truncate">{venue.name}</span>
        </div>

        {/* Location */}
        <div
          style={{ height: "20px" }}
          className="flex items-center gap-1 text-gray-700 mb-2"
        >
          <MapPin className="w-3 h-3 text-gray-600 flex-shrink-0" />
          <span className="text-xs truncate">{venue.address?.city || venue.address?.street || 'Location not specified'}</span>
        </div>

        {/* Price */}
        <div style={{ height: '20px' }} className="flex items-center mb-2">
          <span className="text-sm font-semibold text-black truncate">₹ {venue.startingPrice || 0} per hour</span>
        </div>

        {/* Rating */}
        <div
          style={{ height: "20px" }}
          className="flex items-center gap-1 mb-2"
        >
          <Star className="w-4 h-4 fill-gray-800 text-gray-800 flex-shrink-0" />
          <span className="text-sm font-semibold text-black">{venue.rating?.average || 0}</span>
          <span className="text-xs text-gray-500">({venue.rating?.totalReviews || 0})</span>
        </div>

        {/* Tags */}
        <div style={{ height: '40px' }} className="flex flex-wrap gap-1 mb-3 overflow-hidden">
          {(venue.amenities || []).slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700 border border-gray-300 h-fit transition-all duration-300 group-hover:bg-gray-300 group-hover:text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* View Details Button */}
        <div className="mt-auto">
          <button 
            onClick={handleViewDetails}
            className="w-full bg-black text-white py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-800 hover:shadow-lg transform hover:scale-105 group-hover:bg-gray-800"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const MobileSidebar = ({ isOpen, onClose, filters, setFilters }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-white to-gray-50 z-50 transform transition-transform duration-300 lg:hidden shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Filters
            </h3>
            <p className="text-xs text-gray-500">Find your perfect venue</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full pb-20">
          <SidebarContent filters={filters} setFilters={setFilters} />
        </div>
      </div>
    </>
  );
};

const SidebarContent = ({ filters, setFilters }) => {
  const handleRatingChange = (rating) => {
    setFilters((prev) => ({
      ...prev,
      selectedRatings: prev.selectedRatings.includes(rating)
        ? prev.selectedRatings.filter((r) => r !== rating)
        : [...prev.selectedRatings, rating],
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedSport: '',
      priceRange: [0, 5500],
      venueType: "",
      selectedRatings: [],
    });
  };

  return (
    <div className="space-y-8">
      {/* Search by venue name */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
          <Search className="w-4 h-4 text-gray-600" />
          Search by venue name
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Enter venue name..."
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
            }
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-sm"
          />
        </div>
      </div>

      {/* Filter by sport type */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
          🏸 Sport Type
        </label>
        <div className="relative">
          <select
            value={filters.selectedSport}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, selectedSport: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-all duration-200 text-sm cursor-pointer hover:border-gray-300"
          >
            <option value="">All Sports</option>
            <option value="badminton">🏸 Badminton</option>
            <option value="tennis">🎾 Tennis</option>
            <option value="football">⚽ Football</option>
            <option value="basketball">🏀 Basketball</option>
            <option value="cricket">🏏 Cricket</option>
            <option value="volleyball">🏐 Volleyball</option>
            <option value="table_tennis">🏓 Table Tennis</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Price range */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4">
          💰 Price Range (per hour)
        </label>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">₹ 0</span>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">₹ {filters.priceRange[1].toLocaleString()}</span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">₹ 5,500</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="5500"
            step="100"
            value={filters.priceRange[1]}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                priceRange: [0, parseInt(e.target.value)],
              }))
            }
            className="w-full h-3 bg-gradient-to-r from-gray-200 to-blue-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(filters.priceRange[1] / 5500) * 100}%, #e5e7eb ${(filters.priceRange[1] / 5500) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>

      {/* Choose Venue Type */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4">
          🏢 Venue Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="relative cursor-pointer">
            <input
              type="radio"
              name="venueType"
              value="indoor"
              checked={filters.venueType === "indoor"}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, venueType: e.target.value }))
              }
              className="sr-only"
            />
            <div className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
              filters.venueType === "indoor" 
                ? "border-blue-500 bg-blue-50 text-blue-700" 
                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
            }`}>
              <div className="text-lg mb-1">🏢</div>
              <span className="text-xs font-medium">Indoor</span>
            </div>
          </label>
          <label className="relative cursor-pointer">
            <input
              type="radio"
              name="venueType"
              value="outdoor"
              checked={filters.venueType === "outdoor"}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, venueType: e.target.value }))
              }
              className="sr-only"
            />
            <div className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
              filters.venueType === "outdoor" 
                ? "border-blue-500 bg-blue-50 text-blue-700" 
                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
            }`}>
              <div className="text-lg mb-1">🌞</div>
              <span className="text-xs font-medium">Outdoor</span>
            </div>
          </label>
        </div>
        {filters.venueType && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, venueType: "" }))}
            className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Rating */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          Minimum Rating
        </label>
        <div className="space-y-3">
          {[4, 3, 2, 1].map((stars) => (
            <label key={stars} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.selectedRatings.includes(stars)}
                onChange={() => handleRatingChange(stars)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                filters.selectedRatings.includes(stars)
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300 group-hover:border-gray-400"
              }`}>
                {filters.selectedRatings.includes(stars) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex items-center gap-1">
                {[...Array(stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-gray-600 ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <div className="pt-2">
        <button
          onClick={clearFilters}
          className="w-full bg-gradient-to-r from-gray-800 to-black text-white py-3 px-4 rounded-lg text-sm font-medium hover:from-gray-900 hover:to-gray-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          🗑️ Clear all filters
        </button>
      </div>
    </div>
  );
};

const SportsVenuesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedSport: '',
    priceRange: [0, 5500],
    venueType: "",
    selectedRatings: [],
  });

  // Custom CSS for the range slider
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .slider-thumb::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        transition: all 0.2s ease;
      }
      .slider-thumb::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }
      .slider-thumb::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load venues on component mount and when filters change
  useEffect(() => {
    const loadVenues = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters based on filters
        const queryParams = {
          page: 1,
          limit: 20,
        };

        if (filters.searchTerm) {
          queryParams.search = filters.searchTerm;
        }

        if (filters.selectedSport) {
          queryParams.sport = filters.selectedSport;
        }

        if (filters.priceRange[1] < 5500) {
          queryParams.maxPrice = filters.priceRange[1];
        }

        if (filters.selectedRatings.length > 0) {
          queryParams.rating = Math.min(...filters.selectedRatings);
        }

        const response = await getAllVenuesService(queryParams);
        
        if (response.data && response.data.data && response.data.data.venues) {
          let venuesData = response.data.data.venues;

          // Apply venue type filter (indoor/outdoor) client-side
          if (filters.venueType) {
            venuesData = venuesData.filter(venue => {
              // Assuming venue type can be determined from amenities or a specific field
              const hasIndoorAmenities = venue.amenities?.some(amenity => 
                ['ac', 'indoor'].includes(amenity.toLowerCase())
              );
              
              if (filters.venueType === 'indoor') {
                return hasIndoorAmenities;
              } else if (filters.venueType === 'outdoor') {
                return !hasIndoorAmenities;
              }
              return true;
            });
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
  }, [filters]);

  // Reset selectedSport filter initialization
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      selectedSport: ''
    }));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* <Navbar /> */}

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <Menu className="w-5 h-5 text-gray-700" />
            <Filter className="w-4 h-4 text-blue-600" />
          </button>
          <h1 className="text-base font-bold text-gray-800 flex-1 leading-tight">
            Sports Venues in Ahmedabad
          </h1>
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search venues..."
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
            }
            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-sm bg-gray-50"
          />
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
          >
            <Filter className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}

      <div className="flex">
        {/* Desktop Sidebar - Back to left side */}
        <div className="hidden lg:block w-80 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 p-6 h-screen sticky top-0 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Filter Venues
            </h2>
            <p className="text-xs text-gray-500 mt-1">Find your perfect sports venue</p>
          </div>
          <SidebarContent filters={filters} setFilters={setFilters} />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          filters={filters}
          setFilters={setFilters}
        />

        {/* Main Content with proper spacing */}
        <div className="flex-1 bg-white">
          <div className="hidden lg:block bg-white border-b border-gray-200 py-8 shadow-sm">
            <div className="max-w-7xl mx-auto px-6">
              <h1 className="text-3xl font-bold text-gray-800 text-center">
                Sports Venues in Ahmedabad
              </h1>
              <p className="text-gray-600 text-center mt-2">Discover and book nearby venues for your favorite sports</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading venues...</div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* No venues found */}
            {!loading && !error && venues.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No venues found</div>
                <div className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</div>
              </div>
            )}

            {/* Cards Grid with better spacing */}
            {!loading && venues.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                {venues.map((venue) => (
                  <VenueCard key={venue._id} venue={venue} />
                ))}
              </div>
            )}

            {/* Load More for mobile */}
            {!loading && venues.length > 0 && (
              <div className="mt-8 text-center lg:hidden">
                <button className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsVenuesPage;
