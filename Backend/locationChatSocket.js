import GroupMessage from './models/GroupMessage.js'

const locationChatSocket = (io) => {
  // Store active users per location room
  const activeUsers = new Map(); // roomName -> Set of userIds
  const userSockets = new Map(); // userId -> socketId
  const socketUsers = new Map(); // socketId -> userInfo
  const userLocations = new Map(); // userId -> {roomName, displayName, coordinates}

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Extract coordinates from room name (format: location_lat_lng)
  const extractCoordinatesFromRoom = (roomName) => {
    const parts = roomName.split('_');
    if (parts.length >= 3 && parts[0] === 'location') {
      return {
        latitude: parseFloat(parts[1]),
        longitude: parseFloat(parts[2])
      };
    }
    return null;
  };

  io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    // Handle user joining a location-based chat room
    socket.on('joinLocation', (data) => {
      try {
        let { userId, userName, location } = data;
        if (!userId || !userName || !location) {
          socket.emit('error', { message: 'Missing required fields: userId, userName, or location' });
          return;
        }

        // Store user info with room name (location already processed by frontend)
        const userInfo = { 
          userId, 
          userName, 
          location: location.trim().toLowerCase()
        };
        
        socketUsers.set(socket.id, userInfo);
        userSockets.set(userId, socket.id);
        
        // Join the location room
        socket.join(userInfo.location);
        
        // Add user to active users for this location
        if (!activeUsers.has(userInfo.location)) {
          activeUsers.set(userInfo.location, new Set());
        }
        activeUsers.get(userInfo.location).add(userId);

        console.log(`User ${userName} (${userId}) joined room: ${userInfo.location}`);

        // Notify others in the location about new user
        socket.to(userInfo.location).emit('userJoined', {
          userId,
          userName,
          location: userInfo.location,
          timestamp: new Date()
        });

        // Send current active users count to the user
        const activeCount = activeUsers.get(userInfo.location).size;
        socket.emit('activeUsersUpdate', { 
          location: userInfo.location, 
          activeCount,
          message: `${activeCount} users active in this area`
        });

        // Broadcast updated active count to all users in location
        io.to(userInfo.location).emit('activeUsersCount', { 
          location: userInfo.location, 
          activeCount 
        });

      } catch (error) {
        console.error('Error in joinLocation:', error);
        socket.emit('error', { message: 'Failed to join location chat' });
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        let { userId, userName, message, location } = data;
        if (!userId || !userName || !message || !location) {
          socket.emit('error', { message: 'Missing required fields for sending message' });
          return;
        }
        
        // Normalize location string
        location = location.trim().toLowerCase();
        
        if (message.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }
        if (message.length > 1000) {
          socket.emit('error', { message: 'Message too long (max 1000 characters)' });
          return;
        }

        // Create new message document
        const newMessage = new GroupMessage({
          senderId: userId,
          senderName: userName,
          message: message.trim(),
          location,
          timestamp: new Date()
        });

        // Save to database
        const savedMessage = await newMessage.save();
        if (!savedMessage) {
          socket.emit('error', { message: 'Message not saved to database' });
          return;
        }

        // Prepare message for broadcast
        const messageData = {
          _id: savedMessage._id,
          senderId: savedMessage.senderId,
          senderName: savedMessage.senderName,
          message: savedMessage.message,
          location: savedMessage.location,
          timestamp: savedMessage.timestamp
        };

        // Broadcast message to all users in the location room
        io.to(location).emit('receiveMessage', messageData);
        console.log(`Message sent in room ${location} by ${userName}: ${message.substring(0, 50)}...`);

      } catch (error) {
        console.error('Error in sendMessage:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      let { userId, userName, location, isTyping } = data;
      if (!userId || !location) {
        return;
      }
      location = location.trim().toLowerCase();
      
      // Broadcast typing status to others in the location (except sender)
      socket.to(location).emit('userTyping', {
        userId,
        userName,
        location,
        isTyping,
        timestamp: new Date()
      });
    });

    // Handle user leaving location
    socket.on('leaveLocation', (data) => {
      try {
        let { userId, location } = data;
        const userInfo = socketUsers.get(socket.id);
        
        if (userInfo && userInfo.location) {
          // Use the stored location from userInfo
          location = userInfo.location;
          socket.leave(location);
          
          // Remove from active users
          if (activeUsers.has(location)) {
            activeUsers.get(location).delete(userId);
            // If no more users in location, clean up
            if (activeUsers.get(location).size === 0) {
              activeUsers.delete(location);
            } else {
              // Update active count for remaining users
              const activeCount = activeUsers.get(location).size;
              io.to(location).emit('activeUsersCount', { 
                location, 
                activeCount 
              });
            }
          }
          
          // Notify others about user leaving
          socket.to(location).emit('userLeft', {
            userId: userInfo.userId,
            userName: userInfo.userName,
            location,
            timestamp: new Date()
          });
          
          console.log(`User ${userInfo.userName} left room: ${location}`);
        }
      } catch (error) {
        console.error('Error in leaveLocation:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      try {
        const userInfo = socketUsers.get(socket.id);
        if (userInfo) {
          let { userId, userName, location } = userInfo;
          
          // Clean up user data
          socketUsers.delete(socket.id);
          userSockets.delete(userId);
          userLocations.delete(userId);
          
          // Remove from active users
          if (activeUsers.has(location)) {
            activeUsers.get(location).delete(userId);
            if (activeUsers.get(location).size === 0) {
              activeUsers.delete(location);
            } else {
              // Update active count
              const activeCount = activeUsers.get(location).size;
              io.to(location).emit('activeUsersCount', { location, activeCount });
            }
          }
          
          // Notify others about disconnection
          socket.to(location).emit('userLeft', {
            userId,
            userName,
            location,
            timestamp: new Date()
          });
          
          console.log(`User ${userName} disconnected from room ${location}`);
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });

    // Handle ping for connection health check
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Get room statistics
    socket.on('getRoomStats', (data) => {
      try {
        const { location } = data;
        if (!location) {
          socket.emit('error', { message: 'Location required for stats' });
          return;
        }

        const normalizedLocation = location.trim().toLowerCase();
        const activeCount = activeUsers.get(normalizedLocation)?.size || 0;
        const coordinates = extractCoordinatesFromRoom(normalizedLocation);

        socket.emit('roomStats', {
          location: normalizedLocation,
          activeUsers: activeCount,
          coordinates,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Error getting room stats:', error);
        socket.emit('error', { message: 'Failed to get room statistics' });
      }
    });
  });

  // Cleanup function for graceful shutdown
  const cleanup = () => {
    activeUsers.clear();
    userSockets.clear();
    socketUsers.clear();
    userLocations.clear();
  };

  return { cleanup };
};

export default locationChatSocket;