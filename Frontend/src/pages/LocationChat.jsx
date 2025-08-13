import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChatLogic } from '../hooks/useChatLogic';

// Import modular components
import ChatHeader from '../components/chat/ChatHeader';
import MessagesList from '../components/chat/MessagesList';
import MessageInput from '../components/chat/MessageInput';
import LocationModal from '../components/chat/LocationModal';
import LoadingScreen from '../components/chat/LoadingScreen';
import ErrorBanner from '../components/chat/ErrorBanner';
import ChatStyles from '../components/chat/ChatStyles';

const LocationChat = () => {
  const { user } = useAuth();
  
  const {
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
  } = useChatLogic(user);

  // Add loading check for user
  if (!user) {
    return <LoadingScreen message="Loading your conversations..." />;
  }

  // Wait for currentUser to be initialized
  if (!currentUser) {
    return <LoadingScreen message="Setting up your location..." />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatStyles />
      
      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal
          currentUser={currentUser}
          locationQuery={locationQuery}
          onLocationQueryChange={handleLocationQueryChange}
          locationSuggestions={locationSuggestions}
          showSuggestions={showSuggestions}
          isSearchingLocation={isSearchingLocation}
          isLoadingCurrentLocation={isLoadingCurrentLocation}
          onLocationSelect={handleLocationSelect}
          onGetCurrentLocation={handleGetCurrentLocation}
          onClose={() => setShowLocationModal(false)}
          locationInputRef={locationInputRef}
        />
      )}
      
      {/* Loading Screen */}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        /* Main Chat Interface */
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Dynamic background with improved animations */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-indigo-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-300/30 to-pink-200/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-300"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-violet-100/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-indigo-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          </div>

          {/* Chat Header */}
          <ChatHeader
            currentUser={currentUser}
            activeUsers={activeUsers}
            isConnected={isConnected}
            onChangeLocation={() => setShowLocationModal(true)}
          />

          {/* Error Banner */}
          <ErrorBanner error={error} />

          {/* Messages List */}
          <MessagesList
            messages={messages}
            currentUser={currentUser}
            typingUsers={typingUsers}
            messagesEndRef={messagesEndRef}
          />

          {/* Message Input */}
          <MessageInput
            newMessage={newMessage}
            onMessageChange={handleTyping}
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
          />
        </div>
      )}
    </div>
  );
};

export default LocationChat;
