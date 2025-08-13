
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Heart,
  Trophy
} from 'lucide-react';

const Footer = () => {
  const footerRef = useRef(null);
  const footerInView = useInView(footerRef, { once: true, margin: "-50px" });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const socialLinks = [
    { icon: Facebook, href: "#", color: "hover:text-blue-500" },
    { icon: Twitter, href: "#", color: "hover:text-sky-500" },
    { icon: Instagram, href: "#", color: "hover:text-pink-500" },
    { icon: Linkedin, href: "#", color: "hover:text-blue-600" }
  ];

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Venues", href: "/venues" },
    { name: "Sports", href: "/sports" },
    { name: "Contact", href: "/contact" },
    { name: "Help Center", href: "#" },
    { name: "Privacy Policy", href: "#" }
  ];

  return (
    <motion.footer 
      ref={footerRef}
      initial="hidden"
      animate={footerInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden"
    >
      {/* Rounded Top Corners */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-t-[2rem] shadow-2xl"></div>
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gray-300 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gray-400 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Main Footer Content */}
          <motion.div
            initial="hidden"
            animate={footerInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12"
          >
            {/* Company Info */}
            <motion.div variants={fadeInUp} className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-6">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-500 rounded-xl p-2 mr-3"
                >
                  <Trophy className="w-full h-full text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white">
                  SportVenue
                </h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed max-w-sm mx-auto md:mx-0">
                Your ultimate destination for finding and booking sports venues. 
                Connect with fellow athletes and discover amazing facilities.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start text-gray-300 hover:text-white transition-colors">
                  <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">123 Sports Street, Athletic City</span>
                </div>
                <div className="flex items-center justify-center md:justify-start text-gray-300 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center justify-center md:justify-start text-gray-300 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">info@sportvenue.com</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeInUp} className="text-center md:text-left">
              <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center justify-center md:justify-start group"
                    >
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Social Media & Newsletter */}
            <motion.div variants={fadeInUp} className="text-center md:text-left">
              <h4 className="text-lg font-bold text-white mb-6">Connect With Us</h4>
              <p className="text-gray-300 mb-6 text-sm">
                Follow us for the latest updates and sports venue discoveries.
              </p>
              <div className="flex space-x-4 justify-center md:justify-start mb-8">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      whileHover={{ 
                        scale: 1.2,
                        rotate: 360
                      }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className={`w-10 h-10 bg-gray-700 rounded-lg p-2 text-gray-300 ${social.color} transition-all duration-300 hover:shadow-lg hover:bg-gray-600`}
                    >
                      <Icon className="w-full h-full" />
                    </motion.a>
                  );
                })}
              </div>
              
              {/* Newsletter Signup */}
              <div className="max-w-sm mx-auto md:mx-0">
                <p className="text-sm text-gray-400 mb-3">Subscribe to our newsletter</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-r-lg hover:from-gray-500 hover:to-gray-400 transition-all duration-300 font-medium">
                    Subscribe
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            initial="hidden"
            animate={footerInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="border-t border-gray-700 pt-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center mb-4 md:mb-0"
              >
                <p className="text-gray-400 flex items-center text-sm">
                  &copy; {new Date().getFullYear()} SportVenue. All rights reserved. Made with 
                  <motion.span
                    animate={{ 
                      scale: [1, 1.2, 1],
                      color: ["#ef4444", "#f97316", "#ef4444"]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="mx-1"
                  >
                    <Heart className="w-3 h-3 fill-current" />
                  </motion.span>
                  for sports enthusiasts
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-4"
              >
                <span className="px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-full text-xs font-medium">
                  🏆 Best Sports Platform 2024
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;