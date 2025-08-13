import React from 'react';

const ChatStyles = () => {
  return (
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
      
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.5s ease-out forwards;
      }
      
      .animate-slide-down {
        animation: slideDown 0.3s ease-out forwards;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .scrollbar-thin::-webkit-scrollbar {
        width: 6px;
      }
      
      .scrollbar-thumb-purple-300\\/50::-webkit-scrollbar-thumb {
        background-color: rgba(196, 181, 253, 0.5);
        border-radius: 3px;
      }
      
      .scrollbar-track-transparent::-webkit-scrollbar-track {
        background: transparent;
      }
    `}</style>
  );
};

export default ChatStyles;
