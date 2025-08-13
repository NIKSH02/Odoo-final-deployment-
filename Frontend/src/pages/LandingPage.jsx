import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import VenueBookingSection from '../components/VenueBookingSection';
import InfiniteMarquee from '../components/InfiniteMarquee';
import HowItWork from '../components/HowItWork';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState(null);

  const handleOpenSignUpModal = () => {
    navigate('/register');
  };
  
  const handleOpenLoginModal = () => {
    navigate('/login');
  };

  // Handle location search from HeroSection
  const handleLocationSearch = (locationData) => {
    setSearchLocation(locationData);
  };

  return (
    <>
      <HeroSection
        onOpenSignUpModal={handleOpenSignUpModal}
        onOpenLoginModal={handleOpenLoginModal}
        onLocationSearch={handleLocationSearch}
      />
       <InfiniteMarquee/>
     <VenueBookingSection searchLocation={searchLocation} />  
     <HowItWork />  
           <Footer />
    </>
  );
};

export default LandingPage;
