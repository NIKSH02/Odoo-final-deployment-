import React from 'react';

const ErrorBanner = ({ error }) => {
  if (!error) return null;

  return (
    <div className="relative z-10 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 shadow-sm animate-slide-down">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">{error}</span>
      </div>
    </div>
  );
};

export default ErrorBanner;
