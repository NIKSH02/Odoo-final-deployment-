import React from 'react';

const LoadingScreen = ({ message = "Loading chat..." }) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-indigo-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-300/30 to-pink-200/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-violet-100/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-indigo-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>
      
      <div className="relative z-10 text-center backdrop-blur-sm bg-white/30 p-12 rounded-3xl border border-white/30 shadow-2xl">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-[#7968ed] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-300 rounded-full animate-spin animate-reverse delay-150"></div>
        </div>
        <p className="text-gray-700 font-semibold text-xl mb-4">{message}</p>
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-[#7968ed] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#7968ed] rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-[#7968ed] rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
