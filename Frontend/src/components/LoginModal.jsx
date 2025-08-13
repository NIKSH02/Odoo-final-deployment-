import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  Play, 
  ChevronRight,
  Star,
  Trophy,
  Target,
  Zap
} from 'lucide-react';

const QuickCourtHero = () => {
  const [location, setLocation] = useState('Ahmedabad');
  const [isAnimating, setIsAnimating] = useState(false);
  const heroRef = useRef(null);

  // Floating animation for sport icons
  const floatingElements = [
    { name: 'Teeming Butterfly', color: 'bg-orange-100 text-orange-600', position: 'top-20 right-20' },
    { name: 'Ambani', color: 'bg-green-100 text-green-600', position: 'top-32 left-32' },
    { name: 'Violet Antelope', color: 'bg-purple-100 text-purple-600', position: 'top-16 left-16' },
    { name: 'Glittering Bee', color: 'bg-pink-100 text-pink-600', position: 'top-40 right-32' },
    { name: 'True Mallard', color: 'bg-blue-100 text-blue-600', position: 'top-60 left-40' },
    { name: 'Stimulating Rook', color: 'bg-yellow-100 text-yellow-600', position: 'top-52 left-20' },
    { name: 'Victorious Crab', color: 'bg-lime-100 text-lime-600', position: 'top-72 right-40' }
  ];

  const sportIcons = [
    { icon: '🏸', name: 'Badminton', delay: 0 },
    { icon: '⚽', name: 'Football', delay: 0.2 },
    { icon: '🏀', name: 'Basketball', delay: 0.4 },
    { icon: '🏐', name: 'Volleyball', delay: 0.6 },
    { icon: '🏓', name: 'Table Tennis', delay: 0.8 },
    { icon: '🎾', name: 'Tennis', delay: 1.0 }
  ];

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Geometric shapes with 3D effect */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full opacity-20 animate-pulse transform rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg opacity-15 animate-bounce transform rotate-12"></div>
        <div className="absolute top-1/2 left-5 w-24 h-24 bg-gradient-to-br from-black to-gray-700 rounded-full opacity-10 animate-ping"></div>
        
        {/* Floating sport elements */}
        {floatingElements.map((element, index) => (
          <div
            key={index}
            className={`absolute ${element.position} animate-bounce`}
            style={{ 
              animationDelay: `${index * 0.3}s`,
              animationDuration: '3s'
            }}
          >
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${element.color} transform hover:scale-110 transition-transform cursor-pointer shadow-lg`}>
              {element.name}
            </div>
          </div>
        ))}

        {/* 3D Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 grid-rows-8 h-full">
            {Array.from({ length: 96 }).map((_, i) => (
              <div key={i} className="border border-gray-400"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-700 rounded-lg flex items-center justify-center transform hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
            QUICKCOURT
          </h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-all shadow-lg">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Book</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg hover:shadow-xl transition-all transform hover:scale-105">
            <Users className="w-4 h-4" />
            <span>Login / Sign Up</span>
          </button>
        </div>
      </nav>

      {/* Main Hero Content */}
      <div className="relative z-40 container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            {/* Location Input */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 focus:border-transparent shadow-lg font-medium"
                  placeholder="Enter location"
                />
              </div>
              <button className="p-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Main Heading with 3D effect */}
            <div className="space-y-4">
              <h2 className={`text-6xl lg:text-7xl font-bold leading-tight transform transition-all duration-1000 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <span className="bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                  PLAYERS
                </span>
                <br />
                <span className="text-gray-600">&</span>
                <br />
                <span className="bg-gradient-to-r from-gray-700 to-black bg-clip-text text-transparent">
                  VENUES
                </span>
              </h2>
              
              <div className="text-gray-600 text-lg leading-relaxed max-w-md">
                Seamlessly explore sports venues and play with sports enthusiasts just like you!
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span className="font-semibold">Start Playing</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="flex items-center space-x-3 px-8 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all">
                <Target className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-800">Explore Venues</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">500+</div>
                <div className="text-gray-600 text-sm">Venues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">10K+</div>
                <div className="text-gray-600 text-sm">Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">50K+</div>
                <div className="text-gray-600 text-sm">Bookings</div>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Sports Visualization */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Main 3D Container */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-200 rounded-3xl shadow-2xl transform perspective-1000 rotateY-5 rotateX-2">
                
                {/* Sports Icons Grid */}
                <div className="absolute inset-8 grid grid-cols-3 grid-rows-2 gap-4">
                  {sportIcons.map((sport, index) => (
                    <div
                      key={index}
                      className={`group flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 cursor-pointer animate-fadeInUp`}
                      style={{ animationDelay: `${sport.delay}s` }}
                    >
                      <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">
                        {sport.icon}
                      </div>
                      <div className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
                        {sport.name}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Elements inside */}
                <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 right-6 w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
              </div>

              {/* Floating Action Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-xl animate-bounce">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-gray-800 to-black text-white rounded-full p-3 shadow-xl animate-pulse">
                <Zap className="w-6 h-6" />
              </div>
            </div>

            {/* Additional floating elements */}
            <div className="absolute top-16 -right-8 text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="text-sm font-bold text-gray-800">IMAGE</div>
                <div className="text-xs text-gray-500">In most cities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-auto">
          <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" className="fill-white/50"></path>
        </svg>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .rotateY-5 {
          transform: rotateY(5deg);
        }
        
        .rotateX-2 {
          transform: rotateX(2deg);
        }
      `}</style>
    </div>
  );
};

export default QuickCourtHero;