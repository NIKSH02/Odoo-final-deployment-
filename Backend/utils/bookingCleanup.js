import cron from 'node-cron';
import Booking from '../models/booking.js';

// Cleanup expired payment pending bookings
const cleanupExpiredBookings = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await Booking.updateMany(
      {
        status: 'payment_pending',
        paymentStatus: 'pending',
        createdAt: { $lt: twentyFourHoursAgo }
      },
      {
        $set: {
          status: 'cancelled',
          paymentStatus: 'failed',
          'paymentDetails.failureReason': 'Payment timeout - booking expired after 24 hours'
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Cleaned up ${result.modifiedCount} expired bookings`);
    }
  } catch (error) {
    console.error('Error cleaning up expired bookings:', error);
  }
};

// Schedule cleanup every hour
const scheduleBookingCleanup = () => {
  // Run every hour
  cron.schedule('0 * * * *', cleanupExpiredBookings);
  
  // Also run on startup
  cleanupExpiredBookings();
  
  console.log('📅 Booking cleanup scheduler started');
};

export { scheduleBookingCleanup, cleanupExpiredBookings };
