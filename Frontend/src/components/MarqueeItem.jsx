// src/components/MarqueeItem.jsx
import React from 'react';

const MarqueeItem = ({ image, title, isLast, className = '' }) => {
  return (
    <div
      style={{ background: "rgb(229, 231, 235)" }}
      className={`flex-shrink-0 w-64 xs:w-72 sm:w-80 md:w-84 lg:w-88 xl:w-96 h-64 xs:h-72 sm:h-80 md:h-84 lg:h-88 xl:h-96 flex flex-col items-start justify-start px-2 xs:px-3 sm:px-4 pb-2 xs:pb-3 sm:pb-4 md:pb-5 lg:pb-6 relative ${!isLast ? 'border-r border-gray-500' : ''} transition-all duration-500 group ${className}`}
    >
      
      {/* Right Border Glow Effect */}
      {!isLast && (
        <div className="absolute right-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-60 shadow-lg shadow-gray-400/30 group-hover:opacity-100 group-hover:shadow-gray-400/50 transition-all duration-300"></div>
      )}
      
      <div className="w-56 xs:w-64 sm:w-72 md:w-76 lg:w-80 xl:w-[22rem] h-56 xs:h-64 sm:h-72 md:h-76 lg:h-80 xl:h-88 overflow-hidden flex items-start justify-start bg-gray-200/50 backdrop-blur-sm shadow-2xl group-hover:shadow-gray-500/20 transition-all duration-500 mb-2 xs:mb-3 sm:mb-4">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          style={{ aspectRatio: '1 / 1' }}
        />
      </div>
      <p className="text-black text-sm xs:text-base sm:text-lg md:text-xl font-semibold text-left group-hover:text-gray-800 transition-all duration-300 px-2">
        {title}
      </p>
    </div>
  );
};

export default MarqueeItem;