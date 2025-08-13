import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const LogoutButton = ({ 
  variant = 'default', 
  showUserInfo = true, 
  className = '' 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleLogout}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors ${className}`}
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showUserInfo && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="hidden sm:block">
            <div className="font-medium text-gray-900">
              {user?.fullName || 'User'}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {user?.role?.replace('_', ' ') || 'Role'}
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
};

export default LogoutButton;
