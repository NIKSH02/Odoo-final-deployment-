//group msg 

import mongoose from 'mongoose';
const groupMessageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  location: {
    type: String,
    required: true,
    index: true // Index for faster location-based queries
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for efficient location-based message retrieval
groupMessageSchema.index({ location: 1, timestamp: -1 });

export default mongoose.model('GroupMessage', groupMessageSchema);