import React, { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import DashboardOverview from "../components/admin/DashboardOverview";
import UsersManagement from "../components/admin/UsersManagement";
import VenuesManagement from "../components/admin/VenuesManagement";
import BookingsManagement from "../components/admin/BookingsManagement";
import CourtsManagement from "../components/admin/CourtsManagement";
import AdminProfile from "../components/admin/AdminProfile";
import LogoutButton from "../components/LogoutButton";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UsersManagement />;
      case "venues":
        return <VenuesManagement />;
      case "bookings":
        return <BookingsManagement />;
      case "courts":
        return <CourtsManagement />;
      case "profile":
        return <AdminProfile />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header with logout */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-black hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Title for desktop */}
          <h1 className="hidden lg:block text-xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>

          {/* Logout button */}
          <LogoutButton showUserInfo={true} />
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
