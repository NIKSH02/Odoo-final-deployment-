import React from 'react';
import { Settings } from 'lucide-react';

const ChatHeader = ({ 
  currentUser, 
  activeUsers, 
  isConnected, 
  onChangeLocation 
}) => {
  return (
    <header className="relative z-10 backdrop-blur-md bg-white/80 shadow-lg border-b border-white/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Enhanced location avatar */}
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-[#7968ed] to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-200">
              <span className="text-white font-bold text-lg drop-shadow-sm">
                {currentUser?.locationDisplay?.charAt(0)?.toUpperCase() || 'L'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl text-gray-800 mb-1">
                {currentUser?.locationDisplay || 'Loading...'}
              </h1>
              <button 
                onClick={onChangeLocation}
                className="p-1 text-gray-500 hover:text-[#7968ed] transition-colors rounded-full hover:bg-purple-50"
                title="Change location"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <p className="text-sm text-gray-600 font-medium">
                {activeUsers} active users
              </p>
              {!isConnected && (
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                  Disconnected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced connection status */}
        <div className="flex items-center space-x-3">
          <div className={`relative w-4 h-4 rounded-full transition-all duration-300 ${
            isConnected ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
          }`}>
            {isConnected && (
              <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
            )}
          </div>
          <span className={`text-sm font-semibold transition-colors duration-300 ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
