import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle, 
  Trophy,
  Zap,
  Shield
} from 'lucide-react';

const HowItWork = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const stepsRef = useRef(null);
  const featuresRef = useRef(null);
  
  const titleInView = useInView(titleRef, { once: true, margin: "-50px" });
  const stepsInView = useInView(stepsRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
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

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const steps = [
    {
      id: 1,
      icon: Search,
      title: "Search Venues",
      description: "Find sports venues near you using our advanced search and filter options.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: 2,
      icon: MapPin,
      title: "Choose Location",
      description: "Select your preferred location and explore available facilities and amenities.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: 3,
      icon: Calendar,
      title: "Book Your Slot",
      description: "Pick your preferred time slot and make instant bookings with secure payment.",
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      id: 4,
      icon: Users,
      title: "Play & Connect",
      description: "Enjoy your game and connect with fellow sports enthusiasts in your area.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Book venues instantly with real-time availability"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and secure payment processing"
    },
    {
      icon: Trophy,
      title: "Quality Venues",
      description: "Verified and top-rated sports facilities"
    }
  ];

  return (
    <div 
      ref={sectionRef}
      className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <motion.div 
          ref={titleRef}
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <motion.div
            variants={scaleIn}
            className="inline-block"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 text-sm font-medium mb-4">
              How It Works
            </span>
          </motion.div>
          
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent mb-6"
          >
            Simple Steps to Get Started
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Discover, book, and enjoy sports venues in just a few clicks. 
            Our platform makes it easier than ever to find your perfect sports experience.
          </motion.p>
        </motion.div>

        {/* Steps Section */}
        <motion.div 
          ref={stepsRef}
          initial="hidden"
          animate={stepsInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={step.id}
                variants={isEven ? slideInLeft : slideInRight}
                className="relative"
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 ${step.borderColor} hover:shadow-2xl transition-all duration-300 group`}
                >
                  {/* Step Number */}
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-black to-gray-800 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  >
                    {step.id}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ duration: 0.3 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} p-4 mb-6 mx-auto`}
                  >
                    <Icon className="w-full h-full text-white" />
                  </motion.div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-black transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {step.description}
                    </p>
                  </div>

                  {/* Hover Effect Background */}
                  <div className={`absolute inset-0 ${step.bgColor} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                </motion.div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={stepsInView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                    className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 transform -translate-y-1/2 z-0"
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features Section */}
        <motion.div 
          ref={featuresRef}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200"
        >
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent mb-4">
              Why Choose Our Platform?
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience the best in sports venue booking with our premium features and seamless user experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  className="text-center group"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                    className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-5 mx-auto mb-6 group-hover:from-black group-hover:to-gray-800 transition-all duration-300"
                  >
                    <Icon className="w-full h-full text-gray-700 group-hover:text-white transition-colors" />
                  </motion.div>
                  
                  <h4 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-black transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWork;
