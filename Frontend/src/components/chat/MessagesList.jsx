import React from 'react';
import MessageBubble from './MessageBubble';

const MessagesList = ({ 
  messages, 
  currentUser, 
  typingUsers, 
  messagesEndRef 
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2 relative z-10 scrollbar-thin scrollbar-thumb-purple-300/50 scrollbar-track-transparent">
      {messages.length === 0 ? (
        <div className="text-center mt-32 animate-fade-in">
          <div className="relative inline-block mb-8">
            <div className="text-8xl animate-bounce delay-300">💬</div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#7968ed]/20 to-purple-400/20 rounded-full blur-2xl transform scale-150"></div>
          </div>
          <p className="text-gray-600 text-xl font-medium mb-2">No messages yet</p>
          <p className="text-gray-500">Start the conversation and connect with others!</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-[#7968ed] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#7968ed] rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-[#7968ed] rounded-full animate-pulse delay-300"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <MessageBubble
                message={message}
                isOwn={message.senderId === currentUser?.userId}
              />
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-start space-x-3 animate-fade-in">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">
              {typingUsers[0].userName?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-200/50">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {typingUsers.length === 1 
                  ? `${typingUsers[0].userName} is typing...`
                  : `${typingUsers.length} people are typing...`
                }
              </span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
