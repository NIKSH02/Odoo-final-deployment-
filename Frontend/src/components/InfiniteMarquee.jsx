import React from 'react';
import MarqueeItem from './MarqueeItem';

const images = [
  { src: '/images/badminton.jpg', title: 'Badminton Courts' },
  { src: '/images/tabletennis.jpg', title: 'Tennis Facilities' },
  
  { src: '/images/football.jpg', title: 'Football ' },
  { src: '/images/cricket.jpg', title: 'Cricket ' },

  { src: '/images/volleyball.jpg', title: 'Volleyball Courts' },
 

];

const InfiniteMarquee = () => {
  return (
    <div className="w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full">
        {/* Marquee Container with Enhanced Design */}
        <div className="w-screen relative h-[24rem] sm:h-[30rem] lg:h-[36rem] overflow-hidden bg-white/95 backdrop-blur-sm shadow-xl border border-gray-100">
          {/* Decorative Elements to match HeroSection */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full opacity-20 animate-pulse transform rotate-45"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full opacity-15 animate-pulse"></div>
          <div className="absolute top-1/2 left-5 w-16 h-16 bg-gradient-to-br from-black to-gray-700 rounded-full opacity-10 animate-ping"></div>
          
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent tracking-tight pt-4">
            Sports Venues Gallery
          </h2>
          
          <div className="flex absolute left-0 top-20 sm:top-16 lg:top-20 h-full items-center">
            <div className="marquee-animation flex">
              {/* First set of items */}
              {images.map((item, index) => (
                <MarqueeItem 
                  key={`first-${item.src}-${index}`} 
                  image={item.src} 
                  title={item.title}
                  isLast={false}
                />
              ))}
              {/* Duplicate set for seamless loop */}
              {images.map((item, index) => (
                <MarqueeItem 
                  key={`second-${item.src}-${index}`} 
                  image={item.src} 
                  title={item.title}
                  isLast={index === images.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Subtitle */}
        <div className="text-center py-6 bg-gradient-to-r from-gray-50 to-white">
          <p className="text-lg text-gray-600 font-medium">Discover Amazing Sports Facilities Near You</p>
        </div>
      </div>

      {/* Modern CSS Animation with enhanced effects */}
      <style>{`
        .marquee-animation {
          animation: marquee 45s linear infinite;
          width: calc(${images.length * 20}rem * 2);
          transition: transform 0.3s ease;
        }
        /* Smooth pause effect when hovering */
        .marquee-animation:hover {
          animation-play-state: paused;
          transform: scale(1.02);
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        /* Responsive animations for different screen sizes */
        @media (max-width: 640px) {
          .marquee-animation {
            animation-duration: 35s;
          }
        }
        @media (min-width: 1024px) {
          .marquee-animation {
            animation-duration: 55s;
          }
        }
        /* Enhanced touch device optimization */
        @media (hover: none) and (pointer: coarse) {
          .marquee-animation:hover {
            animation-play-state: running;
            transform: none;
          }
        }
        /* Smooth entrance animation */
        .marquee-animation {
          opacity: 0;
          animation: marquee 45s linear infinite, fadeIn 0.8s ease-in forwards;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default InfiniteMarquee;