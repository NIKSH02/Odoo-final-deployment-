import api from '../api/axiosInstance';

// Check if email exists and its verification status
export const checkEmailService = async (email) => {
  return api.post('/auth/check-email', { email });
};

// Verify OTP with only email and otp
export const verifyOtpService = async (data) => {
  return api.post('/auth/verify-otp', data);
};


// Usage: Call sendOtpService({ email }) first, then signupService({ fullName, username, email, password, role, profileImage })
export const signupService = async (data) => {
  if (data.profileImage) {
    // Create FormData for file upload
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'profileImage') {
        formData.append('profilePicture', data[key]); // Backend expects 'profilePicture'
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/auth/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } else {
    return api.post('/auth/signup', data);
  }
};

export const signinService = async (data) => {
  return api.post('/auth/signin', data);
};

export const sendOtpService = async (data) => {
  return api.post('/auth/send-otp', data);
};

export const loginWithOtpService = async (data) => {
  return api.post('/auth/login-otp', data);
};

export const logoutService = async (data) => {
  return api.post('/auth/logout', data);
};

export const forgotPasswordService = async (email) => {
  return api.post('/auth/forgot-password', { email });
};

export const resetPasswordService = async (token, newPassword) => {
  return api.post('/auth/reset-password', { token, newPassword });
};

export const googleAuthService = async (credential) => {
  return api.post('/auth/google-auth', { credential });
};

export const refreshTokenService = async () => {
  return api.post('/auth/refresh-token');
};
