import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Footer from '../components/Footer.jsx';
import { MapPin, Users, Calendar, Star, Award, Target, Zap, Shield } from 'lucide-react';
import TeamSection from '../components/TeamMember.jsx';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const AboutPage = () => {
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const valuesRef = useRef(null);
  const statsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const storyInView = useInView(storyRef, { once: true, amount: 0.3 });
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.3 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

  const values = [
    {
      icon: <MapPin size={40} className="text-black" />,
      title: "Premium Locations",
      description: "We connect athletes with top-quality sports facilities in prime locations across the city."
    },
    {
      icon: <Users size={40} className="text-black" />,
      title: "Community Focus",
      description: "Building a vibrant sports community where athletes and fitness enthusiasts connect and grow together."
    },
    {
      icon: <Target size={40} className="text-black" />,
      title: "Performance Driven",
      description: "Focused on helping athletes achieve their fitness and performance goals through quality facilities."
    },
    {
      icon: <Calendar size={40} className="text-black" />,
      title: "Flexible Booking",
      description: "Easy online booking system with flexible scheduling to fit your busy lifestyle and training needs."
    }
  ];

  const stats = [
    { number: "500+", label: "Sports Venues" },
    { number: "3+", label: "Years Experience" },
    { number: "10K+", label: "Active Users" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen font-['Inter'] transition-all duration-700 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="relative py-20 px-4 overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 2 === 0 ? 'bg-gray-300' : 'bg-gray-400'
              }`}
              initial={{ opacity: 0.1 }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "easeInOut",
              }}
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: 'blur(80px)',
              }}
            />
          ))}
        </div>
        <TeamSection />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-2xl"
          animate={{ 
            rotate: [0, 180, 360],
            y: [-10, 10, -10]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-32 right-32 w-12 h-12 bg-gradient-to-br from-black to-gray-700 rounded-full shadow-xl"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [-5, 5, -5]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent"
          >
            About QuickCourt
          </motion.h1>
          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed text-gray-600"
          >
            Connecting athletes with premium sports facilities and venues. Discover, book, and experience the best sporting destinations in your area.
          </motion.p>
        </div>
      </motion.section>

      {/* Story Section */}
      <motion.section 
        ref={storyRef}
        initial="hidden"
        animate={storyInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="py-20 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeInUp} className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                Our Story
              </h2>
              <p className="text-lg leading-relaxed text-gray-600">
                Founded in 2025, QuickCourt began with a vision to revolutionize sports facility booking. What started as a simple platform connecting athletes with venues has evolved into a comprehensive sports ecosystem serving thousands of users.
              </p>
              <p className="text-lg leading-relaxed text-gray-600">
                Today, we continue to innovate in the sports industry, leveraging technology to create seamless connections between athletes and top-quality facilities. Every booking on our platform represents a step towards achieving fitness goals and sporting excellence.
              </p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-gray-200/30 bg-white/95 backdrop-blur-sm">
                <div className="w-full h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center">
                    <MapPin size={80} className="text-black mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Sports Excellence
                    </h3>
                    <p className="mt-2 text-gray-600">
                      Connecting athletes with premier venues
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
       

      {/* Values Section */}
      <motion.section 
        ref={valuesRef}
        initial="hidden"
        animate={valuesInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="py-20 px-4 bg-white/95 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
              Our Values
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-gray-600">
              These core principles guide everything we do and help us deliver exceptional sports experiences to our community.
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-8 rounded-2xl text-center transition-all duration-300 border backdrop-blur-sm hover:shadow-2xl hover:scale-105 bg-white/50 border-gray-200/30 hover:border-gray-400/50"
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {value.title}
                </h3>
                <p className="leading-relaxed text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        ref={statsRef}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="py-16 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center p-6 rounded-2xl transition-all duration-300 bg-white/30 hover:bg-white/50 backdrop-blur-sm border border-gray-200/30 hover:border-gray-400/50"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-lg text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

    
      {/* Call to Action */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-20 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
            Ready to Book Your Venue?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-600">
            Join thousands of athletes who have discovered their perfect sports facilities through our comprehensive booking platform.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-gray-800 to-black text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => window.location.href = '/venues'}
          >
            Explore Venues
          </motion.button>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default AboutPage;
