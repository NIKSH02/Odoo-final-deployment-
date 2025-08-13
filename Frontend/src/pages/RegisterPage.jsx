import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { signupService, googleAuthService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import ImageUpload from '../components/ImageUpload';
import PasswordValidation from '../components/PasswordValidation';
import { validatePassword } from '../utils/passwordValidator';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('player');
  const [profileImage, setProfileImage] = useState(null);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const validateForm = () => {
    if (!fullName || !username || !email || !password || !confirmPassword) {
      showError('Please fill in all fields.');
      return false;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return false;
    }
    
    // Use the password validator
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      showError(passwordValidation.errors.join('. '));
      return false;
    }
    
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }
    
    const loadingToast = showLoading('Creating your account...');
    
    try {
      const signupData = { 
        email, 
        fullName, 
        username, 
        password, 
        role 
      };
      
      // Add profile image if selected
      if (profileImage) {
        signupData.profileImage = profileImage;
      }
      
      await signupService(signupData);
      dismissToast(loadingToast);
      showSuccess('Account created! Please verify your email.');
      
      // Redirect to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          email: email,
          purpose: 'signup'
        } 
      });
    } catch (err) {
      dismissToast(loadingToast);
      if (err.response?.data?.data?.exists) {
        showError('Email already registered. Please sign in instead.');
      } else {
        showError(err.response?.data?.message || 'Registration failed.');
      }
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    const loadingToast = showLoading('Creating account with Google...');
    
    try {
      // Send the Google credential to your backend
      const response = await googleAuthService(credentialResponse.credential);
      
      dismissToast(loadingToast);
      
      if (response.data && response.data.data) {
        const { token, user } = response.data.data;
        
        const loginSuccess = await login(token, user);
        if (loginSuccess) {
          showSuccess('Google sign-up successful! Redirecting...');
          setTimeout(() => {
            navigate('/');
          }, 300);
        } else {
          showError('Google sign-up failed. Please try again.');
        }
      } else {
        showError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      dismissToast(loadingToast);
      console.error('Google signup error:', err);
      showError(err.response?.data?.message || 'Google sign-up failed. Please try again.');
    }
  };

  const handleGoogleSignupError = () => {
    showError('Google sign-up was cancelled or failed.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex">
      {/* Desktop Layout - 40/60 Split */}
      <div className="hidden lg:flex lg:w-2/5 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-black opacity-95"></div>
        <img
          src="/authpage.jpg"
          alt="QuickCourt Authentication"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Join QuickCourt Today
          </h1>
          <p className="text-xl text-gray-200">
            Create your account to book sports facilities and connect with the sports community.
          </p>
        </div>
      </div>

      {/* Main Content Area - Mobile optimized */}
      <div className="flex-1 lg:w-3/5 min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md lg:max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                QuickCourt
              </h1>
            </Link>
          </div>
          
          {/* Desktop Logo */}
          <Link to="/" className="hidden lg:flex justify-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
              QuickCourt
            </h1>
          </Link>
          
          {/* Title and subtitle */}
          <div className="text-center mb-6">
            <h2 className="text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent mb-2">
              Create Your Account
            </h2>
            <p className="text-sm text-gray-600">
              Or{' '}
              <Link
                to="/login"
                className="font-medium text-black hover:text-gray-700 transition-colors duration-200"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-10 shadow-xl border border-gray-200 sm:rounded-xl">
            <form className="space-y-4 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-white text-gray-900 transition-colors duration-200"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-white text-gray-900 transition-colors duration-200"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-white text-gray-900 transition-colors duration-200"
                >
                  <option value="player">Player</option>
                  <option value="facility_owner">Facility Owner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture (Optional)
              </label>
              <div className="mt-1">
                <ImageUpload
                  onImageSelect={setProfileImage}
                  existingImage={null}
                  disabled={false}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-white text-gray-900 transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowPasswordValidation(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowPasswordValidation(password.length > 0)}
                  onBlur={() => setShowPasswordValidation(false)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-white text-gray-900 transition-colors duration-200"
                  placeholder="Enter your password"
                />
              </div>
              <PasswordValidation 
                password={password} 
                show={showPasswordValidation} 
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-white text-gray-900 transition-colors duration-200"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleSignUp}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-black via-gray-800 to-black hover:from-gray-900 hover:via-gray-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Create Account
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign-Up Button */}
          <div className="mt-6">
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={handleGoogleSignupError}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                logo_alignment="left"
                useOneTap={false}
              />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
