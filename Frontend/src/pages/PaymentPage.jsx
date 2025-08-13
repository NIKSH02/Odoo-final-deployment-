import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getBookingByIdService } from '../services/bookingService';
import PaymentComponent from '../components/PaymentComponent';
import { useToast } from '../context/ToastContext';
import { ChevronLeft } from 'lucide-react';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  const returnUrl = location.state?.returnUrl || '/profile?tab=bookings';

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await getBookingByIdService(bookingId);
        setBooking(response.data.data);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError(err.response?.data?.message || 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    if (!booking && bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, booking]);

  const handlePaymentSuccess = () => {
    showSuccess('Payment successful! Your booking is confirmed.');
    
    // Navigate to success page or bookings
    setTimeout(() => {
      navigate(returnUrl, { 
        state: { 
          paymentSuccess: true,
          bookingId: booking._id 
        } 
      });
    }, 2000);
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    
    // Stay on payment page for retry
    showError('Payment failed. You can try again or contact support.');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-6">{error || 'Booking not found'}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if payment is already completed
  if (booking.paymentStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Completed</h2>
          <p className="text-gray-600 mb-6">
            This booking has already been paid for and confirmed.
          </p>
          <button
            onClick={() => navigate(returnUrl)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft size={20} />
            <span className="ml-1">Back</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">
            Secure your booking with a quick and safe payment
          </p>
        </div>

        {/* Payment Component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <PaymentComponent
              booking={booking}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
              isRetry={booking.paymentDetails?.retryCount > 0}
            />
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Venue Information</h3>
                <p className="text-gray-600">{booking.venue?.name}</p>
                <p className="text-sm text-gray-500">
                  {booking.venue?.address?.street}, {booking.venue?.address?.city}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Court Details</h3>
                <p className="text-gray-600">{booking.court?.name}</p>
                <p className="text-sm text-gray-500">
                  Sport: {booking.court?.sportType}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Schedule</h3>
                <p className="text-gray-600">
                  {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
                </p>
              </div>

              {booking.specialRequests && (
                <div>
                  <h3 className="font-semibold text-gray-700">Special Requests</h3>
                  <p className="text-gray-600">{booking.specialRequests}</p>
                </div>
              )}

              {booking.equipment && booking.equipment.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700">Equipment</h3>
                  <ul className="text-sm text-gray-600">
                    {booking.equipment.map((item, index) => (
                      <li key={index}>
                        {item.name} x {item.quantity} - ₹{item.price}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Booking Status */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Booking Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'payment_pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-600 mr-3">🔒</div>
            <div>
              <h3 className="font-semibold text-blue-900">Secure Payment</h3>
              <p className="text-blue-700 text-sm mt-1">
                Your payment information is protected with bank-level security. 
                We use Razorpay's secure payment gateway to process all transactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
