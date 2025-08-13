import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const FacilityApprovalChart = () => {
  const data = [
    { month: 'Jan', approved: 8, pending: 3, rejected: 1 },
    { month: 'Feb', approved: 12, pending: 5, rejected: 2 },
    { month: 'Mar', approved: 15, pending: 4, rejected: 1 },
    { month: 'Apr', approved: 10, pending: 6, rejected: 3 },
    { month: 'May', approved: 18, pending: 2, rejected: 1 },
    { month: 'Jun', approved: 14, pending: 7, rejected: 2 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, item) => sum + item.value, 0);
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{`Month: ${label}`}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm">
              <span className="font-medium capitalize" style={{ color: item.color }}>
                {item.dataKey}: 
              </span>
              <span className="font-bold ml-1">{item.value}</span>
            </p>
          ))}
          <div className="border-t mt-2 pt-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Total Applications: </span>
              <span className="font-bold">{total}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Approval Rate: {((payload.find(p => p.dataKey === 'approved')?.value || 0) / total * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black">Facility Approval Trend</h3>
        <p className="text-gray-600 text-sm mt-1">Monthly facility approval status</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Bar dataKey="approved" fill="#000000" radius={[2, 2, 0, 0]} />
            <Bar dataKey="pending" fill="#808080" radius={[2, 2, 0, 0]} />
            <Bar dataKey="rejected" fill="#D3D3D3" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-black rounded mr-2"></div>
          <span className="text-sm text-gray-600">Approved</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Pending</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Rejected</span>
        </div>
      </div>
    </div>
  );
};

export default FacilityApprovalChart;
