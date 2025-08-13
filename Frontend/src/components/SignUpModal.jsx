import React, { useState, useEffect, useRef } from 'react';
import { sendOtpService, verifyOtpService, signupService } from '../services/authService';

const SignUpModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const otpTimerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      setIsEmailVerified(false);
      setShowOtpSection(false);
      setOtpTimer(0);
      setCanResendOtp(false);
      setMessage('');
      setMessageType('');
      clearTimeout(otpTimerRef.current);
    }
  }, [isOpen]);

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

  const validateForm = () => {
    if (!fullName || !username || !email || !password || !confirmPassword) {
      setMessage('Please fill in all fields.');
      setMessageType('error');
      return false;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return false;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setMessageType('error');
      return false;
    }
    setMessage('');
    setMessageType('');
    return true;
  };

  const handleVerifyEmail = async () => {
    if (!email) {
      setMessage('Please enter your email to verify.');
      setMessageType('error');
      return;
    }
    setMessage('Sending OTP to your email...');
    setMessageType('success');
    try {
      await sendOtpService({ email });
      setShowOtpSection(true);
      setOtpTimer(60);
      setCanResendOtp(false);
      setMessage('OTP sent to your email. Please check your inbox.');
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send OTP.');
      setMessageType('error');
    }
  };

  const handleResendOtp = async () => {
    setMessage('Resending OTP...');
    setMessageType('success');
    setOtpTimer(60);
    setCanResendOtp(false);
    try {
      await sendOtpService({ email });
      setMessage('OTP resent. Please check your inbox.');
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to resend OTP.');
      setMessageType('error');
    }
  };


  // Signup is now completed after OTP verification
  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }
    if (!showOtpSection && !isEmailVerified) {
      setMessage('Please verify your email with OTP first.');
      setMessageType('error');
      return;
    }
    try {
      await signupService({ email, fullName, username, password });
      setIsEmailVerified(true);
      setMessage('Signup successful! You can now log in.');
      setMessageType('success');
      setTimeout(() => {
        onClose();
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err.response?.data || err);
      setMessage(err.response?.data?.message || 'Signup failed.');
      setMessageType('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="relative max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transform scale-100 opacity-100 transition-all duration-300 ease-in-out">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Join our platform to unlock powerful features.
          </p>
        </div>
        {message && (
          <div className={`p-3 rounded-md text-sm ${messageType === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'}`}>
            {message}
          </div>
        )}
        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="full-name" className="sr-only">Full Name</label>
            <input
              id="full-name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex">
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-l-lg shadow-sm placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm flex-grow"
              placeholder="Email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setIsEmailVerified(false); setShowOtpSection(false); setOtp(''); setMessage(''); }}
            />
            <button
              type="button"
              onClick={handleVerifyEmail}
              disabled={!email || isEmailVerified || showOtpSection}
              className={`ml-2 px-4 py-2 rounded-r-lg font-medium text-sm transition-colors duration-200 ${
                (!email || isEmailVerified || showOtpSection)
                  ? 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600'
              }`}
            >
              {isEmailVerified ? 'Verified' : 'Verify'}
            </button>
          </div>
          {showOtpSection && (
            <div>
              <label htmlFor="otp" className="sr-only">OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength="6"
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Time remaining: {otpTimer}s</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResendOtp}
                  className={`font-medium ${canResendOtp ? 'text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300' : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'}`}
                >
                  Resend OTP
                </button>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (otp.length !== 6) {
                    setMessage('Please enter a 6-digit OTP.');
                    setMessageType('error');
                    return;
                  }
                  try {
                    await verifyOtpService({ email, otp });
                    setIsEmailVerified(true);
                    setShowOtpSection(false);
                    setMessage('Email verified successfully! You can now complete signup.');
                    setMessageType('success');
                    clearTimeout(otpTimerRef.current);
                    setOtpTimer(0);
                  } catch (err) {
                    setMessage(err.response?.data?.message || 'Invalid OTP. Please try again.');
                    setMessageType('error');
                  }
                }}
                disabled={otp.length !== 6 || isEmailVerified}
                className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
                  (otp.length !== 6 || isEmailVerified)
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
                }`}
              >
                Verify OTP
              </button>
            </div>
          )}
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              onClick={handleSignUp}
              disabled={!fullName || !username || !email || !password || !confirmPassword || !isEmailVerified}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white mt-6 ${
                (!fullName || !username || !email || !password || !confirmPassword || !isEmailVerified)
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
              }`}
            >
              Sign Up
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button onClick={() => { onClose(); onSwitchToLogin(); }} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
