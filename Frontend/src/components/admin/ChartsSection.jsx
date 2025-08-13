import React from 'react';
import BookingActivityChart from './charts/BookingActivityChart';
import SportsPopularityChart from './charts/SportsPopularityChart';
import UserRegistrationChart from './charts/UserRegistrationChart';
import FacilityApprovalChart from './charts/FacilityApprovalChart';
import EarningsChart from './charts/EarningsChart';

const ChartsSection = () => {
  return (
    <div className="space-y-8">
      {/* First Row - Line Chart and Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingActivityChart />
        <SportsPopularityChart />
      </div>

      {/* Second Row - Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <UserRegistrationChart />
        <FacilityApprovalChart />
        <EarningsChart />
      </div>
    </div>
  );
};

export default ChartsSection;
