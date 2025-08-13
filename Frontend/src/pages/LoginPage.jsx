import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { signinService, sendOtpService, loginWithOtpService, googleAuthService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { getDashboardRoute, getLoginSuccessMessage } from '../utils/roleRedirects';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();
  
  const [loginMethod, setLoginMethod] = useState('password');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);

  const otpTimerRef = useRef(null);

  useEffect(() => {
    if (otpTimer > 0) {
      otpTimerRef.current = setTimeout(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && showOtpSection) {
      setCanResendOtp(true);
    }
    return () => clearTimeout(otpTimerRef.current);
  }, [otpTimer, showOtpSection]);

  const handleLoginWithPassword = async () => {
    if (!usernameOrEmail || !password) {
      showError('Please enter username/email and password.');
      return;
    }
    
    const loadingToast = showLoading('Logging in...');
    
    try {
      const response = await signinService({ usernameOrEmail, password });
      
      // Extract token and user data from response
      let token, user;
      
      if (response.data && response.data.data) {
        // Check different possible response formats
        token = response.data.data.token || response.data.data.accessToken || response.data.data.authToken;
        user = response.data.data.user || response.data.data.userData;
      }
      
      dismissToast(loadingToast);
      
      if (token && user) {
        const loginSuccess = await login(token, user);
        if (loginSuccess) {
          const redirectRoute = getDashboardRoute(user.role);
          const successMessage = getLoginSuccessMessage(user.role);
          showSuccess(successMessage);
          setTimeout(() => {
            navigate(redirectRoute);
          }, 300);
        } else {
          showError('Login failed. Please try again.');
        }
      } else {
        showError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      dismissToast(loadingToast);
      
      // Check if user needs email verification
      if (err.response?.status === 400 && (
        err.response?.data?.data?.needsVerification || 
        err.response?.data?.message?.includes('verify') ||
        err.response?.data?.message?.includes('OTP sent')
      )) {
        showError('Please verify your email first.');
        // Redirect to OTP verification page
        const emailToUse = err.response?.data?.data?.email || 
                          (usernameOrEmail.includes('@') ? usernameOrEmail : email);
        
        navigate('/verify-otp', { 
          state: { 
            email: emailToUse,
            purpose: 'signup'
          } 
        });
        return;
      }
      
      showError(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleSendOtpLogin = async () => {
    if (!email) {
      showError('Please enter your email.');
      return;
    }
    
    const loadingToast = showLoading('Sending OTP to your email...');
    
    try {
      await sendOtpService({ email, purpose: 'login' });
      dismissToast(loadingToast);
      setShowOtpSection(true);
      setOtpTimer(60);
      setCanResendOtp(false);
      showSuccess('OTP sent to your email. Please check your inbox.');
    } catch (err) {
      dismissToast(loadingToast);
      const backendMsg = err.response?.data?.message || 'Failed to send OTP.';
      console.error('OTP Login Error:', backendMsg, err);
      
      if (
        backendMsg.includes('not registered') ||
        backendMsg.includes('not verified')
      ) {
        showError(
          backendMsg + ' If you are a new user, please sign up first.'
        );
      } else {
        showError(backendMsg);
      }
    }
  };

  const handleResendOtpLogin = async () => {
    const loadingToast = showLoading('Resending OTP...');
    setOtpTimer(60);
    setCanResendOtp(false);
    
    try {
      await sendOtpService({ email, purpose: 'login' });
      dismissToast(loadingToast);
      showSuccess('OTP resent. Please check your inbox.');
    } catch (err) {
      dismissToast(loadingToast);
      showError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

    const handleLoginWithOtp = async () => {
    if (!email || !otp) {
      showError('Please enter email and OTP.');
      return;
    }
    
    const loadingToast = showLoading('Verifying OTP and logging in...');
    
    try {
      const response = await loginWithOtpService({ email, otp });
      
      // Extract token and user data from response
      let token, user;
      
      if (response.data && response.data.data) {
        // Check different possible response formats
        token = response.data.data.token || response.data.data.accessToken || response.data.data.authToken;
        user = response.data.data.user || response.data.data.userData;
      }
      
      dismissToast(loadingToast);
      
      if (token && user) {
        const loginSuccess = await login(token, user);
        if (loginSuccess) {
          const redirectRoute = getDashboardRoute(user.role);
          const successMessage = getLoginSuccessMessage(user.role);
          showSuccess(successMessage);
          setTimeout(() => {
            navigate(redirectRoute);
          }, 300);
        } else {
          showError('Login failed. Please try again.');
        }
      } else {
        showError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      dismissToast(loadingToast);
      showError(err.response?.data?.message || 'Invalid OTP or login failed.');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const loadingToast = showLoading('Signing in with Google...');
    
    try {
      // Send the Google credential to your backend
      const response = await googleAuthService(credentialResponse.credential);
      
      dismissToast(loadingToast);
      
      if (response.data && response.data.data) {
        const { token, user } = response.data.data;
        
        const loginSuccess = await login(token, user);
        if (loginSuccess) {
          const redirectRoute = getDashboardRoute(user.role);
          const successMessage = getLoginSuccessMessage(user.role);
          showSuccess(successMessage);
          setTimeout(() => {
            navigate(redirectRoute);
          }, 300);
        } else {
          showError('Google sign-in failed. Please try again.');
        }
      } else {
        showError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      dismissToast(loadingToast);
      console.error('Google login error:', err);
      showError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleGoogleLoginError = () => {
    showError('Google sign-in was cancelled or failed.');
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
            Welcome back to QuickCourt
          </h1>
          <p className="text-xl text-gray-200">
            Sign in to access your sports facility bookings and manage your sports experience.
          </p>
        </div>
      </div>

      {/* Main Content Area - 60% on desktop, full width on mobile */}
      <div className="flex-1 lg:w-3/5 flex flex-col justify-center py-4 px-4 sm:px-6 lg:px-20 min-h-0">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                QuickCourt
              </h1>
            </Link>
          </div>
          
          <Link to="/" className="hidden lg:flex justify-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
              QuickCourt
            </h1>
          </Link>
          
          <h2 className="text-center text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-black hover:text-gray-700 transition-colors duration-200"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-4 lg:mt-8 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
          <div className="bg-white py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-10 shadow-xl border border-gray-200 sm:rounded-xl">
            {/* Login Method Toggle */}
            <div className="flex mb-4 sm:mb-6">
              <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setShowOtpSection(false);
                setOtp('');
                setOtpTimer(0);
                setCanResendOtp(false);
              }}
              className={`flex-1 py-2 px-4 text-center text-sm font-medium rounded-l-md border transition-all duration-200 ${
                loginMethod === 'password'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp');
                setPassword('');
              }}
              className={`flex-1 py-2 px-4 text-center text-sm font-medium rounded-r-md border border-l-0 transition-all duration-200 ${
                loginMethod === 'otp'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              OTP
            </button>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {loginMethod === 'password' ? (
              <>
                <div>
                  <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700">
                    Username or Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="usernameOrEmail"
                      name="usernameOrEmail"
                      type="text"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-white text-gray-900 transition-colors duration-200"
                      placeholder="Enter your username or email"
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
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-white text-gray-900 transition-colors duration-200"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="mt-2 text-right">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-black hover:text-gray-700 transition-colors duration-200"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleLoginWithPassword}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sign In
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="mt-1 flex">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter your email"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtpLogin}
                      disabled={!email || showOtpSection}
                      className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {showOtpSection ? 'Sent' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {showOtpSection && (
                  <>
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        OTP Code
                      </label>
                      <div className="mt-1">
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter 6-digit OTP"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        {otpTimer > 0 ? (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Resend OTP in {otpTimer} seconds
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtpLogin}
                            disabled={!canResendOtp}
                            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={handleLoginWithOtp}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Sign In with OTP
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <div className="mt-6">
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleLoginError}
                theme="outline"
                size="large"
                text="signin_with"
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

export default LoginPage;