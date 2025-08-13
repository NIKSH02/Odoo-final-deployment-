import React from 'react';
import { XMarkIcon, CheckIcon, XMarkIcon as RejectIcon } from '@heroicons/react/24/outline';

const FacilityModal = ({ facility, onClose, onApprovalAction }) => {
  if (!facility) return null;

  const getMainPhoto = () => {
    const mainPhoto = facility.photos.find(photo => photo.isMainPhoto);
    return mainPhoto || facility.photos[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Facility Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Photo */}
          {getMainPhoto() && (
            <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={getMainPhoto().url}
                alt={getMainPhoto().caption}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-black mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Facility Name</label>
                <p className="mt-1 text-sm text-black font-medium">{facility.name}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-black">{facility.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Starting Price</label>
                <p className="mt-1 text-sm text-black font-medium">${facility.startingPrice}/hour</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${
                  facility.status === 'approved' ? 'bg-gray-100 text-black' :
                  facility.status === 'pending' ? 'bg-gray-200 text-gray-600' :
                  'bg-gray-300 text-gray-700'
                }`}>
                  {facility.status}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div>
            <h3 className="text-lg font-medium text-black mb-4">Owner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                <p className="mt-1 text-sm text-black">{facility.owner.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-black">{facility.owner.email}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-black mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <p className="mt-1 text-sm text-black">{facility.address.street}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <p className="mt-1 text-sm text-black">{facility.address.city}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <p className="mt-1 text-sm text-black">{facility.address.state}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                <p className="mt-1 text-sm text-black">{facility.address.zipCode}</p>
              </div>
            </div>
          </div>

          {/* Sports & Amenities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Sports Supported</h3>
              <div className="flex flex-wrap gap-2">
                {facility.sportsSupported.map((sport, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full capitalize"
                  >
                    {sport.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {facility.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full capitalize"
                  >
                    {amenity.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Photos Gallery */}
          {facility.photos.length > 1 && (
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Photos Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {facility.photos.map((photo, index) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                    {photo.caption && (
                      <p className="text-xs text-gray-600 mt-1 px-2">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Submitted On</label>
            <p className="mt-1 text-sm text-black">
              {new Date(facility.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
          >
            Close
          </button>
          {facility.status === 'pending' && (
            <>
              <button
                onClick={() => onApprovalAction(facility, 'reject')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              >
                <RejectIcon className="w-4 h-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => onApprovalAction(facility, 'approve')}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilityModal;
