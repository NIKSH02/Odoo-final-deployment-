import React, { useState } from 'react';
import { 
  createPaymentOrderService, 
  initializeRazorpayPayment,
  handlePaymentFailureService,
  retryPaymentService 
} from '../services/paymentService';
import { useToast } from '../context/ToastContext';

const PaymentComponent = ({ 
  booking, 
  onPaymentSuccess, 
  onPaymentFailure, 
  isRetry = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const { showSuccess, showError } = useToast();

  const handlePayment = async () => {
    if (!booking || !booking._id) {
      showError('Invalid booking data');
      return;
    }

    setLoading(true);
    setPaymentStarted(true);

    try {
      // Create payment order
      const orderResponse = isRetry 
        ? await retryPaymentService(booking._id)
        : await createPaymentOrderService(booking._id);

      const orderData = orderResponse.data.data;

      // Initialize Razorpay payment
      await initializeRazorpayPayment(
        orderData,
        // Success callback
        async (paymentResult) => {
          setLoading(false);
          showSuccess('Payment successful! Your booking is confirmed.');
          onPaymentSuccess && onPaymentSuccess(paymentResult);
        },
        // Failure callback
        async (error) => {
          setLoading(false);
          setPaymentStarted(false);
          
          try {
            // Record payment failure on backend
            await handlePaymentFailureService(booking._id, error);
          } catch (recordError) {
            console.error('Failed to record payment failure:', recordError);
          }

          const errorMessage = error.description || 'Payment failed. Please try again.';
          showError(errorMessage);
          onPaymentFailure && onPaymentFailure(error);
        }
      );
    } catch (error) {
      setLoading(false);
      setPaymentStarted(false);
      console.error('Payment initialization failed:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to initialize payment';
      showError(errorMessage);
      onPaymentFailure && onPaymentFailure(error);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!booking) {
    return (
      <div className="text-center text-gray-500">
        No booking data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isRetry ? 'Retry Payment' : 'Complete Payment'}
        </h2>
        <p className="text-gray-600">
          Secure payment powered by Razorpay
        </p>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Venue:</span>
            <span className="font-medium">{booking.venue?.name || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Court:</span>
            <span className="font-medium">{booking.court?.name || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{formatDate(booking.bookingDate)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">
              {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{booking.duration} hour(s)</span>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Pricing Breakdown</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Price:</span>
            <span>{formatAmount(booking.pricing?.basePrice || 0)}</span>
          </div>
          
          {booking.pricing?.equipmentRental > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Equipment Rental:</span>
              <span>{formatAmount(booking.pricing.equipmentRental)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes (18% GST):</span>
            <span>{formatAmount(booking.pricing?.taxes || 0)}</span>
          </div>
          
          {booking.pricing?.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-{formatAmount(booking.pricing.discount)}</span>
            </div>
          )}
          
          <hr className="my-2" />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Amount:</span>
            <span className="text-blue-600">
              {formatAmount(booking.pricing?.totalAmount || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Retry Information */}
      {isRetry && booking.paymentDetails?.retryCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-yellow-800 text-sm">
            <strong>Retry Attempt:</strong> {booking.paymentDetails.retryCount}/3
          </p>
          {booking.paymentDetails.retryCount >= 3 && (
            <p className="text-red-600 text-sm mt-1">
              Maximum retry attempts reached. Please contact support.
            </p>
          )}
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || paymentStarted || (booking.paymentDetails?.retryCount >= 3)}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          loading || paymentStarted || (booking.paymentDetails?.retryCount >= 3)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {loading || paymentStarted ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {paymentStarted ? 'Processing Payment...' : 'Initializing...'}
          </div>
        ) : (
          <>
            {isRetry ? 'Retry Payment' : 'Pay Now'} - {formatAmount(booking.pricing?.totalAmount || 0)}
          </>
        )}
      </button>

      {/* Security Info */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          🔒 Your payment is secured with 256-bit SSL encryption
        </p>
      </div>

      {/* Payment Status */}
      {booking.paymentStatus && (
        <div className="mt-4 text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            booking.paymentStatus === 'completed' 
              ? 'bg-green-100 text-green-800'
              : booking.paymentStatus === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            Payment {booking.paymentStatus}
          </span>
        </div>
      )}
    </div>
  );
};

export default PaymentComponent;
