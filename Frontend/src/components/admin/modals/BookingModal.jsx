import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BookingModal = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Information */}
          <div>
            <h3 className="text-lg font-medium text-black mb-4">Booking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                <p className="mt-1 text-sm text-black">#{booking.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${
                  booking.status === 'confirmed' ? 'bg-gray-100 text-black' :
                  booking.status === 'pending' ? 'bg-gray-200 text-gray-600' :
                  'bg-gray-300 text-gray-700'
                }`}>
                  {booking.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Booking Date</label>
                <p className="mt-1 text-sm text-black">{booking.bookingDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Slot</label>
                <p className="mt-1 text-sm text-black">
                  {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                <p className="mt-1 text-sm text-black font-medium">${booking.amount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-sm text-black">
                  {new Date(booking.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="text-lg font-medium text-black mb-4">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-black">{booking.user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-black">{booking.user.email}</p>
              </div>
            </div>
          </div>

          {/* Venue & Court Information */}
          <div>
            <h3 className="text-lg font-medium text-black mb-4">Venue & Court Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Venue</label>
                <p className="mt-1 text-sm text-black">{booking.venue.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Court</label>
                <p className="mt-1 text-sm text-black">{booking.court.name}</p>
              </div>
            </div>
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
          {booking.status === 'pending' && (
            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              Update Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
