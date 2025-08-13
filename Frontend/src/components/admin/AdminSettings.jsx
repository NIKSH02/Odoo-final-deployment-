import React, { useState, useEffect } from 'react';
import { CogIcon, BellIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { getAllUsers, suspendUser, unsuspendUser, banUser, getUserBookingHistory } from '../../services/adminService';
import toast from 'react-hot-toast';


const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [users, setUsers] = useState([]);
  

  const sections = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
  ];

  const currentUser = JSON.parse(localStorage.getItem("userData"));
  console.log("curr", currentUser)

//   useEffect(() => {
//     fetchUsers();
//   }, []);

// const fetchUsers = async () => {
//   try {
//     // setLoading(true);
//     const response = await getAllUsers();
//     setUsers(response.data?.users || []); // changed here - ensure we set an array, not the full object
//     console.log('Fetched users:', response.data.users);
//   } catch (error) {
//     console.error('Failed to fetch users:', error);
//     toast.error('Failed to load users');
//     setUsers(getDummyUsers());
//   } finally {
//     // setLoading(false);
//   }
// };

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-black">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                <input
                  type="text"
                  defaultValue="Sports Booking Platform"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Booking Duration (hours)</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent">
                  <option value="1">1 Hour</option>
                  <option value="2">2 Hours</option>
                  <option value="3">3 Hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                <input
                  type="number"
                  defaultValue="10"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-black">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-black">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive email alerts for important events</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-black">New User Registrations</h4>
                  <p className="text-sm text-gray-600">Get notified when new users register</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-black">Booking Confirmations</h4>
                  <p className="text-sm text-gray-600">Receive alerts for new bookings</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-black">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-black">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>
        );
      case 'profile':
  const storedUser = localStorage.getItem("userData");
  const currentUser = storedUser ? JSON.parse(storedUser) : {};

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-black">Profile Settings</h3>
      <div className="space-y-4">
        
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            defaultValue={currentUser.fullName || ''}
            placeholder="Enter full name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            defaultValue={currentUser.email || ''}
            placeholder="Enter email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            defaultValue={currentUser.userName || ''}
            placeholder="Enter username"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

      </div>
    </div>
  );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your admin preferences and platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{section.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            {renderContent()}
            
            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
