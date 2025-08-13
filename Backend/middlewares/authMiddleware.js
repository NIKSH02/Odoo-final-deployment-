import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Try to get token from cookies first
  token = req.cookies.accessToken;
  
  // If no cookie token, try Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    throw new ApiError(401, 'Not authorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Fetch the user from database to get current role and other details
    const user = await User.findById(decoded.id).select('-password -refreshToken -otp -otpExpiry');
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }
    
    // Attach full user object to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    } else if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError(401, 'Not authorized, token failed');
    }
  }
});
