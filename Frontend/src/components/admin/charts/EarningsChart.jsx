import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const EarningsChart = () => {
  const data = [
    { month: 'Jan', earnings: 12500 },
    { month: 'Feb', earnings: 18200 },
    { month: 'Mar', earnings: 24100 },
    { month: 'Apr', earnings: 22800 },
    { month: 'May', earnings: 31500 },
    { month: 'Jun', earnings: 28900 },
    { month: 'Jul', earnings: 39200 },
    { month: 'Aug', earnings: 35800 },
    { month: 'Sep', earnings: 42100 },
    { month: 'Oct', earnings: 38600 },
    { month: 'Nov', earnings: 45300 },
    { month: 'Dec', earnings: 52000 },
  ];

  const formatEarnings = (value) => {
    return `₹${(value / 1000).toFixed(0)}k`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const value = data.value;
      const formattedValue = formatEarnings(value);
      
      // Calculate growth trend
      let growthTrend = '';
      if (value > 40000) {
        growthTrend = 'Excellent revenue performance';
      } else if (value > 30000) {
        growthTrend = 'Strong revenue growth';
      } else if (value > 20000) {
        growthTrend = 'Steady revenue stream';
      } else {
        growthTrend = 'Building revenue base';
      }
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-800">{`Month: ${label}`}</p>
          <p className="text-green-600">
            <span className="font-medium">Revenue: </span>
            <span className="font-bold">{formattedValue}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">{growthTrend}</p>
          <p className="text-xs text-gray-500 mt-1">
            Exact amount: ${value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black">Earnings Simulation</h3>
        <p className="text-gray-600 text-sm mt-1">Monthly revenue trends</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              tickFormatter={formatEarnings}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="earnings" 
              stroke="#000000" 
              strokeWidth={3}
              dot={{ fill: '#000000', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#000000', strokeWidth: 2, fill: '#FFFFFF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsChart;
