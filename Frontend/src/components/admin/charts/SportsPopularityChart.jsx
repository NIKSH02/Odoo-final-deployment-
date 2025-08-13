import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const SportsPopularityChart = () => {
  const data = [
    { name: 'Football', value: 35, color: '#000000' },
    { name: 'Basketball', value: 25, color: '#404040' },
    { name: 'Tennis', value: 20, color: '#808080' },
    { name: 'Badminton', value: 12, color: '#A0A0A0' },
    { name: 'Others', value: 8, color: '#D3D3D3' },
  ];

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-800">{`Sport: ${data.name}`}</p>
          <p className="text-blue-600">
            <span className="font-medium">Bookings: </span>
            <span className="font-bold">{data.value}%</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {data.value > 30 ? 'Most popular sport' : 
             data.value > 20 ? 'Very popular sport' : 
             data.value > 10 ? 'Popular sport' : 
             'Growing sport category'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black">Most Active Sports</h3>
        <p className="text-gray-600 text-sm mt-1">Booking distribution by sport type</p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                color: '#374151'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SportsPopularityChart;
