import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 relative group`}>
      {/* Message container */}
      <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-102 relative ${
        isOwn 
          ? 'bg-gradient-to-br from-[#7968ed] to-purple-600 text-white shadow-purple-200/60 hover:shadow-purple-300/70' 
          : 'bg-white/80 text-gray-800 border-gray-200/50 shadow-lg hover:shadow-xl hover:bg-white/90'
      }`}>
        {!isOwn && (
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#7968ed] to-purple-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs font-bold text-white">
                {message.senderName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="text-xs font-semibold text-[#7968ed]">
              {message.senderName}
            </div>
          </div>
        )}
        <div className="break-words leading-relaxed">{message.message}</div>
        <div className={`text-xs mt-2 opacity-70 ${
          isOwn ? 'text-purple-100' : 'text-gray-500'
        }`}>
          {formatTime(message.timestamp)}
        </div>
      </div>

      {/* Message tail */}
      <div className={`absolute top-4 w-0 h-0 ${
        isOwn 
          ? 'right-0 translate-x-1 border-l-8 border-l-[#7968ed] border-t-8 border-t-transparent border-b-8 border-b-transparent' 
          : 'left-0 -translate-x-1 border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent'
      }`}></div>
    </div>
  );
};

export default MessageBubble;
