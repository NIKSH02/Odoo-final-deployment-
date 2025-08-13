import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOtpService, sendOtpService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();
  
  // Get email and purpose from navigation state
  const email = location.state?.email;
  const purpose = location.state?.purpose || 'signup'; // 'signup' or 'login'
  
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60); // 60 seconds timer
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const otpTimerRef = useRef(null);

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate(purpose === 'login' ? '/login' : '/register');
      return;
    }

    // Start timer
    startOtpTimer();
    
    return () => {
      if (otpTimerRef.current) {
        clearInterval(otpTimerRef.current);
      }
    };
  }, [email, navigate, purpose]);

  const startOtpTimer = () => {
    setOtpTimer(60);
    setCanResendOtp(false);
    
    otpTimerRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          setCanResendOtp(true);
          clearInterval(otpTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showError('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsVerifying(true);
    const loadingToast = showLoading('Verifying OTP...');

    try {
      const response = await verifyOtpService({ email, otp });
      
      dismissToast(loadingToast);
      showSuccess('OTP verified successfully!');
      
      if (purpose === 'login') {
        // For login, set the user in auth context and redirect to venues page
        login(response.data.data);
        navigate('/venues');
      } else {
        // For signup, redirect to login page
        showSuccess('Registration completed! Please login with your credentials.');
        navigate('/login');
      }
    } catch (err) {
      dismissToast(loadingToast);
      showError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    const loadingToast = showLoading('Resending OTP...');
    
    try {
      await sendOtpService({ email, purpose });
      dismissToast(loadingToast);
      showSuccess('OTP sent to your email.');
      startOtpTimer();
    } catch (err) {
      dismissToast(loadingToast);
      showError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const handleGoBack = () => {
    navigate(purpose === 'login' ? '/login' : '/register');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              QuickCourt
            </h1>
          </Link>
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-xl lg:text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
            Verify Your Email
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {email}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-6 lg:py-8 px-4 shadow sm:rounded-lg sm:px-6 lg:px-10">
          <div className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter 6-digit OTP
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                {canResendOtp ? (
                  <button
                    onClick={handleResendOtp}
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    Resend OTP in {formatTime(otpTimer)}
                  </span>
                )}
              </div>
              <div className="text-sm">
                <button
                  onClick={handleGoBack}
                  className="font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Go back
                </button>
              </div>
            </div>

            <div>
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying || otp.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
