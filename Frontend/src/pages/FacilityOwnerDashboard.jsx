import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  Settings,
  Building,
  Target,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ChevronRight,
  Star,
  Menu,
  X,
  Home,
  FileText,
} from "lucide-react";
import LogoutButton from "../components/LogoutButton";

const FacilityOwnerDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("weekly");
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    activeCourts: 0,
    totalEarnings: 0,
    upcomingBookings: 0,
  });

  // Sidebar navigation items
  const sidebarItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Home,
      path: "/facility-owner-dashboard",
      current: true,
    },
    {
      id: "bookings",
      name: "Booking Overview",
      icon: Calendar,
      path: "/booking-overview",
      current: false,
    },
    {
      id: "facilities",
      name: "Facility Management",
      icon: Building,
      path: "/facility-management",
      current: false,
    },
    {
      id: "courts",
      name: "Court Management",
      icon: Target,
      path: "/court-management",
      current: false,
    },
    {
      id: "timeslots",
      name: "Time Slot Management",
      icon: Clock,
      path: "/time-slot-management",
      current: false,
    },
    {
      id: "profile",
      name: "Owner Profile",
      icon: Users,
      path: "/owner-profile",
      current: false,
    },
  ];

  // Sample data - in real app, this would come from API
  useEffect(() => {
    const sampleData = {
      totalBookings: 247,
      activeCourts: 8,
      totalEarnings: 45750,
      upcomingBookings: 23,
    };
    setDashboardData(sampleData);
  }, []);

  // Chart data configurations - Simplified visual data
  const bookingTrendsData = {
    daily: [
      { label: "Mon", value: 12, percentage: 40 },
      { label: "Tue", value: 19, percentage: 63 },
      { label: "Wed", value: 15, percentage: 50 },
      { label: "Thu", value: 25, percentage: 83 },
      { label: "Fri", value: 22, percentage: 73 },
      { label: "Sat", value: 30, percentage: 100 },
      { label: "Sun", value: 28, percentage: 93 },
    ],
    weekly: [
      { label: "Week 1", value: 85, percentage: 89 },
      { label: "Week 2", value: 92, percentage: 97 },
      { label: "Week 3", value: 78, percentage: 82 },
      { label: "Week 4", value: 95, percentage: 100 },
    ],
    monthly: [
      { label: "Jan", value: 320, percentage: 76 },
      { label: "Feb", value: 280, percentage: 67 },
      { label: "Mar", value: 340, percentage: 81 },
      { label: "Apr", value: 390, percentage: 93 },
      { label: "May", value: 420, percentage: 100 },
      { label: "Jun", value: 380, percentage: 90 },
    ],
  };

  const earningsData = [
    {
      sport: "Badminton",
      earnings: 15000,
      percentage: 100,
      color: "bg-gray-900",
    },
    { sport: "Tennis", earnings: 12000, percentage: 80, color: "bg-gray-700" },
    { sport: "Football", earnings: 8000, percentage: 53, color: "bg-gray-500" },
    {
      sport: "Basketball",
      earnings: 6000,
      percentage: 40,
      color: "bg-gray-400",
    },
    { sport: "Cricket", earnings: 4750, percentage: 32, color: "bg-gray-300" },
  ];

  const peakHoursData = [
    { hour: "6AM", bookings: 2, percentage: 4 },
    { hour: "8AM", bookings: 8, percentage: 18 },
    { hour: "10AM", bookings: 15, percentage: 33 },
    { hour: "12PM", bookings: 25, percentage: 56 },
    { hour: "2PM", bookings: 20, percentage: 44 },
    { hour: "4PM", bookings: 35, percentage: 78 },
    { hour: "6PM", bookings: 45, percentage: 100 },
    { hour: "8PM", bookings: 30, percentage: 67 },
    { hour: "10PM", bookings: 12, percentage: 27 },
  ];

  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      action: "New booking",
      details: "Badminton Court 1 - 2PM to 4PM",
      time: "2 min ago",
      type: "booking",
    },
    {
      id: 2,
      action: "Payment received",
      details: "₹600 from John Doe",
      time: "15 min ago",
      type: "payment",
    },
    {
      id: 3,
      action: "Court maintenance",
      details: "Tennis Court 2 scheduled",
      time: "1 hour ago",
      type: "maintenance",
    },
    {
      id: 4,
      action: "New booking",
      details: "Football Ground - 6PM to 8PM",
      time: "2 hours ago",
      type: "booking",
    },
  ];

  // Upcoming bookings data
  const upcomingBookings = [
    {
      id: 1,
      court: "Badminton Court 1",
      time: "2:00 PM - 4:00 PM",
      customer: "John Doe",
      amount: 600,
    },
    {
      id: 2,
      court: "Tennis Court 1",
      time: "4:00 PM - 6:00 PM",
      customer: "Jane Smith",
      amount: 800,
    },
    {
      id: 3,
      court: "Football Ground",
      time: "6:00 PM - 8:00 PM",
      customer: "Team Alpha",
      amount: 1200,
    },
    {
      id: 4,
      court: "Basketball Court",
      time: "8:00 PM - 10:00 PM",
      customer: "Mike Johnson",
      amount: 500,
    },
  ];

  // eslint-disable-next-line no-unused-vars
  const KPICard = ({ title, value, icon: Icon, trend, trendValue }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div
              className={`flex items-center mt-3 text-sm ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              <ArrowUpRight
                className={`w-4 h-4 mr-1 ${
                  trend === "down" ? "rotate-90" : ""
                }`}
              />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gray-100`}>
          <Icon className="w-8 h-8 text-gray-700" />
        </div>
      </div>
    </div>
  );

  // Sidebar component
  const Sidebar = () => (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Owner Portal</h2>
        <p className="text-gray-600 text-sm mt-1">Facility Management</p>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    item.current
                      ? "bg-black text-white font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back! Here's what's happening with your facilities.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/facility-management")}
                  className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Building className="w-4 h-4" />
                  <span className="hidden sm:inline">Quick Add Venue</span>
                </button>
                <button
                  onClick={() => navigate("/court-management")}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Quick Add Court</span>
                </button>
                <LogoutButton showUserInfo={false} variant="minimal" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 overflow-y-auto h-[calc(100vh-120px)]">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Bookings"
              value={dashboardData.totalBookings}
              icon={Calendar}
              trend="up"
              trendValue="+12% from last month"
            />
            <KPICard
              title="Active Courts"
              value={dashboardData.activeCourts}
              icon={Target}
              trend="up"
              trendValue="+2 new courts"
            />
            <KPICard
              title="Total Earnings"
              value={`₹${dashboardData.totalEarnings.toLocaleString()}`}
              icon={TrendingUp}
              trend="up"
              trendValue="+18% from last month"
            />
            <KPICard
              title="Upcoming Bookings"
              value={dashboardData.upcomingBookings}
              icon={Clock}
              trend="up"
              trendValue="Today"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Booking Trends */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Booking Trends
                  </h3>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="h-64 flex items-end space-x-2 px-4">
                {bookingTrendsData[timeRange].map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-black rounded-t transition-all duration-500 hover:bg-gray-700"
                      style={{ height: `${item.percentage}%` }}
                    />
                    <div className="mt-2 text-xs text-gray-600 text-center">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-gray-500">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings by Sport */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <PieChart className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Earnings by Sport
                </h3>
              </div>
              <div className="h-64 flex flex-col justify-center space-y-4">
                {earningsData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-20 text-sm font-medium text-gray-700">
                      {item.sport}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm font-semibold text-gray-900">
                      ₹{item.earnings.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hours Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                Peak Booking Hours
              </h3>
            </div>
            <div className="h-64 flex items-end space-x-1 px-4">
              {peakHoursData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-black rounded-t transition-all duration-500 hover:bg-gray-700"
                    style={{ height: `${item.percentage}%` }}
                  />
                  <div className="mt-2 text-xs text-gray-600 text-center">
                    <div className="font-medium">{item.hour}</div>
                    <div className="text-gray-500">{item.bookings}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activities
                </h3>
                <button className="text-black hover:text-gray-600 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "booking"
                          ? "bg-green-500"
                          : activity.type === "payment"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Today's Bookings
                </h3>
                <button className="text-black hover:text-gray-600 text-sm font-medium">
                  View Calendar
                </button>
              </div>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {booking.court}
                      </p>
                      <p className="text-xs text-gray-600">{booking.time}</p>
                      <p className="text-xs text-gray-500">
                        {booking.customer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{booking.amount}
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/facility-management")}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Building className="w-6 h-6 text-gray-700" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Add New Venue</p>
                  <p className="text-sm text-gray-600">
                    Create a new sports facility
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate("/court-management")}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Target className="w-6 h-6 text-gray-700" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Add New Court</p>
                  <p className="text-sm text-gray-600">
                    Add courts to existing venues
                  </p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Star className="w-6 h-6 text-gray-700" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">View Reports</p>
                  <p className="text-sm text-gray-600">
                    Detailed analytics & insights
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Close the main content div and the outer container div */}
        </div>
      </div>
    </div>
  );
};

export default FacilityOwnerDashboard;
