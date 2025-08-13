import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  Calendar,
  Building,
  Target,
  Clock,
  Users,
  X
} from 'lucide-react';

const OwnerSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { 
      id: 'dashboard',
      name: 'Dashboard', 
      icon: Home, 
      path: '/facility-owner-dashboard'
    },
    { 
      id: 'bookings',
      name: 'Booking Overview', 
      icon: Calendar, 
      path: '/booking-overview'
    },
    { 
      id: 'facilities',
      name: 'Facility Management', 
      icon: Building, 
      path: '/facility-management'
    },
    { 
      id: 'courts',
      name: 'Court Management', 
      icon: Target, 
      path: '/court-management'
    },
    { 
      id: 'timeslots',
      name: 'Time Slot Management', 
      icon: Clock, 
      path: '/time-slot-management'
    },
    { 
      id: 'profile',
      name: 'Owner Profile', 
      icon: Users, 
      path: '/owner-profile'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Owner Portal</h2>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default OwnerSidebar;
