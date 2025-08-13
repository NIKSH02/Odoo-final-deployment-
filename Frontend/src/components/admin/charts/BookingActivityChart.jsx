import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const BookingActivityChart = () => {
  const data = [
    { month: 'Jan', bookings: 120 },
    { month: 'Feb', bookings: 180 },
    { month: 'Mar', bookings: 240 },
    { month: 'Apr', bookings: 220 },
    { month: 'May', bookings: 310 },
    { month: 'Jun', bookings: 280 },
    { month: 'Jul', bookings: 390 },
    { month: 'Aug', bookings: 350 },
    { month: 'Sep', bookings: 420 },
    { month: 'Oct', bookings: 380 },
    { month: 'Nov', bookings: 450 },
    { month: 'Dec', bookings: 520 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-800">{`Month: ${label}`}</p>
          <p className="text-blue-600">
            <span className="font-medium">Bookings: </span>
            <span className="font-bold">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {data.value > 300 ? 'High booking activity' : 
             data.value > 200 ? 'Moderate booking activity' : 
             'Low booking activity'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black">Booking Activity Over Time</h3>
        <p className="text-gray-600 text-sm mt-1">Monthly booking trends</p>
      </div>
      
      <div className="h-80">
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="bookings" 
              stroke="#000000" 
              strokeWidth={2}
              dot={{ fill: '#000000', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#000000', strokeWidth: 2, fill: '#FFFFFF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BookingActivityChart;
