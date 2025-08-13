import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleTranslate from '../services/GoogleTranslate';
import { useAuth } from '../hooks/useAuth';
import { 
  HomeIcon, 
  InformationCircleIcon, 
  UserPlusIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
// --- Navbar Component ---

const Navbar = ({ onOpenSignUpModal, onOpenLoginModal }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSignUp = () => {
    if (onOpenSignUpModal) {
      onOpenSignUpModal();
    } else {
      navigate('/register');
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogin = () => {
    if (onOpenLoginModal) {
      onOpenLoginModal();
    } else {
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  };

  const handleProfile = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg transition-all duration-300 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
          >
            QUICKCOURT
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium group"
            >
              <HomeIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Home
            </Link>
            
            <Link 
              to="/about"
              onClick={() => {
                console.log('About link clicked');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium group"
            >
              <InformationCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              About
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* User Welcome */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {(user?.fullName || user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {user?.fullName || user?.username || user?.email}
                  </span>
                </div>

                {/* Profile Button */}
                <button 
                  onClick={handleProfile} 
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium group"
                >
                  <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Profile
                </button>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium group"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Sign Up Button */}
                <button 
                  onClick={handleSignUp} 
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium group"
                >
                  <UserPlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Sign Up
                </button>

                {/* Login Button */}
                <button 
                  onClick={handleLogin} 
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-gray-800 to-black text-white hover:from-black hover:to-gray-800 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  Login
                </button>
              </div>
            )}

            {/* Google Translate */}
            <div className="flex items-center">
              <GoogleTranslate />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition-all duration-300"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="space-y-2">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium"
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </Link>
              
              <Link 
                to="/about" 
                onClick={() => {
                  console.log('Mobile About link clicked');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium text-left"
              >
                <InformationCircleIcon className="w-5 h-5" />
                About
              </Link>

              {isAuthenticated ? (
                <>
                  {/* User Info Mobile */}
                  <div className="px-4 py-3 border-t border-gray-200 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-black rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(user?.fullName || user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {user?.fullName || user?.username || user?.email}
                        </p>
                        <p className="text-xs text-gray-500">Logged in</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Button Mobile */}
                  <button 
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium text-left"
                  >
                    <UserIcon className="w-5 h-5" />
                    Profile
                  </button>

                  {/* Logout Button Mobile */}
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 font-medium text-left"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Sign Up Mobile */}
                  <button 
                    onClick={handleSignUp}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-300 font-medium text-left"
                  >
                    <UserPlusIcon className="w-5 h-5" />
                    Sign Up
                  </button>

                  {/* Login Mobile */}
                  <button 
                    onClick={handleLogin}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg transition-all duration-300 font-medium text-left mx-4 mt-2"
                  >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    Login
                  </button>
                </>
              )}

              {/* Google Translate Mobile */}
              <div className="px-4 pt-2 border-t border-gray-200 mt-4">
                <GoogleTranslate />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;