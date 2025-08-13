import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const FacilityOwnersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy data for facility owners
  const facilityOwners = [
    { id: 1, name: 'Sports Complex Ltd', owner: 'Alex Johnson', email: 'alex@sportscomplex.com', facilities: 3, status: 'approved', joinDate: '2024-01-10' },
    { id: 2, name: 'Elite Sports Center', owner: 'Maria Garcia', email: 'maria@elitesports.com', facilities: 5, status: 'approved', joinDate: '2024-02-15' },
    { id: 3, name: 'City Recreation Hub', owner: 'Robert Lee', email: 'robert@cityrecreation.com', facilities: 2, status: 'pending', joinDate: '2024-03-20' },
    { id: 4, name: 'Premier Sports Arena', owner: 'Lisa Chen', email: 'lisa@premiersports.com', facilities: 4, status: 'approved', joinDate: '2024-01-25' },
    { id: 5, name: 'Community Sports Club', owner: 'James Wilson', email: 'james@communitysports.com', facilities: 1, status: 'pending', joinDate: '2024-03-05' },
  ];

  const filteredOwners = facilityOwners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Facility Owners Management</h1>
        <p className="text-gray-600 mt-2">Manage facility owners and their venues</p>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search facility owners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      {/* Facility Owners Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business/Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facilities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOwners.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-black">{owner.name}</div>
                      <div className="text-sm text-gray-500">{owner.owner}</div>
                      <div className="text-sm text-gray-400">{owner.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-black font-medium">{owner.facilities}</span>
                    <span className="text-sm text-gray-500 ml-1">facilities</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                      owner.status === 'approved' 
                        ? 'bg-gray-100 text-black' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {owner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {owner.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-black hover:text-gray-600 mr-3">View</button>
                    {owner.status === 'pending' && (
                      <>
                        <button className="text-black hover:text-gray-600 mr-3">Approve</button>
                        <button className="text-gray-600 hover:text-black">Reject</button>
                      </>
                    )}
                    {owner.status === 'approved' && (
                      <button className="text-gray-600 hover:text-black">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacilityOwnersManagement;
