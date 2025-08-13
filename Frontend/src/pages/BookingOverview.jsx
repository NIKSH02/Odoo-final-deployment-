import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Eye,
  Download,
  RefreshCw,
  Menu,
  DollarSign,
  CreditCard,
} from "lucide-react";
import OwnerSidebar from "../components/OwnerSidebar";
import {
  getVenueBookingsService,
  updateBookingStatusService,
} from "../services/bookingService";
import { useToast } from "../context/ToastContext";

const BookingOverview = () => {
  const { showSuccess, showError, showLoading, dismissToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTimeRange, setFilterTimeRange] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      // For now, we'll use a mock venue ID. In a real app, this would come from user context
      const venueId = "6899f5ee110818fd67dac61e"; // This should come from logged-in venue owner
      const response = await getVenueBookingsService(venueId);

      if (response.data && response.data.success) {
        // The API returns bookings in response.data.data.bookings
        const bookingsData = response.data.data.bookings || [];

        // Transform the data to match expected structure
        const transformedBookings = bookingsData.map((booking) => ({
          ...booking,
          // Add user object if it's just an ID
          user:
            typeof booking.user === "string"
              ? {
                  _id: booking.user,
                  fullName: "Customer", // Placeholder until we get user details
                  email: "customer@example.com", // Placeholder
                }
              : booking.user,
        }));

        setBookings(transformedBookings);
        setFilteredBookings(transformedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showError("Failed to fetch bookings. Please try again.");
      // Fall back to sample data if API fails
      setSampleBookings();
    } finally {
      setLoading(false);
    }
  };

  // Sample bookings fallback
  const setSampleBookings = () => {
    const sampleBookings = [
      {
        _id: "1",
        user: {
          _id: "1",
          fullName: "John Doe",
          email: "john.doe@email.com",
        },
        venue: {
          _id: "1",
          name: "Sports Complex A",
          address: {
            street: "123 Main St",
            city: "Pune",
            state: "MH",
            zipCode: "411001",
          },
        },
        court: {
          _id: "1",
          name: "Badminton Court 1",
          sportType: "badminton",
        },
        bookingDate: "2025-08-11T00:00:00.000Z",
        timeSlot: {
          startTime: "14:00",
          endTime: "16:00",
        },
        duration: 2,
        pricing: {
          basePrice: 600,
          equipmentRental: 0,
          taxes: 108,
          discount: 0,
          totalAmount: 708,
        },
        equipment: [],
        status: "pending",
        paymentStatus: "pending",
        paymentDetails: {
          paymentMethod: "cash",
        },
        createdAt: "2025-08-10T00:00:00.000Z",
      },
      {
        _id: "2",
        user: {
          _id: "2",
          fullName: "Jane Smith",
          email: "jane.smith@email.com",
        },
        venue: {
          _id: "1",
          name: "Sports Complex A",
          address: {
            street: "123 Main St",
            city: "Pune",
            state: "MH",
            zipCode: "411001",
          },
        },
        court: {
          _id: "2",
          name: "Tennis Court 1",
          sportType: "tennis",
        },
        bookingDate: "2025-08-11T00:00:00.000Z",
        timeSlot: {
          startTime: "16:00",
          endTime: "18:00",
        },
        duration: 2,
        pricing: {
          basePrice: 800,
          equipmentRental: 0,
          taxes: 144,
          discount: 0,
          totalAmount: 944,
        },
        equipment: [],
        status: "confirmed",
        paymentStatus: "completed",
        paymentDetails: {
          paymentMethod: "card",
        },
        createdAt: "2025-08-09T00:00:00.000Z",
      },
    ];
    setBookings(sampleBookings);
    setFilteredBookings(sampleBookings);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings based on status, time range, and search term
  useEffect(() => {
    if (!Array.isArray(bookings)) {
      setFilteredBookings([]);
      return;
    }

    let filtered = [...bookings];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((booking) => booking.status === filterStatus);
    }

    // Filter by time range
    const today = new Date();
    if (filterTimeRange !== "all") {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        const diffTime = Math.abs(bookingDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filterTimeRange) {
          case "today":
            return diffDays === 0;
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          (booking.user?.fullName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (booking.user?.email || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (booking.court?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (booking.court?.sportType || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (booking._id || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, filterStatus, filterTimeRange, searchTerm]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "confirmed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "completed":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  // Handle booking acceptance
  const handleAcceptBooking = async (bookingId) => {
    try {
      showLoading("Accepting booking...");
      const response = await updateBookingStatusService(
        bookingId,
        "confirmed",
        "Booking accepted by facility owner"
      );

      if (response.data && response.data.success) {
        showSuccess("Booking accepted successfully!");

        // Update the booking status in the local state
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "confirmed" }
              : booking
          )
        );

        // Refresh bookings to get latest data
        fetchBookings();
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
      showError("Failed to accept booking. Please try again.");
    } finally {
      dismissToast();
    }
  };

  // Handle booking rejection
  const handleRejectBooking = async (
    bookingId,
    reason = "Booking rejected by facility owner"
  ) => {
    try {
      showLoading("Rejecting booking...");
      const response = await updateBookingStatusService(
        bookingId,
        "cancelled",
        reason
      );

      if (response.data && response.data.success) {
        showSuccess("Booking rejected successfully!");

        // Update the booking status in the local state
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );

        // Refresh bookings to get latest data
        fetchBookings();
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      showError("Failed to reject booking. Please try again.");
    } finally {
      dismissToast();
    }
  };

  // Handle booking completion
  const handleCompleteBooking = async (bookingId) => {
    try {
      showLoading("Marking booking as completed...");
      const response = await updateBookingStatusService(
        bookingId,
        "completed",
        "Booking completed"
      );

      if (response.data && response.data.success) {
        showSuccess("Booking marked as completed!");

        // Update the booking status in the local state
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "completed" }
              : booking
          )
        );

        // Refresh bookings to get latest data
        fetchBookings();
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      showError("Failed to complete booking. Please try again.");
    } finally {
      dismissToast();
    }
  };

  const BookingDetailModal = ({ booking, isOpen, onClose }) => {
    if (!isOpen || !booking) return null;

    // Handle backdrop click
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    // Handle escape key
    React.useEffect(() => {
      const handleEscapeKey = (e) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEscapeKey);
        document.body.style.overflow = "hidden"; // Prevent background scrolling
      }

      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
        document.body.style.overflow = "unset";
      };
    }, [isOpen, onClose]);

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Booking Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Booking ID: #{booking._id?.slice(-8)?.toUpperCase()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 text-green-600 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-gray-900 font-medium">
                      {booking.user?.fullName ||
                        `Customer ${booking.user?._id?.slice(-6) || "Unknown"}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {booking.user?.email || "Email not available"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      User ID
                    </label>
                    <p className="text-gray-600 text-sm font-mono">
                      {booking.user?._id || booking.user}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  Booking Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date
                    </label>
                    <p className="text-gray-900 font-medium">
                      {formatDate(booking.bookingDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Time
                    </label>
                    <p className="text-gray-900">
                      {formatTime(booking.timeSlot.startTime)} -{" "}
                      {formatTime(booking.timeSlot.endTime)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Duration
                    </label>
                    <p className="text-gray-900">{booking.duration} hour(s)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Court
                    </label>
                    <p className="text-gray-900">
                      {booking.court.name}
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {booking.court.sportType}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Venue Information */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                  Venue Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Venue Name
                    </label>
                    <p className="text-gray-900 font-medium">
                      {booking.venue.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Address
                    </label>
                    <p className="text-gray-900 text-sm">
                      {booking.venue?.address?.street && (
                        <>
                          {booking.venue.address.street}
                          <br />
                        </>
                      )}
                      {booking.venue?.address?.city &&
                        booking.venue.address.city}
                      {booking.venue?.address?.state &&
                        `, ${booking.venue.address.state}`}
                      {booking.venue?.address?.zipCode &&
                        ` ${booking.venue.address.zipCode}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  Pricing Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="text-gray-900 font-medium">
                      ₹{booking.pricing.basePrice}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equipment Rental:</span>
                    <span className="text-gray-900">
                      ₹{booking.pricing.equipmentRental}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes:</span>
                    <span className="text-gray-900">
                      ₹{booking.pricing.taxes}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-gray-900">
                      -₹{booking.pricing.discount}
                    </span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">
                        Total Amount:
                      </span>
                      <span className="font-bold text-green-600 text-lg">
                        ₹{booking.pricing.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Booking Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center ${getStatusBadge(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        <span className="ml-2">{booking.status}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Payment Status
                    </label>
                    <div className="mt-1">
                      <span className={getStatusBadge(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Payment Method
                    </label>
                    <div className="mt-1 flex items-center">
                      <CreditCard className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-900">
                        {booking.paymentDetails.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 pt-6">
              <div className="flex flex-wrap gap-3">
                {booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleAcceptBooking(booking._id);
                        onClose();
                      }}
                      className="flex items-center space-x-2 px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Accept Booking</span>
                    </button>
                    <button
                      onClick={() => {
                        handleRejectBooking(booking._id);
                        onClose();
                      }}
                      className="flex items-center space-x-2 px-6 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject Booking</span>
                    </button>
                  </>
                )}

                {booking.status === "confirmed" && (
                  <button
                    onClick={() => {
                      handleCompleteBooking(booking._id);
                      onClose();
                    }}
                    className="flex items-center space-x-2 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Completed</span>
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <OwnerSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Booking Overview
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchBookings}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Refresh bookings"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Time Range Filter */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={filterTimeRange}
                  onChange={(e) => setFilterTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, email, or court..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-80 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {!Array.isArray(filteredBookings) ||
              filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No bookings found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No bookings match your current filters.
                  </p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Customer Info */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.user?.fullName ||
                                  `Customer ${
                                    booking.user?._id?.slice(-6) || "Unknown"
                                  }`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.user?.email || "Email not available"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Court & Venue Info */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.court.name}
                              </p>
                              <p className="text-sm text-gray-500 capitalize">
                                {booking.court.sportType}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatDate(booking.bookingDate)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatTime(booking.timeSlot.startTime)} -{" "}
                                {formatTime(booking.timeSlot.endTime)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(booking.status)}
                            <span className={getStatusBadge(booking.status)}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              ₹{booking.pricing.totalAmount}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Accept/Reject buttons for pending bookings */}
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAcceptBooking(booking._id)}
                                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleRejectBooking(booking._id)}
                                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* Complete button for confirmed bookings */}
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() => handleCompleteBooking(booking._id)}
                              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Complete</span>
                            </button>
                          )}

                          {/* View Details button for all bookings */}
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

export default BookingOverview;
