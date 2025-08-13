import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import PasswordValidation from '../components/PasswordValidation';
import { validatePassword } from '../utils/passwordValidator';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  useEffect(() => {
    if (!token) {
      showError('Invalid reset link. Please request a new password reset.');
      navigate('/forgot-password');
    }
  }, [token, navigate, showError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      showError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      showError(passwordValidation.errors.join('. '));
      return;
    }

    setIsLoading(true);
    const loadingToast = showLoading('Resetting password...');

    try {
      await resetPasswordService(token, password);
      dismissToast(loadingToast);
      showSuccess('Password reset successful! You can now login with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      dismissToast(loadingToast);
      if (err.response?.status === 400) {
        showError('Reset link has expired or is invalid. Please request a new one.');
        setTimeout(() => {
          navigate('/forgot-password');
        }, 2000);
      } else {
        showError(err.response?.data?.message || 'Failed to reset password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null; // Will redirect via useEffect
  }

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
            Reset Your Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-6 px-4 sm:py-8 sm:px-6 shadow rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter your new password"
                />
              </div>
              <PasswordValidation 
                password={password} 
                show={showPasswordValidation} 
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Confirm your new password"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
