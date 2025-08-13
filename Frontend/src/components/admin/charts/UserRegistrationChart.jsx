import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const UserRegistrationChart = () => {
  const data = [
    { month: 'Jan', users: 45 },
    { month: 'Feb', users: 62 },
    { month: 'Mar', users: 78 },
    { month: 'Apr', users: 85 },
    { month: 'May', users: 95 },
    { month: 'Jun', users: 110 },
    { month: 'Jul', users: 125 },
    { month: 'Aug', users: 140 },
    { month: 'Sep', users: 158 },
    { month: 'Oct', users: 172 },
    { month: 'Nov', users: 185 },
    { month: 'Dec', users: 200 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const previousMonth = payload[0].payload;
      const growthTrend = data.value > 150 ? 'Strong growth period' : 
                         data.value > 100 ? 'Steady growth period' : 
                         'Early growth phase';
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-800">{`Month: ${label}`}</p>
          <p className="text-green-600">
            <span className="font-medium">New Users: </span>
            <span className="font-bold">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">{growthTrend}</p>
          <p className="text-xs text-gray-500 mt-1">
            Cumulative user base growth
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black">User Registration Trends</h3>
        <p className="text-gray-600 text-sm mt-1">New user registrations per month</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="users" 
              stroke="#000000" 
              fill="#808080"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserRegistrationChart;
