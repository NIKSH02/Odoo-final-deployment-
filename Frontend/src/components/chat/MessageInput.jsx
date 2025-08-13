import React from 'react';

const MessageInput = ({ 
  newMessage, 
  onMessageChange, 
  onSendMessage, 
  isConnected 
}) => {
  return (
    <div className="relative z-10 backdrop-blur-md bg-white/90 border-t border-white/30 px-6 py-4 shadow-2xl">
      <form onSubmit={onSendMessage} className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={onMessageChange}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            disabled={!isConnected}
            className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-[#7968ed]/50 focus:border-[#7968ed]/50 transition-all duration-300 text-gray-800 placeholder-gray-500 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={1000}
          />
        </div>
        
        {/* Enhanced Send Button */}
        <button
          type="submit"
          disabled={!newMessage.trim() || !isConnected}
          className="group flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#7968ed] to-purple-600 hover:from-purple-600 hover:to-[#7968ed] rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        >
          <svg className="w-6 h-6 text-white transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>

      {/* Enhanced Connection Status */}
      {!isConnected && (
        <div className="flex items-center justify-center mt-3 animate-fade-in">
          <div className="backdrop-blur-sm bg-red-50/80 border border-red-200/50 rounded-full px-4 py-2 shadow-lg">
            <span className="text-sm text-red-600 flex items-center font-medium">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              Reconnecting to server...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
