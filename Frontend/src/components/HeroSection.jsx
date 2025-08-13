import React, { useState, useEffect, useRef, use } from 'react';
import { 
  MapPin, 
  Search, 
  Trophy,
  GamepadIcon,
  ChevronLeft,
  ChevronRight,
  Play,
  Users,
  Star,
  Loader,
  Navigation
} from 'lucide-react';
import { searchLocations, getCurrentLocation, reverseGeocode } from '../services/locationService.js';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ onLocationSearch }) => {
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroRef = useRef(null);
  const locationInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const nav = useNavigate();

  // Sports slideshow images
  const slides = [
    {
      id: 1,
      title: "Badminton Championship",
      description: "Join the ultimate badminton experience",
      image: "🏸",
      bgGradient: "from-purple-50 to-violet-100",
      stats: { players: "150+", venues: "25+" }
    },
    {
      id: 2,
      title: "Football League",
      description: "Score goals and make memories",
      image: "⚽",
      bgGradient: "from-purple-50 to-violet-100",
      stats: { players: "300+", venues: "40+" }
    },
    {
      id: 3,
      title: "Basketball Arena",
      description: "Slam dunk your way to victory",
      image: "🏀",
      bgGradient: "from-purple-50 to-violet-100",
      stats: { players: "200+", venues: "15+" }
    },
    {
      id: 4,
      title: "Tennis Courts",
      description: "Ace your game on premium courts",
      image: "🎾",
      bgGradient: "from-purple-50 to-violet-100",
      stats: { players: "120+", venues: "30+" }
    },
    {
      id: 5,
      title: "Volleyball Matches",
      description: "Spike your way to the top",
      image: "🏐",
      bgGradient: "from-purple-50 to-violet-100",
      stats: { players: "80+", venues: "20+" }
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000); // Resume auto-slide after 8 seconds
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000); // Resume auto-slide after 8 seconds
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000); // Resume auto-slide after 8 seconds
  };

  // Typewriter effect
  useEffect(() => {
    const typewriterTexts = [
      "Find Players & Venues Nearby You",
      "Connect with Sports Enthusiasts", 
      "Discover Amazing Sports Venues",
      "Join Your Favorite Sports Community"
    ];
    
    let charIndex = 0;
    let isDeleting = false;
    const currentText = typewriterTexts[currentTextIndex];
    
    const timer = setInterval(() => {
      if (!isDeleting && charIndex <= currentText.length) {
        setTypewriterText(currentText.substring(0, charIndex));
        charIndex++;
        if (charIndex > currentText.length) {
          setTimeout(() => {
            isDeleting = true;
          }, 2000);
        }
      } else if (isDeleting && charIndex >= 0) {
        setTypewriterText(currentText.substring(0, charIndex));
        charIndex--;
        if (charIndex < 0) {
          isDeleting = false;
          setCurrentTextIndex((prev) => (prev + 1) % typewriterTexts.length);
          charIndex = 0;
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearInterval(timer);
  }, [currentTextIndex]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isPaused) {
      const autoSlide = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000); // Change slide every 4 seconds

      return () => clearInterval(autoSlide);
    }
  }, [slides.length, isPaused]);

  // Location search functionality
  const handleLocationSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchLocations(searchQuery);
      if (response.success && response.data) {
        setLocationSuggestions(response.data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      handleLocationSearch(value);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (locationItem) => {
    setLocation(locationItem.place_name);
    setSelectedLocation(locationItem);
    setShowSuggestions(false);
    setLocationSuggestions([]);
    
    // Log the selected location details
    console.log('Selected location:', {
      city: locationItem.parsed?.city,
      state: locationItem.parsed?.state,
      country: locationItem.parsed?.country,
      coordinates: locationItem.center
    });

    // Trigger venue search in parent component
    if (onLocationSearch) {
      onLocationSearch({
        coordinates: locationItem.center,
        location: locationItem.place_name,
        city: locationItem.parsed?.city,
        state: locationItem.parsed?.state,
        country: locationItem.parsed?.country
      });
    }
  };

  // Get current location
  const handleCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await getCurrentLocation();
      const locationData = await reverseGeocode(position.longitude, position.latitude);
      
      if (locationData.success && locationData.data) {
        setLocation(locationData.data.place_name);
        setSelectedLocation(locationData.data);
        setShowSuggestions(false);
        
        console.log('Current location:', {
          city: locationData.data.parsed?.city,
          state: locationData.data.parsed?.state,
          country: locationData.data.parsed?.country,
          coordinates: [position.longitude, position.latitude]
        });

        // Trigger venue search in parent component
        if (onLocationSearch) {
          onLocationSearch({
            coordinates: [position.longitude, position.latitude],
            location: locationData.data.place_name,
            city: locationData.data.parsed?.city,
            state: locationData.data.parsed?.state,
            country: locationData.data.parsed?.country
          });
        }
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get your current location. Please check your browser permissions.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (selectedLocation) {
      console.log('Searching venues near:', {
        city: selectedLocation.parsed?.city,
        state: selectedLocation.parsed?.state,
        country: selectedLocation.parsed?.country,
        coordinates: selectedLocation.center
      });
      
      // Trigger venue search in parent component
      if (onLocationSearch) {
        onLocationSearch({
          coordinates: selectedLocation.center,
          location: selectedLocation.place_name,
          city: selectedLocation.parsed?.city,
          state: selectedLocation.parsed?.state,
          country: selectedLocation.parsed?.country
        });
      }
    } else if (location.trim()) {
      // If user typed but didn't select, search with the first suggestion
      handleLocationSearch(location);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={heroRef} className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Geometric shapes with 3D effect */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full opacity-20 animate-pulse transform rotate-45"></div>
        
        <div className="absolute top-1/2 left-5 w-24 h-24 bg-gradient-to-br from-black to-gray-700 rounded-full opacity-10 animate-ping"></div>
        
        {/* Clean background without floating elements */}

        {/* 3D Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 grid-rows-8 h-full">
            {Array.from({ length: 96 }).map((_, i) => (
              <div key={i} className="border border-gray-400"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Header */}
     

      {/* Main Hero Content - Responsive Layout */}
      <div className="relative z-40 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Search, Typewriter Heading, Context */}
          <div className=" flex flex-col justify-center min-h-[400px]">
             <div className=" text-center lg:text-left">
              <div className="min-h-[120px] lg:min-h-[60px]">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-4xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                    {typewriterText}
                    <span className="animate-pulse">|</span>
                  </span>
                </h1>
              </div>
          </div>
          
            {/* Search Section First - Moved Up */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 max-w-lg mx-auto w-full lg:mx-0 lg:max-w-none">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-center lg:justify-start gap-2">
                  <Search className="w-5 h-5" />
                  Find Your Court
                </h3>
                <div className="flex items-center space-x-3">
                  <div ref={locationInputRef} className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={location}
                      onChange={handleLocationChange}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 focus:border-transparent font-medium"
                      placeholder="Enter your location"
                      autoComplete="off"
                    />
                    {/* Current Location Button */}
                    <button
                      onClick={handleCurrentLocation}
                      disabled={isLoadingLocation}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Use current location"
                    >
                      {isLoadingLocation ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Search suggestions dropdown */}
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
                        {locationSuggestions.map((suggestion, index) => (
                          <div
                            key={suggestion.id || index}
                            onClick={() => handleLocationSelect(suggestion)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {suggestion.parsed?.city || suggestion.place_name.split(',')[0]}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {suggestion.place_name}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Loading indicator */}
                    {isSearching && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg z-50">
                        <div className="px-4 py-3 flex items-center gap-2">
                          <Loader className="w-4 h-4 animate-spin text-gray-400" />
                          <span className="text-sm text-gray-500">Searching...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleSearch}
                    className="px-4 lg:px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline font-semibold">Search</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {['Nearby', 'Top Rated'].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
              </div>

            {/* Typewriter Heading */}
         

          {/* Right Side - Interactive Slideshow (Hidden on Mobile) */}
          <div className="hidden lg:block space-y-8">
            {/* Slideshow Container */}
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Slide Content */}
              <div className={`relative h-96 bg-gradient-to-br ${slides[currentSlide].bgGradient} transition-all duration-700 ease-in-out`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full"></div>
                  <div className="absolute bottom-10 left-10 w-24 h-24 bg-white rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Slide Content */}
                <div className="relative z-10 flex items-center justify-center h-full p-8">
                  <div className="text-center space-y-6">
                    {/* Large Sport Icon */}
                    <div className="text-8xl transform hover:scale-110 transition-transform duration-300 animate-bounce">
                      {slides[currentSlide].image}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-3xl font-bold text-gray-800">
                      {slides[currentSlide].title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-lg max-w-sm mx-auto">
                      {slides[currentSlide].description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{slides[currentSlide].stats.players}</div>
                        <div className="text-sm text-gray-600">Players</div>
                      </div>
                      <div className="w-px h-12 bg-gray-300"></div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{slides[currentSlide].stats.venues}</div>
                        <div className="text-sm text-gray-600">Venues</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows */}
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-gray-800 scale-125' 
                        : 'bg-gray-400 hover:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4 cursor-pointer">
              <div onClick={() => nav('/chat')} className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">Community</span>
                </div>
                <p className="text-sm text-gray-600">Connect with players</p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-800">Premium</span>
                </div>
                <p className="text-sm text-gray-600">Top-rated venues</p>
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

      <style>{`
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
        
        .rotateY-3 {
          transform: rotateY(3deg);
        }
      `}</style>
    </div>
  );
};

export default HeroSection;