import jwt from 'jsonwebtoken';

// Generate JWT Access Token (short-lived)
export function generateAccessToken(user) {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      role: user.role, // Include role in token
      username: user.username
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '60m' }
  );
}

// Generate JWT Refresh Token (long-lived)
export function generateRefreshToken(user) {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      role: user.role // Include role in refresh token too
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// Set Auth Cookies (access & refresh tokens)
export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

// Clear Auth Cookies
export function clearAuthCookies(res) {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
}