import React from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";

const SideBar = ({ location }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden">
            <Menu size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
            Community Requests
          </h1>
        </div>

        <div className="flex items-center space-x-4">
           <a className="hidden md:flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg" href="/">
            <span className="text-orange-400">Home</span>
          </a>
          {/* Location Dropdown */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
            <span className="text-orange-400">📍</span>
            <span className="text-sm font-medium">{location}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
          {/* add item - commented out until AddItem component is created */}
          {/* <AddItem /> */}
          {/* Search */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search requests..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent w-64 hidden md:block"
            />
          </div>

          {/* Notifications */}
          <button className="relative">
            <Bell size={24} className="text-gray-600" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile */}
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=32&h=32&fit=crop&crop=face"
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden mt-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>
    </header>
  );
};

export default SideBar;
