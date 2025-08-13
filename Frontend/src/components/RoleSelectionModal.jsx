import React, { useState } from 'react';
import { updateUserRoleService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

const RoleSelectionModal = ({ isOpen, user, onComplete }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError, showLoading, dismissToast } = useToast();
  const { fetchUserDetails } = useAuth();

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      showError('Please select a role to continue.');
      return;
    }

    setIsLoading(true);
    const loadingToast = showLoading('Setting up your account...');

    try {
      await updateUserRoleService({ role: selectedRole });
      await fetchUserDetails(); // Refresh user data
      dismissToast(loadingToast);
      showSuccess('Account setup completed!');
      onComplete();
    } catch (err) {
      dismissToast(loadingToast);
      showError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-6 pt-6 pb-6 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2">
              Complete Your Profile
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Welcome, {user?.fullName}! Please select your role to continue using QuickCourt.
            </p>
          </div>

          <div className="space-y-4">
            <div 
              onClick={() => setSelectedRole('player')}
              className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                selectedRole === 'player' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedRole === 'player' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedRole === 'player' && (
                      <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    🏃‍♂️ Player
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Book and play at sports facilities
                  </div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setSelectedRole('facility_owner')}
              className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                selectedRole === 'facility_owner' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedRole === 'facility_owner' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedRole === 'facility_owner' && (
                      <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    🏢 Facility Owner
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Manage and rent out sports facilities
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleRoleSelection}
              disabled={!selectedRole || isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
            >
              {isLoading ? 'Setting up...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
