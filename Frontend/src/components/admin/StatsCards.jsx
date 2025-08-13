import React, { useState, useEffect } from 'react';
import { UsersIcon, BuildingOfficeIcon, CalendarIcon, MapIcon } from '@heroicons/react/24/outline';
import { getDashboardStats } from '../../services/adminService';

const StatsCards = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      const data = response.data;

      const formattedStats = [
        {
          title: 'Total Users',
          value: data.users.totalUsers.toLocaleString(),
          change: `${data.users.activeUsers} active`,
          changeType: 'increase',
          icon: UsersIcon,
        },
        {
          title: 'Total Facility Owners',
          value: data.users.facilityOwners.toLocaleString(),
          change: `${data.venues.pendingApprovals} pending`,
          changeType: 'increase',
          icon: BuildingOfficeIcon,
        },
        {
          title: 'Total Bookings',
          value: data.bookings.totalBookings.toLocaleString(),
          change: `${data.bookings.confirmedBookings} confirmed`,
          changeType: 'increase',
          icon: CalendarIcon,
        },
        {
          title: 'Total Active Courts',
          value: data.venues.totalCourts.toLocaleString(),
          change: `${data.venues.totalVenues} venues`,
          changeType: 'increase',
          icon: MapIcon,
        },
      ];

      setStats(formattedStats);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard stats');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="bg-gray-200 p-3 rounded-lg w-12 h-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading dashboard stats: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-black mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">users/items</span>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Icon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
