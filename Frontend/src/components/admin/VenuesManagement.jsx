import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { 
  getAllVenues, 
  getPendingFacilities, 
  approveFacility, 
  rejectFacility, 
  suspendVenue, 
  reactivateVenue,
  getVenueDetails 
} from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const VenuesManagement = () => {
  const [activeView, setActiveView] = useState('all'); // 'all', 'pending', 'approved', 'suspended'
  const [venues, setVenues] = useState([]);
  const [pendingVenues, setPendingVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showVenueDetails, setShowVenueDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  // Load venues data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeView === 'pending') {
          const response = await getPendingFacilities();
          setPendingVenues(response.data?.venues || []);
        } else {
          const params = {};
          if (activeView === 'approved') params.status = 'approved';
          if (activeView === 'suspended') params.status = 'suspended';
          
          const response = await getAllVenues(params);
          setVenues(response.data?.venues || []);
        }
      } catch (error) {
        console.error('Error loading venues:', error);
        showError('Failed to load venues data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeView, showError]);

  const loadVenuesData = async () => {
    setLoading(true);
    try {
      if (activeView === 'pending') {
        const response = await getPendingFacilities();
        setPendingVenues(response.data?.venues || []);
      } else {
        const params = {};
        if (activeView === 'approved') params.status = 'approved';
        if (activeView === 'suspended') params.status = 'suspended';
        
        const response = await getAllVenues(params);
        setVenues(response.data?.venues || []);
      }
    } catch (error) {
      console.error('Error loading venues:', error);
      showError('Failed to load venues data');
    } finally {
      setLoading(false);
    }
  };

  const handleVenueAction = async (venueId, action, additionalData = {}) => {
    setActionLoading(prev => ({ ...prev, [venueId]: action }));
    const loadingToast = showLoading(`${action}ing venue...`);

    try {
      let response;
      switch (action) {
        case 'approve':
          response = await approveFacility(venueId, { 
            comments: additionalData.comments || 'Venue approved by admin' 
          });
          break;
        case 'reject':
          response = await rejectFacility(venueId, { 
            reason: additionalData.reason || 'Venue rejected by admin' 
          });
          break;
        case 'suspend':
          response = await suspendVenue(venueId, { 
            reason: additionalData.reason || 'Venue suspended by admin' 
          });
          break;
        case 'reactivate':
          response = await reactivateVenue(venueId, { 
            reason: additionalData.reason || 'Venue reactivated by admin' 
          });
          break;
        default:
          throw new Error('Invalid action');
      }

      dismissToast(loadingToast);
      showSuccess(response.message || `Venue ${action}d successfully`);
      loadVenuesData(); // Reload data
    } catch (error) {
      dismissToast(loadingToast);
      showError(error.message || `Failed to ${action} venue`);
    } finally {
      setActionLoading(prev => ({ ...prev, [venueId]: null }));
    }
  };

  const handleViewDetails = async (venueId) => {
    try {
      const response = await getVenueDetails(venueId);
      setSelectedVenue(response.data);
      setShowVenueDetails(true);
    } catch (err) {
      console.error('Error loading venue details:', err);
      showError('Failed to load venue details');
    }
  };

  const filteredVenues = (activeView === 'pending' ? pendingVenues : venues).filter(venue =>
    venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      suspended: { color: 'bg-gray-100 text-gray-800', text: 'Suspended' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const VenueCard = ({ venue }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
            {getStatusBadge(venue.status)}
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="w-4 h-4 mr-2" />
              {venue.address?.street}, {venue.address?.city}, {venue.address?.state}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">Owner:</span>
              {venue.owner?.name || 'N/A'}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">Sports:</span>
              {venue.sportsSupported?.join(', ') || 'N/A'}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">Starting Price:</span>
              ₹{venue.startingPrice}/hour
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => handleViewDetails(venue._id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          
          {/* Action buttons based on status */}
          {venue.status === 'pending' && (
            <>
              <button
                onClick={() => handleVenueAction(venue._id, 'approve')}
                disabled={actionLoading[venue._id]}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading[venue._id] === 'approve' ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleVenueAction(venue._id, 'reject')}
                disabled={actionLoading[venue._id]}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading[venue._id] === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
            </>
          )}
          
          {venue.status === 'approved' && (
            <button
              onClick={() => handleVenueAction(venue._id, 'suspend')}
              disabled={actionLoading[venue._id]}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading[venue._id] === 'suspend' ? 'Suspending...' : 'Suspend'}
            </button>
          )}
          
          {venue.status === 'suspended' && (
            <button
              onClick={() => handleVenueAction(venue._id, 'reactivate')}
              disabled={actionLoading[venue._id]}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading[venue._id] === 'reactivate' ? 'Reactivating...' : 'Reactivate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const VenueDetailsModal = ({ venue, isOpen, onClose }) => {
    if (!isOpen || !venue) return null;

    console.log('Venue data in modal:', venue); // Debug log

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{venue.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Status:</span> {getStatusBadge(venue.status)}</p>
                  <p><span className="font-medium">Owner:</span> {venue.owner?.name || venue.ownerName || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {venue.owner?.email || venue.ownerEmail || 'N/A'}</p>
                  <p><span className="font-medium">Starting Price:</span> ₹{venue.startingPrice}/hour</p>
                  <p><span className="font-medium">Created:</span> {venue.createdAt ? new Date(venue.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Address</h3>
                <div className="space-y-1">
                  <p>{venue.address?.street || 'N/A'}</p>
                  <p>{venue.address?.city || 'N/A'}, {venue.address?.state || 'N/A'}</p>
                  <p>Zip: {venue.address?.zipCode || 'N/A'}</p>
                  {venue.address?.coordinates && (
                    <p className="text-sm text-gray-600">
                      Coordinates: {venue.address.coordinates.latitude}, {venue.address.coordinates.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600">{venue.description || 'No description provided'}</p>
            </div>

            {/* Sports & Amenities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sports Supported</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.sportsSupported && venue.sportsSupported.length > 0 ? (
                    venue.sportsSupported.map((sport, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No sports specified</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities && venue.amenities.length > 0 ? (
                    venue.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {amenity.replace('_', ' ').charAt(0).toUpperCase() + amenity.replace('_', ' ').slice(1)}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No amenities specified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Photos */}
            {venue.photos && venue.photos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {venue.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo.url}
                      alt={photo.caption || `Venue photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Operating Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Operating Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venue.operatingHours && Object.keys(venue.operatingHours).length > 0 ? (
                  Object.entries(venue.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-medium capitalize">{day}</span>
                      <span className="text-sm text-gray-600">
                        {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2">No operating hours specified</p>
                )}
              </div>
            </div>

            {/* Courts (if available) */}
            {venue.courts && venue.courts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Courts ({venue.courts.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {venue.courts.map((court, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">{court.name}</h4>
                      <p className="text-sm text-gray-600">Sport: {court.sportType}</p>
                      <p className="text-sm text-gray-600">Price: ₹{court.pricePerHour}/hour</p>
                      {court.capacity && (
                        <p className="text-sm text-gray-600">Capacity: {court.capacity} players</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venues Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all venues, approve pending requests, and monitor facility status
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', name: 'All Venues', count: venues.length },
            { id: 'pending', name: 'Pending Approval', count: pendingVenues.length },
            { id: 'approved', name: 'Approved', count: venues.filter(v => v.status === 'approved').length },
            { id: 'suspended', name: 'Suspended', count: venues.filter(v => v.status === 'suspended').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search venues by name, city, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>
      </div>

      {/* Venues List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No venues found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'No venues match the current filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue._id} venue={venue} />
          ))}
        </div>
      )}

      {/* Venue Details Modal */}
      <VenueDetailsModal
        venue={selectedVenue}
        isOpen={showVenueDetails}
        onClose={() => {
          setShowVenueDetails(false);
          setSelectedVenue(null);
        }}
      />
    </div>
  );
};

export default VenuesManagement;
