import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  getAllBookingsService,
  getUserBookingHistory,
} from "../../services/adminService";
import toast from "react-hot-toast";
import BookingModal from "./modals/BookingModal";
import FacilityModal from "./modals/FacilityModal";
import ApprovalModal from "./modals/ApprovalModal";

const BookingsManagement = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);

  // Fetch real booking data
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookingsService();
      const bookingData = response.data?.bookings || response.data?.data || [];
      console.log("Fetched bookings:", bookingData);
      console.log("Booking data structure:", bookingData[0]); // Debug log
      setBookings(bookingData);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
      setBookings(getDummyBookings()); // Fallback to dummy data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    setFacilities(dummyFacilities); // Keep dummy facilities for now
  }, []);

  // Dummy data for facility approvals
  const dummyFacilities = [
    {
      id: 1,
      name: "New Sports Arena",
      owner: { name: "Alex Johnson", email: "alex@newsports.com" },
      description: "Modern sports facility with multiple courts",
      address: {
        street: "123 Sports Ave",
        city: "New York",
        state: "NY",
        zipCode: "10001",
      },
      sportsSupported: ["basketball", "tennis", "badminton"],
      amenities: ["parking", "washroom", "cafeteria", "ac"],
      photos: [
        {
          url: "/api/placeholder/400/300",
          caption: "Main entrance",
          isMainPhoto: true,
        },
        { url: "/api/placeholder/400/300", caption: "Basketball court" },
        { url: "/api/placeholder/400/300", caption: "Tennis court" },
      ],
      startingPrice: 50,
      status: "pending",
      createdAt: "2024-08-10T10:00:00Z",
    },
    {
      id: 2,
      name: "Community Recreation Center",
      owner: { name: "Maria Garcia", email: "maria@community.com" },
      description: "Community-focused sports facility with affordable rates",
      address: {
        street: "456 Community Rd",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
      },
      sportsSupported: ["football", "volleyball", "cricket"],
      amenities: ["parking", "washroom", "drinking_water", "equipment_rental"],
      photos: [
        {
          url: "/api/placeholder/400/300",
          caption: "Facility overview",
          isMainPhoto: true,
        },
        { url: "/api/placeholder/400/300", caption: "Football field" },
      ],
      startingPrice: 30,
      status: "pending",
      createdAt: "2024-08-09T15:00:00Z",
    },
  ];

  useEffect(() => {
    fetchBookings();
    setFacilities(dummyFacilities);
  }, []);

  // Dummy data fallback for bookings
  const getDummyBookings = () => [
    {
      _id: "1",
      user: { fullName: "John Doe", email: "john@example.com" },
      venue: { name: "Sports Complex Ltd", _id: "venue1" },
      court: { name: "Basketball Court 1", _id: "court1" },
      bookingDate: "2024-08-15T00:00:00.000+00:00",
      timeSlot: { startTime: "10:00", endTime: "12:00" },
      pricing: { totalAmount: 120 },
      status: "confirmed",
      paymentStatus: "completed",
      createdAt: "2024-08-10T10:00:00Z",
    },
    {
      _id: "2",
      user: { fullName: "Jane Smith", email: "jane@example.com" },
      venue: { name: "Elite Sports Center", _id: "venue2" },
      court: { name: "Tennis Court A", _id: "court2" },
      bookingDate: "2024-08-16T00:00:00.000+00:00",
      timeSlot: { startTime: "14:00", endTime: "16:00" },
      pricing: { totalAmount: 80 },
      status: "pending",
      paymentStatus: "pending",
      createdAt: "2024-08-11T14:00:00Z",
    },
  ];

  const tabs = [
    { id: "bookings", name: "Bookings", count: bookings.length },
    {
      id: "facilities",
      name: "Facility Approvals",
      count: facilities.filter((f) => f.status === "pending").length,
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const userName = booking.user?.fullName || booking.user?.name || "";
    const userEmail = booking.user?.email || "";
    const venueName = booking.venue?.name || "";
    const courtName = booking.court?.name || "";

    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courtName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFacilities = facilities.filter((facility) => {
    const matchesSearch =
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.owner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || facility.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
      case "approved":
        return "bg-gray-100 text-black";
      case "pending":
        return "bg-gray-200 text-gray-600";
      case "cancelled":
      case "rejected":
        return "bg-gray-300 text-gray-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleViewFacility = (facility) => {
    setSelectedFacility(facility);
    setShowFacilityModal(true);
  };

  const handleApprovalAction = (facility, action) => {
    setSelectedFacility(facility);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async (action, comments) => {
    // Here you would make the API call
    console.log(
      `${action} facility ${selectedFacility.id} with comments:`,
      comments
    );

    // Update the facility status locally
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === selectedFacility.id
          ? { ...f, status: action === "approve" ? "approved" : "rejected" }
          : f
      )
    );

    setShowApprovalModal(false);
    setSelectedFacility(null);
    setApprovalAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">
          Bookings & Facilities Management
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor bookings and approve facility registrations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="all">All Status</option>
          {activeTab === "bookings" ? (
            <>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </>
          ) : (
            <>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </>
          )}
        </select>
      </div>

      {/* Content */}
      {activeTab === "bookings" ? (
        <BookingsTable
          bookings={filteredBookings}
          onViewBooking={handleViewBooking}
          getStatusColor={getStatusColor}
          loading={loading}
        />
      ) : (
        <FacilitiesTable
          facilities={filteredFacilities}
          onViewFacility={handleViewFacility}
          onApprovalAction={handleApprovalAction}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Modals */}
      {showBookingModal && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {showFacilityModal && (
        <FacilityModal
          facility={selectedFacility}
          onClose={() => {
            setShowFacilityModal(false);
            setSelectedFacility(null);
          }}
          onApprovalAction={handleApprovalAction}
        />
      )}

      {showApprovalModal && (
        <ApprovalModal
          facility={selectedFacility}
          action={approvalAction}
          onSubmit={handleApprovalSubmit}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedFacility(null);
            setApprovalAction(null);
          }}
        />
      )}
    </div>
  );
};

// Bookings Table Component
const BookingsTable = ({
  bookings,
  onViewBooking,
  getStatusColor,
  loading,
}) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
    {loading ? (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <span className="ml-2 text-gray-600">Loading bookings...</span>
      </div>
    ) : bookings.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-gray-500">No bookings found.</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Venue & Court
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking) => {
              // Helper functions to handle data formatting
              const formatDate = (dateString) => {
                if (!dateString) return "N/A";
                try {
                  return new Date(dateString).toLocaleDateString();
                } catch (error) {
                  return "N/A";
                }
              };

              const getAmount = (booking) => {
                return booking.pricing?.totalAmount || booking.amount || 0;
              };

              return (
                <tr
                  key={booking._id || booking.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-black">
                        #{(booking._id || booking.id).toString().slice(-8)}...
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.user?.fullName || booking.user?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-400">
                        {booking.user?.email || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-black">
                        {booking.venue?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.court?.name || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-black">
                        {formatDate(booking.bookingDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.timeSlot?.startTime || "N/A"} -{" "}
                        {booking.timeSlot?.endTime || "N/A"}
                      </div>
                      {booking.duration && (
                        <div className="text-xs text-gray-400">
                          {booking.duration} hour
                          {booking.duration !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm font-medium text-black">
                        ${getAmount(booking)}
                      </span>
                      {booking.paymentStatus && (
                        <div className="text-xs text-gray-500">
                          Payment: {booking.paymentStatus}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      {booking.paymentStatus &&
                        booking.paymentStatus !== booking.status && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus}
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onViewBooking(booking)}
                      className="text-black hover:text-gray-600 mr-3 flex items-center"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// Facilities Table Component
const FacilitiesTable = ({
  facilities,
  onViewFacility,
  onApprovalAction,
  getStatusColor,
}) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Facility Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sports & Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {facilities.map((facility) => (
            <tr key={facility.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-black">
                    {facility.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {facility.address.city}, {facility.address.state}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-black">
                    {facility.owner.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {facility.owner.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-black">
                    ${facility.startingPrice}/hour
                  </div>
                  <div className="text-sm text-gray-500">
                    {facility.sportsSupported.length} sports
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                    facility.status
                  )}`}
                >
                  {facility.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {new Date(facility.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewFacility(facility)}
                    className="text-black hover:text-gray-600 flex items-center"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </button>
                  {facility.status === "pending" && (
                    <>
                      <button
                        onClick={() => onApprovalAction(facility, "approve")}
                        className="text-black hover:text-gray-600 flex items-center"
                      >
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => onApprovalAction(facility, "reject")}
                        className="text-gray-600 hover:text-black flex items-center"
                      >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default BookingsManagement;
