import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { searchLocations, getCurrentLocation, reverseGeocode } from './../services/locationService';

export const useChatLogic = (user) => {
  // All state hooks first
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  
  // Location change modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);

  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const locationInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Generate room name based on coordinates (10km radius)
  const generateRoomName = (coordinates) => {
    if (!coordinates) return 'unknown-location';
    
    const [longitude, latitude] = coordinates;
    // Round to create 10km grid (approximately 0.1 degree = 11km)
    const latGrid = Math.floor(latitude / 0.1) * 0.1;
    const lngGrid = Math.floor(longitude / 0.1) * 0.1;
    return `location_${latGrid.toFixed(1)}_${lngGrid.toFixed(1)}`;
  };

  // Initialize user location from localStorage or set default
  useEffect(() => {
    if (!user) return;

    const initializeLocation = async () => {
      try {
        // Try to get from localStorage first
        const savedLocation = localStorage.getItem('chatLocation');
        if (savedLocation) {
          const locationData = JSON.parse(savedLocation);
          // Check if saved location is still valid (less than 24 hours old)
          const savedTime = new Date(locationData.timestamp);
          const now = new Date();
          const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            const roomName = generateRoomName(locationData.coordinates);
            setCurrentUser({
              userId: user._id,
              userName: user.fullName,
              location: roomName,
              locationDisplay: locationData.display,
              coordinates: locationData.coordinates
            });
            return;
          }
        }
        
        // If no saved location or expired, get current location
        const position = await getCurrentLocation();
        const locationData = await reverseGeocode(position.longitude, position.latitude);
        
        if (locationData.success && locationData.data) {
          const newLocationData = {
            display: locationData.data.parsed?.city || locationData.data.place_name.split(',')[0],
            coordinates: [position.longitude, position.latitude],
            timestamp: new Date().toISOString()
          };
          
          // Save to localStorage
          localStorage.setItem('chatLocation', JSON.stringify(newLocationData));
          
          const roomName = generateRoomName(newLocationData.coordinates);
          setCurrentUser({
            userId: user._id,
            userName: user.fullName,
            location: roomName,
            locationDisplay: newLocationData.display,
            coordinates: newLocationData.coordinates
          });
        }
      } catch (error) {
        console.error('Error initializing location:', error);
        // Fallback to manual location selection
        setCurrentUser({
          userId: user._id,
          userName: user.fullName,
          location: 'unknown-location',
          locationDisplay: 'Unknown Location',
          coordinates: null
        });
      }
    };

    initializeLocation();
  }, [user]);

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser) return;

    const serverUrl = 'http://localhost:8080';
    
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
      
      // Join location-based room
      socket.emit('joinLocation', {
        userId: currentUser.userId,
        userName: currentUser.userName,
        location: currentUser.location
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Failed to connect to chat server');
      setIsConnected(false);
    });

    // Chat event handlers
    socket.on('receiveMessage', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    socket.on('userJoined', (data) => {
      console.log(`${data.userName} joined the chat`);
    });

    socket.on('userLeft', (data) => {
      console.log(`${data.userName} left the chat`);
    });

    socket.on('activeUsersCount', (data) => {
      setActiveUsers(data.activeCount);
    });

    socket.on('activeUsersUpdate', (data) => {
      setActiveUsers(data.activeCount);
    });

    socket.on('userTyping', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => {
          if (!prev.find(user => user.userId === data.userId)) {
            return [...prev, { userId: data.userId, userName: data.userName }];
          }
          return prev;
        });
      } else {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leaveLocation', {
          userId: currentUser.userId,
          location: currentUser.location
        });
        socket.disconnect();
      }
    };
  }, [currentUser]);

  // Load chat history
  useEffect(() => {
    if (!currentUser?.location) return;

    const loadChatHistory = async () => {
      try {
        setIsLoading(true);
        const serverUrl = 'http://localhost:8080';
        const response = await fetch(`${serverUrl}/api/messages/${encodeURIComponent(currentUser.location)}/recent`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMessages(data.data.messages);
          }
        } else {
          console.error('Failed to load chat history');
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setError('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [currentUser]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Location search functionality
  const handleLocationSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingLocation(true);
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
      setIsSearchingLocation(false);
    }
  };

  // Debounced search
  const handleLocationQueryChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    
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
    const newLocationData = {
      display: locationItem.parsed?.city || locationItem.place_name.split(',')[0],
      coordinates: locationItem.center,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('chatLocation', JSON.stringify(newLocationData));
    
    const roomName = generateRoomName(newLocationData.coordinates);
    setCurrentUser(prev => ({
      ...prev,
      location: roomName,
      locationDisplay: newLocationData.display,
      coordinates: newLocationData.coordinates
    }));

    // Close modal and reset states
    setShowLocationModal(false);
    setLocationQuery('');
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  // Get current location
  const handleGetCurrentLocation = async () => {
    setIsLoadingCurrentLocation(true);
    try {
      const position = await getCurrentLocation();
      const locationData = await reverseGeocode(position.longitude, position.latitude);
      
      if (locationData.success && locationData.data) {
        const newLocationData = {
          display: locationData.data.parsed?.city || locationData.data.place_name.split(',')[0],
          coordinates: [position.longitude, position.latitude],
          timestamp: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('chatLocation', JSON.stringify(newLocationData));
        
        const roomName = generateRoomName(newLocationData.coordinates);
        setCurrentUser(prev => ({
          ...prev,
          location: roomName,
          locationDisplay: newLocationData.display,
          coordinates: newLocationData.coordinates
        }));

        // Close modal
        setShowLocationModal(false);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get your current location. Please check your browser permissions.');
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socketRef.current || !isConnected) {
      return;
    }

    // Stop typing indicator
    if (isTyping) {
      socketRef.current.emit('typing', {
        userId: currentUser.userId,
        userName: currentUser.userName,
        location: currentUser.location,
        isTyping: false
      });
      setIsTyping(false);
    }

    // Send message
    socketRef.current.emit('sendMessage', {
      userId: currentUser.userId,
      userName: currentUser.userName,
      message: newMessage.trim(),
      location: currentUser.location
    });

    setNewMessage('');
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socketRef.current || !isConnected) return;

    // Start typing indicator
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', {
        userId: currentUser.userId,
        userName: currentUser.userName,
        location: currentUser.location,
        isTyping: true
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('typing', {
          userId: currentUser.userId,
          userName: currentUser.userName,
          location: currentUser.location,
          isTyping: false
        });
      }
      setIsTyping(false);
    }, 1000);
  };

  return {
    // State
    currentUser,
    messages,
    newMessage,
    isConnected,
    isLoading,
    activeUsers,
    typingUsers,
    error,
    showLocationModal,
    locationQuery,
    locationSuggestions,
    showSuggestions,
    isSearchingLocation,
    isLoadingCurrentLocation,
    
    // Refs
    messagesEndRef,
    locationInputRef,
    
    // Actions
    setShowLocationModal,
    handleLocationQueryChange,
    handleLocationSelect,
    handleGetCurrentLocation,
    handleSendMessage,
    handleTyping
  };
};
