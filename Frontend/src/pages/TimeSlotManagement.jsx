import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Home,
  Building,
  Target,
  Users,
  FileText,
  Menu,
  X,
  Settings,
  AlertTriangle,
  Save,
  RotateCcw,
  Loader,
} from "lucide-react";
import { getOwnerCourtsService } from "../services/courtService";
import { getOwnerBookingsService } from "../services/bookingService";
import OwnerSidebar from "../components/OwnerSidebar";

const TimeSlotManagement = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedCourt, setSelectedCourt] = useState("all");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [blockSlotData, setBlockSlotData] = useState({
    courtId: "",
    date: selectedDate,
    startTime: "",
    endTime: "",
    reason: "",
    recurring: false,
  });

  // Load courts and bookings
  useEffect(() => {
    loadCourtsAndBookings();
  }, []);

  // Generate time slots when courts, bookings, or date changes
  useEffect(() => {
    if (courts.length > 0) {
      generateTimeSlots();
    }
  }, [courts, bookings, selectedDate]);

  const loadCourtsAndBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load courts
      const courtsResponse = await getOwnerCourtsService();
      if (courtsResponse?.data?.success && courtsResponse?.data?.data) {
        const courtsData = Array.isArray(courtsResponse.data.data)
          ? courtsResponse.data.data
          : [];
        setCourts(courtsData);
      }

      // Load bookings
      try {
        const bookingsResponse = await getOwnerBookingsService();
        if (bookingsResponse?.data?.success && bookingsResponse?.data?.data) {
          const bookingsData = Array.isArray(bookingsResponse.data.data)
            ? bookingsResponse.data.data
            : [];
          setBookings(bookingsData);
        }
      } catch (bookingError) {
        console.warn("Could not load bookings:", bookingError);
        setBookings([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load courts and bookings");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const groupedSlots = {};
    const selectedDateObj = new Date(selectedDate);

    courts.forEach((court) => {
      if (!court.operatingHours) return;

      const dayName = selectedDateObj
        .toLocaleDateString("en-US", {
          weekday: "long",
        })
        .toLowerCase();
      const dayHours = court.operatingHours[dayName];

      if (!dayHours || !dayHours.isAvailable) return;

      // Initialize court group
      const courtKey = `${court._id}-${court.sportType}`;
      if (!groupedSlots[courtKey]) {
        groupedSlots[courtKey] = {
          courtId: court._id,
          courtName: court.name,
          sport: court.sportType,
          price: court.pricePerHour,
          slots: [],
        };
      }

      // Generate hourly slots from start to end time
      const startHour = parseInt(dayHours.start.split(":")[0]);
      const endHour = parseInt(dayHours.end.split(":")[0]);

      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = `${hour.toString().padStart(2, "0")}:00`;
        const slotEnd = `${(hour + 1).toString().padStart(2, "0")}:00`;

        // Check if slot is booked
        const booking = bookings.find(
          (b) =>
            b.court._id === court._id &&
            new Date(b.bookingDate).toDateString() ===
              selectedDateObj.toDateString() &&
            b.timeSlot.startTime <= slotStart &&
            b.timeSlot.endTime > slotStart &&
            ["confirmed", "pending"].includes(b.status)
        );

        // Check if slot is blocked
        const blocked = court.blockedSlots?.find(
          (bs) =>
            new Date(bs.date).toDateString() ===
              selectedDateObj.toDateString() &&
            bs.startTime <= slotStart &&
            bs.endTime > slotStart
        );

        let status = "available";
        let customer = null;
        let reason = null;

        if (booking) {
          status = booking.status === "confirmed" ? "booked" : "pending";
          customer = booking.user?.name || "Unknown";
        } else if (blocked) {
          status = "blocked";
          reason = blocked.reason;
        }

        groupedSlots[courtKey].slots.push({
          id: `${court._id}-${hour}`,
          time: `${slotStart} - ${slotEnd}`,
          status,
          customer,
          reason,
          booking: booking || null,
        });
      }
    });

    setTimeSlots(Object.values(groupedSlots));
  };

  // Filter time slots based on selected court and date
  const filteredTimeSlots = timeSlots.filter((courtGroup) => {
    if (selectedCourt !== "all" && courtGroup.courtId !== selectedCourt) {
      return false;
    }
    return true;
  });

  // Calculate totals for display
  const getTotalSlotsByStatus = (status) => {
    return filteredTimeSlots.reduce((total, courtGroup) => {
      return (
        total + courtGroup.slots.filter((slot) => slot.status === status).length
      );
    }, 0);
  };

  const handleBlockSlot = async () => {
    if (
      !blockSlotData.courtId ||
      !blockSlotData.startTime ||
      !blockSlotData.endTime ||
      !blockSlotData.reason
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Here you would call an API to block the slot
      // For now, we'll update locally and regenerate slots
      const court = courts.find((c) => c._id === blockSlotData.courtId);
      if (court) {
        if (!court.blockedSlots) court.blockedSlots = [];
        court.blockedSlots.push({
          date: blockSlotData.date,
          startTime: blockSlotData.startTime,
          endTime: blockSlotData.endTime,
          reason: blockSlotData.reason,
        });
        generateTimeSlots();
        setSuccessMessage("Time slot blocked successfully");
      }

      setShowBlockModal(false);
      setBlockSlotData({
        courtId: "",
        date: selectedDate,
        startTime: "",
        endTime: "",
        reason: "",
        recurring: false,
      });
    } catch (error) {
      setError("Failed to block time slot");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockSlot = async (slot, courtGroup) => {
    try {
      setLoading(true);

      // Find and remove the blocked slot
      const court = courts.find((c) => c._id === courtGroup.courtId);
      if (court && court.blockedSlots) {
        const slotTime = slot.time.split(" - ");
        court.blockedSlots = court.blockedSlots.filter(
          (bs) =>
            !(
              new Date(bs.date).toDateString() ===
                new Date(selectedDate).toDateString() &&
              bs.startTime === slotTime[0] &&
              bs.endTime === slotTime[1]
            )
        );
        generateTimeSlots();
        setSuccessMessage("Time slot unblocked successfully");
      }
    } catch (error) {
      setError("Failed to unblock time slot");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockSlotQuick = (slot, courtGroup) => {
    const slotTime = slot.time.split(" - ");
    setBlockSlotData({
      courtId: courtGroup.courtId,
      date: selectedDate,
      startTime: slotTime[0],
      endTime: slotTime[1],
      reason: "",
      recurring: false,
    });
    setShowBlockModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "booked":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return <Clock className="h-4 w-4 mr-1" />;
      case "booked":
        return <Users className="h-4 w-4 mr-1" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case "blocked":
        return <X className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <OwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Time Slot Management
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBlockModal(true)}
                disabled={courts.length === 0}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                <span>Block Time Slot</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 text-green-400">✓</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-6">
              <Loader className="animate-spin h-8 w-8 text-gray-900 mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          )}
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court
                </label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="all">All Courts</option>
                  {Array.isArray(courts) &&
                    courts.map((court) => (
                      <option key={court._id} value={court._id}>
                        {court.name} ({court.sportType})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Time Slots Grid */}
          {!loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Time Slots for {new Date(selectedDate).toLocaleDateString()}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                      <span>
                        Available ({getTotalSlotsByStatus("available")})
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                      <span>Booked ({getTotalSlotsByStatus("booked")})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-100 rounded mr-2"></div>
                      <span>Pending ({getTotalSlotsByStatus("pending")})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
                      <span>Blocked ({getTotalSlotsByStatus("blocked")})</span>
                    </div>
                  </div>
                </div>

                {filteredTimeSlots.length > 0 ? (
                  <div className="space-y-6">
                    {filteredTimeSlots.map((courtGroup) => (
                      <div
                        key={courtGroup.courtId}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Court Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {courtGroup.courtName}
                              </h3>
                              <p className="text-sm text-gray-600 capitalize">
                                {courtGroup.sport} • ₹{courtGroup.price}/hr
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {courtGroup.slots.length} slots
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Time Slots Grid */}
                        <div className="p-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {courtGroup.slots.map((slot, index) => (
                              <div
                                key={slot.id}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                  slot.status === "available"
                                    ? "border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100"
                                    : slot.status === "booked"
                                    ? "border-blue-200 bg-blue-50"
                                    : slot.status === "pending"
                                    ? "border-yellow-200 bg-yellow-50"
                                    : "border-red-200 bg-red-50"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {slot.time}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded ${getStatusColor(
                                      slot.status
                                    )}`}
                                  >
                                    {getStatusIcon(slot.status)}
                                  </span>
                                </div>

                                {slot.customer && (
                                  <div className="text-xs text-gray-600 mb-2">
                                    <Users className="h-3 w-3 inline mr-1" />
                                    {slot.customer}
                                  </div>
                                )}

                                {slot.reason && (
                                  <div className="text-xs text-red-600 mb-2">
                                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                                    {slot.reason}
                                  </div>
                                )}

                                <div className="flex justify-end">
                                  {slot.status === "blocked" && (
                                    <button
                                      onClick={() =>
                                        handleUnblockSlot(slot, courtGroup)
                                      }
                                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                                      title="Unblock slot"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                    </button>
                                  )}
                                  {slot.status === "available" && (
                                    <button
                                      onClick={() =>
                                        handleBlockSlotQuick(slot, courtGroup)
                                      }
                                      className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                                      title="Block slot"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No time slots
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {courts.length === 0
                        ? "No courts available. Please add courts first."
                        : "No time slots available for the selected date and court."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Block Time Slot Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Block Time Slot
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court
                </label>
                <select
                  value={blockSlotData.courtId}
                  onChange={(e) =>
                    setBlockSlotData({
                      ...blockSlotData,
                      courtId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Select Court</option>
                  {courts.map((court) => (
                    <option key={court._id} value={court._id}>
                      {court.name} ({court.sportType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={blockSlotData.date}
                  onChange={(e) =>
                    setBlockSlotData({ ...blockSlotData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={blockSlotData.startTime}
                    onChange={(e) =>
                      setBlockSlotData({
                        ...blockSlotData,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={blockSlotData.endTime}
                    onChange={(e) =>
                      setBlockSlotData({
                        ...blockSlotData,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Blocking
                </label>
                <textarea
                  value={blockSlotData.reason}
                  onChange={(e) =>
                    setBlockSlotData({
                      ...blockSlotData,
                      reason: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter reason for blocking this time slot..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={blockSlotData.recurring}
                  onChange={(e) =>
                    setBlockSlotData({
                      ...blockSlotData,
                      recurring: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="recurring"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Recurring (apply to multiple dates)
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockSlot}
                className="px-4 py-2 bg-gray-900 border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-800"
              >
                Block Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotManagement;
