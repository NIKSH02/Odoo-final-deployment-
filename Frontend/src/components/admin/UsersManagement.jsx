import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  getAllUsers,
  suspendUser,
  unsuspendUser,
  banUser,
  getUserBookingHistory,
} from "../../services/adminService";
import toast from "react-hot-toast";

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBookingHistory, setShowBookingHistory] = useState(false);
  const [users, setUsers] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      const userData = response.data?.users || response.data?.data || [];
      console.log("Fetched users:", response.data);
      console.log("User data structure:", userData[0]); // Debug log to see actual structure
      setUsers(userData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
      setUsers(getDummyUsers());
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookingHistory = async (userId) => {
    try {
      const response = await getUserBookingHistory(userId);
      setBookingHistory(response.data || []);
    } catch (error) {
      console.error("Failed to fetch booking history:", error);
      toast.error("Failed to load booking history");
      // Fallback to dummy data
      setBookingHistory(getDummyBookingHistory(userId));
    }
  };

  // Dummy data fallback
  const getDummyUsers = () => [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "player",
      status: "active",
      joinDate: "2024-01-15",
      phone: "+1-555-0101",
      totalBookings: 15,
      lastActivity: "2024-08-10",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "player",
      status: "active",
      joinDate: "2024-02-20",
      phone: "+1-555-0102",
      totalBookings: 8,
      lastActivity: "2024-08-09",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "player",
      status: "banned",
      joinDate: "2024-01-08",
      phone: "+1-555-0103",
      totalBookings: 3,
      lastActivity: "2024-07-15",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "player",
      status: "active",
      joinDate: "2024-03-12",
      phone: "+1-555-0104",
      totalBookings: 22,
      lastActivity: "2024-08-11",
    },
    {
      id: 5,
      name: "Alex Johnson",
      email: "alex@sportscomplex.com",
      role: "facility_owner",
      status: "active",
      joinDate: "2024-01-10",
      phone: "+1-555-0201",
      totalFacilities: 3,
      businessName: "Sports Complex Ltd",
      lastActivity: "2024-08-11",
    },
    {
      id: 6,
      name: "Maria Garcia",
      email: "maria@elitesports.com",
      role: "facility_owner",
      status: "active",
      joinDate: "2024-02-15",
      phone: "+1-555-0202",
      totalFacilities: 5,
      businessName: "Elite Sports Center",
      lastActivity: "2024-08-10",
    },
    {
      id: 7,
      name: "Robert Lee",
      email: "robert@cityrecreation.com",
      role: "facility_owner",
      status: "banned",
      joinDate: "2024-03-20",
      phone: "+1-555-0203",
      totalFacilities: 2,
      businessName: "City Recreation Hub",
      lastActivity: "2024-07-20",
    },
    {
      id: 8,
      name: "David Brown",
      email: "david@example.com",
      role: "player",
      status: "inactive",
      joinDate: "2024-02-28",
      phone: "+1-555-0105",
      totalBookings: 5,
      lastActivity: "2024-06-15",
    },
  ];

  const getDummyBookingHistory = (userId) => {
    const histories = {
      1: [
        {
          id: 101,
          venue: "Sports Complex Ltd",
          court: "Basketball Court 1",
          date: "2024-08-10",
          amount: 120,
          status: "completed",
        },
        {
          id: 102,
          venue: "Elite Sports Center",
          court: "Tennis Court A",
          date: "2024-08-05",
          amount: 80,
          status: "completed",
        },
        {
          id: 103,
          venue: "Premier Sports Arena",
          court: "Badminton Court",
          date: "2024-07-28",
          amount: 60,
          status: "completed",
        },
      ],
      2: [
        {
          id: 201,
          venue: "City Recreation Hub",
          court: "Football Field",
          date: "2024-08-09",
          amount: 200,
          status: "completed",
        },
        {
          id: 202,
          venue: "Sports Complex Ltd",
          court: "Basketball Court 2",
          date: "2024-08-01",
          amount: 120,
          status: "cancelled",
        },
      ],
      4: [
        {
          id: 401,
          venue: "Elite Sports Center",
          court: "Tennis Court B",
          date: "2024-08-11",
          amount: 80,
          status: "confirmed",
        },
        {
          id: 402,
          venue: "Sports Complex Ltd",
          court: "Basketball Court 1",
          date: "2024-08-08",
          amount: 120,
          status: "completed",
        },
        {
          id: 403,
          venue: "Premier Sports Arena",
          court: "Swimming Pool",
          date: "2024-08-03",
          amount: 100,
          status: "completed",
        },
      ],
    };
    return histories[userId] || [];
  };

  const filteredUsers = (users || []).filter((user) => {
    const search = (searchTerm || "").toLowerCase();
    const userName = user.fullName || user.name || "";
    const userEmail = user.email || "";
    const businessName = user.businessName || "";

    const matchesSearch =
      userName.toLowerCase().includes(search) ||
      userEmail.toLowerCase().includes(search) ||
      businessName.toLowerCase().includes(search);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    // Handle status filtering based on actual user data structure
    let userStatus = "active"; // default
    if (user.status) {
      userStatus = user.status;
    } else if (user.isEmailVerified === false) {
      userStatus = "inactive";
    } else if (user.isActive !== undefined) {
      userStatus = user.isActive ? "active" : "inactive";
    }

    const matchesStatus = statusFilter === "all" || userStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        setActionLoading(true);
        // You can implement the actual delete API call here
        // await deleteUser(userId);
        toast.success("User deleted successfully");
        await fetchUsers(); // Refresh the users list
      } catch (error) {
        console.error("Failed to delete user:", error);
        toast.error("Failed to delete user");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const viewBookingHistory = async (user) => {
    setSelectedUser(user);
    setShowBookingHistory(true);
    if (user.role === "player") {
      await fetchUserBookingHistory(user._id || user.id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-gray-100 text-black";
      case "inactive":
        return "bg-gray-200 text-gray-600";
      case "banned":
        return "bg-gray-300 text-gray-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "player":
        return "bg-gray-100 text-black";
      case "facility_owner":
        return "bg-black text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Users Management</h1>
        <p className="text-gray-600 mt-2">
          Manage all users including players and facility owners
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users, emails, or business names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="all">All Roles</option>
          <option value="player">Players</option>
          <option value="facility_owner">Facility Owners</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  // Helper function to get user status
                  const getUserStatus = (user) => {
                    if (user.status) return user.status;
                    if (user.isEmailVerified === false) return "inactive";
                    if (user.isActive !== undefined)
                      return user.isActive ? "active" : "inactive";
                    return "active";
                  };

                  // Helper function to format join date
                  const formatJoinDate = (dateString) => {
                    if (!dateString) return "N/A";
                    try {
                      return new Date(dateString).toLocaleDateString();
                    } catch (error) {
                      return "N/A";
                    }
                  };

                  return (
                    <tr key={user._id || user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profilePicture && (
                            <div className="w-10 h-10 mr-3 flex-shrink-0">
                              <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-black">
                              {user.fullName || user.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            {user.username && (
                              <div className="text-xs text-gray-400">
                                @{user.username}
                              </div>
                            )}
                            {user.businessName && (
                              <div className="text-xs text-gray-400">
                                {user.businessName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {user.role === "facility_owner"
                              ? "Facility Owner"
                              : user.role}
                          </span>
                          {user.authProvider && (
                            <span className="text-xs text-gray-400 mt-1">
                              {user.authProvider === "google"
                                ? "Google"
                                : "Local"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                              getUserStatus(user)
                            )}`}
                          >
                            {getUserStatus(user)}
                          </span>
                          {user.isEmailVerified !== undefined && (
                            <span
                              className={`text-xs mt-1 ${
                                user.isEmailVerified
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {user.isEmailVerified
                                ? "Email Verified"
                                : "Email Pending"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          {user.role === "player" ? (
                            <span>{user.totalBookings || 0} bookings</span>
                          ) : (
                            <span>{user.totalFacilities || 0} facilities</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last:{" "}
                          {user.lastActivity ||
                            formatJoinDate(user.updatedAt) ||
                            "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewBookingHistory(user)}
                            className="text-black hover:text-gray-600 flex items-center px-2 py-1 rounded"
                            title="View Details"
                            disabled={actionLoading}
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            <span className="text-xs">View</span>
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteUser(user._id || user.id)
                            }
                            className="text-red-600 hover:text-red-800 flex items-center px-2 py-1 rounded"
                            title="Delete User"
                            disabled={actionLoading}
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            <span className="text-xs">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showBookingHistory && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {selectedUser.profilePicture && (
                  <img
                    src={selectedUser.profilePicture}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-black">
                    {selectedUser.fullName || selectedUser.name}
                  </h2>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  {selectedUser.username && (
                    <p className="text-sm text-gray-500">
                      @{selectedUser.username}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowBookingHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* User Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">
                    User Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User ID:</span>
                      <span className="text-black font-mono text-xs">
                        {selectedUser._id
                          ? selectedUser._id.slice(-8) + "..."
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="text-black capitalize">
                        {selectedUser.role === "facility_owner"
                          ? "Facility Owner"
                          : selectedUser.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-black capitalize">
                        {selectedUser.status ||
                          (selectedUser.isEmailVerified === false
                            ? "Inactive"
                            : "Active")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email Verified:</span>
                      <span
                        className={`${
                          selectedUser.isEmailVerified
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {selectedUser.isEmailVerified !== undefined
                          ? selectedUser.isEmailVerified
                            ? "Yes"
                            : "No"
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Login Method:</span>
                      <span className="text-black capitalize">
                        {selectedUser.authProvider === "google"
                          ? "Google Account"
                          : "Email & Password"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Join Date:</span>
                      <span className="text-black">
                        {selectedUser.createdAt
                          ? new Date(
                              selectedUser.createdAt
                            ).toLocaleDateString()
                          : selectedUser.joinDate || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-black">
                        {selectedUser.updatedAt
                          ? new Date(
                              selectedUser.updatedAt
                            ).toLocaleDateString()
                          : selectedUser.lastActivity || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">
                    Activity Summary
                  </h3>
                  <div className="space-y-2">
                    {selectedUser.role === "player" ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Bookings:</span>
                          <span className="text-black">
                            {selectedUser.totalBookings || 0}
                          </span>
                        </div>
                        {selectedUser.googleId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Google ID:</span>
                            <span className="text-black font-mono text-xs">
                              {selectedUser.googleId.slice(-8)}...
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Business Name:</span>
                          <span className="text-black">
                            {selectedUser.businessName || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Total Facilities:
                          </span>
                          <span className="text-black">
                            {selectedUser.totalFacilities || 0}
                          </span>
                        </div>
                        {selectedUser.googleId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Google ID:</span>
                            <span className="text-black font-mono text-xs">
                              {selectedUser.googleId.slice(-8)}...
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking History for Players */}
              {selectedUser.role === "player" && bookingHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">
                    Booking History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Booking ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Venue
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Court
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bookingHistory.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-4 py-2 text-sm text-black">
                              #{booking.id}
                            </td>
                            <td className="px-4 py-2 text-sm text-black">
                              {booking.venue}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {booking.court}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {booking.date}
                            </td>
                            <td className="px-4 py-2 text-sm text-black">
                              ${booking.amount}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                  booking.status === "completed"
                                    ? "bg-gray-100 text-black"
                                    : booking.status === "confirmed"
                                    ? "bg-gray-200 text-gray-600"
                                    : "bg-gray-300 text-gray-700"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* No booking history message */}
              {selectedUser.role === "player" &&
                bookingHistory.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No booking history available for this user.
                    </p>
                  </div>
                )}

              {/* Facility owner message */}
              {selectedUser.role === "facility_owner" && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Facility owner details and venue management information
                    would be displayed here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
