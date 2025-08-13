import React from 'react';
import StatsCards from './StatsCards';
import ChartsSection from './ChartsSection';

const DashboardOverview = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts Section */}
      <ChartsSection />
    </div>
  );
};

export default DashboardOverview;
