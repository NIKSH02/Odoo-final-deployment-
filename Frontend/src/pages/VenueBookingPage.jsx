import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  Plus,
  Minus,
  X,
  MapPin,
  Star,
} from "lucide-react";
import { getVenueByIdService } from "../services/venueService";
import {
  getSportsWithCourtCountsService,
  getCourtAvailabilityBySportService,
} from "../services/courtService";
import {
  createBookingService,
  getVenueBookingsByDateService,
} from "../services/bookingService";

// Calendar Modal Component
const CalendarModal = ({ isOpen, onClose, selectedDate, onDateSelect }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [displayYear, setDisplayYear] = useState(currentYear);

  if (!isOpen) return null;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (day) => {
    const date = new Date(displayYear, displayMonth, day);
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return date < todayStart;
  };

  const isDateSelected = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === displayMonth &&
      selectedDate.getFullYear() === displayYear
    );
  };

  const handleDateClick = (day) => {
    if (isDateDisabled(day)) return;
    const newDate = new Date(displayYear, displayMonth, day);
    onDateSelect(newDate);
    onClose();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isDisabled = isDateDisabled(day);
      const isSelected = isDateSelected(day);
      const isToday =
        today.getDate() === day &&
        today.getMonth() === displayMonth &&
        today.getFullYear() === displayYear;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
          className={`w-10 h-10 text-sm rounded-lg font-medium transition-all duration-200 ${
            isSelected
              ? "bg-black text-white shadow-md transform scale-105"
              : isToday
              ? "bg-gray-200 text-black font-bold ring-2 ring-gray-400"
              : isDisabled
              ? "text-gray-300 cursor-not-allowed hover:bg-transparent"
              : "hover:bg-gray-100 text-gray-700 hover:shadow-sm"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear(displayYear - 1);
      } else {
        setDisplayMonth(displayMonth - 1);
      }
    } else {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear(displayYear + 1);
      } else {
        setDisplayMonth(displayMonth + 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl transform animate-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-xl font-bold text-gray-900">
              {months[displayMonth]} {displayYear}
            </h3>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
            Select a date from today onwards
          </p>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
        </div>
      </div>
    </div>
  );
};

// Time Slot Modal Component
const TimeSlotModal = ({
  isOpen,
  onClose,
  selectedTime,
  onTimeSelect,
  selectedDate,
  venue,
  selectedSport,
}) => {
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch existing bookings for the selected date
  useEffect(() => {
    if (!isOpen || !selectedDate || !venue?._id) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await getVenueBookingsByDateService(
          venue._id,
          selectedDate
        );
        console.log('Fetched bookings response:', response?.data);
        setExistingBookings(response?.data?.bookings || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setExistingBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isOpen, selectedDate, venue?._id]);

  if (!isOpen) return null;

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();

    const isToday =
      selectedDate &&
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();

    // Get operating hours for the selected day
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[selectedDate?.getDay() || 0];
    const operatingHours = venue?.operatingHours?.[dayName];

    if (!operatingHours || !operatingHours.isOpen) {
      return []; // Venue is closed on this day
    }

    // Parse operating hours
    const openTime = operatingHours.open; // e.g., "09:00"
    const closeTime = operatingHours.close; // e.g., "22:00"

    const openHour = parseInt(openTime.split(":")[0]);
    const closeHour = parseInt(closeTime.split(":")[0]);

    // Generate slots within operating hours
    for (let hour = openHour; hour < closeHour; hour++) {
      const slotDate = new Date(
        selectedDate ? selectedDate.getFullYear() : now.getFullYear(),
        selectedDate ? selectedDate.getMonth() : now.getMonth(),
        selectedDate ? selectedDate.getDate() : now.getDate(),
        hour,
        0,
        0,
        0
      );

      // Format display time in 12-hour clock
      let displayHour = hour % 12 || 12;
      let ampm = hour < 12 ? "AM" : "PM";
      const displayTime = `${displayHour}:00 ${ampm}`;

      // Format time in 24-hour format for API
      const apiTime = `${hour.toString().padStart(2, "0")}:00`;

      // Disable past times if today
      const isPastTime = isToday && slotDate.getTime() <= now.getTime();

      // Check if this slot conflicts with existing bookings for the selected sport
      const sportSpecificBookings = existingBookings.filter((booking) => {
        // If sport is selected, only consider bookings for that sport
        if (selectedSport) {
          return booking.court?.sportType === selectedSport;
        }
        return true; // If no sport selected, consider all bookings
      });

      // Count how many courts of the selected sport type are booked at this time
      const bookedCourtsCount = sportSpecificBookings.filter((booking) => {
        const bookingStartTime = booking.timeSlot?.startTime; // e.g., "09:00"
        const bookingEndTime = booking.timeSlot?.endTime; // e.g., "10:00"

        if (!bookingStartTime || !bookingEndTime) return false;

        const bookingStartHour = parseInt(bookingStartTime.split(":")[0]);
        const bookingEndHour = parseInt(bookingEndTime.split(":")[0]);

        // Check if the current hour slot overlaps with the booking
        return hour >= bookingStartHour && hour < bookingEndHour;
      }).length;

      // Get total courts available for the selected sport
      const sportsDataArray = Array.isArray(venue?.sportsWithCounts) ? venue.sportsWithCounts : 
                              (venue?.sportsWithCounts?.sports || []);
      console.log('Sports data array:', sportsDataArray);
      console.log('Selected sport:', selectedSport);
      
      const sportData = sportsDataArray.find(s => s._id === selectedSport);
      const totalCourtsForSport = sportData?.courtCount || 0;
      
      console.log(`Slot ${apiTime}: Booked courts: ${bookedCourtsCount}, Total courts: ${totalCourtsForSport}`);

      // Determine if slot is available - only consider it unavailable if we have no courts available
      const isFullyBooked = selectedSport && totalCourtsForSport > 0 && (bookedCourtsCount >= totalCourtsForSport);
      const isUnavailable = isPastTime || isFullyBooked;

      let reason = null;
      if (isPastTime) reason = "Past time";
      else if (isFullyBooked) reason = `All ${selectedSport} courts booked`;

      slots.push({
        time: displayTime,
        value: apiTime,
        disabled: isUnavailable,
        reason: reason,
        availableCourts: selectedSport ? Math.max(0, totalCourtsForSport - bookedCourtsCount) : 0,
        totalCourts: totalCourtsForSport,
      });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // If venue is closed on selected day
  if (timeSlots.length === 0) {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[selectedDate?.getDay() || 0];

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Select Time</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Venue Closed
            </h4>
            <p className="text-gray-600">
              This venue is closed on {dayName}s. Please select a different
              date.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Select Time</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading available time slots...</p>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-medium">Note:</span> Start time must be
                  in the future.
                  <br />
                  Unavailable slots are shown in gray and cannot be selected.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => !slot.disabled && onTimeSelect(slot.value)}
                    disabled={slot.disabled}
                    className={`p-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
                      selectedTime === slot.value
                        ? "bg-black text-white border-black shadow-lg transform scale-105"
                        : slot.disabled
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{slot.time}</span>
                      {selectedSport && slot.totalCourts > 0 && (
                        <span className={`text-xs mt-1 ${
                          slot.disabled 
                            ? 'text-gray-400' 
                            : slot.availableCourts === 0 
                              ? 'text-red-500' 
                              : slot.availableCourts <= 2 
                                ? 'text-orange-500' 
                                : 'text-green-500'
                        }`}>
                          {slot.availableCourts}/{slot.totalCourts} courts
                        </span>
                      )}
                      {slot.reason && (
                        <span className="text-xs text-gray-400 mt-1">
                          {slot.reason}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Booking Page Component
const VenueBookingPage = () => {
  const { id: venueId } = useParams();
  const navigate = useNavigate();

  // State for venue and sports data
  const [venue, setVenue] = useState(null);
  const [sportsData, setSportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking form state
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [selectedCourt, setSelectedCourt] = useState("");
  const [availableCourts, setAvailableCourts] = useState([]);
  const [courtAvailability, setCourtAvailability] = useState(null);

  // Modal states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [showCourtDropdown, setShowCourtDropdown] = useState(false);

  // Booking process state
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch venue and sports data
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true);

        // Fetch venue details
        const venueResponse = await getVenueByIdService(venueId);
        setVenue(venueResponse.data.data.venue); // Fix: access venue property

        // Fetch sports with court counts
        const sportsResponse = await getSportsWithCourtCountsService(venueId);
        setSportsData(
          sportsResponse.data.data.sports || sportsResponse.data.data
        );

        // Set first sport as default if available
        if (
          sportsResponse.data.data.sports &&
          sportsResponse.data.data.sports.length > 0
        ) {
          setSelectedSport(sportsResponse.data.data.sports[0]._id);
        } else if (
          sportsResponse.data.data &&
          sportsResponse.data.data.length > 0
        ) {
          setSelectedSport(sportsResponse.data.data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching venue data:", err);
        setError(err.response?.data?.message || "Failed to fetch venue data");
      } finally {
        setLoading(false);
      }
    };

    if (venueId) {
      fetchVenueData();
    }
  }, [venueId]);

  // Fetch court availability when sport, date, and time are selected
  useEffect(() => {
    const fetchCourtAvailability = async () => {
      if (!selectedSport || !selectedDate || !selectedTime) return;

      try {
        const startTime = selectedTime;
        const endTime = calculateEndTime(selectedTime, duration);

        const response = await getCourtAvailabilityBySportService(venueId, {
          sportType: selectedSport,
          date: formatDateForAPI(selectedDate),
          startTime,
          endTime,
        });

        setCourtAvailability(response.data.data);
        setAvailableCourts(
          response.data.data.courts.filter(
            (court) => court.status === "available"
          )
        );

        // Auto-select first available court
        const firstAvailableCourt = response.data.data.courts.find(
          (court) => court.status === "available"
        );
        if (firstAvailableCourt) {
          setSelectedCourt(firstAvailableCourt.court._id);
        } else {
          setSelectedCourt("");
        }
      } catch (err) {
        console.error("Error fetching court availability:", err);
        setCourtAvailability(null);
        setAvailableCourts([]);
      }
    };

    fetchCourtAvailability();
  }, [selectedSport, selectedDate, selectedTime, duration, venueId]);

  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(":");
    const startDate = new Date();
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    return endDate.toTimeString().slice(0, 5);
  };

  const formatDateForAPI = (date) => {
    if (!date) return "";
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.street || ""}, ${address.city || ""}, ${
      address.state || ""
    }`
      .replace(/^,\s*|,\s*,/g, ",")
      .replace(/^,|,$/, "");
  };

  const getSportIcon = (sportType) => {
    const icons = {
      badminton: "🏸",
      tennis: "🎾",
      football: "⚽",
      basketball: "🏀",
      cricket: "🏏",
      volleyball: "🏐",
      table_tennis: "🏓",
    };
    return icons[sportType] || "🏃";
  };

  const calculateTotalPrice = () => {
    if (!selectedCourt || !duration || !availableCourts.length) return 0;

    const court = availableCourts.find((c) => c.court._id === selectedCourt);
    return court ? court.court.pricePerHour * duration : 0;
  };

  const handleBooking = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime || !duration) {
      alert("Please fill in all booking details");
      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = {
        venue: venueId,
        court: selectedCourt,
        bookingDate: formatDateForAPI(selectedDate),
        timeSlot: {
          startTime: selectedTime,
          endTime: calculateEndTime(selectedTime, duration),
        },
        duration,
        paymentMethod: "card", // Default to card for Razorpay
      };

      const response = await createBookingService(bookingData);
      const booking = response.data.data.booking;

      // Navigate to payment page with booking details
      navigate(`/payment/${booking._id}`, { 
        state: { 
          booking,
          returnUrl: "/profile?tab=bookings"
        } 
      });

    } catch (err) {
      console.error("Error creating booking:", err);
      alert(err.response?.data?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Venue not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "Select Date";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time) => {
    if (!time) return "Select Time";
    return time;
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Court Booking
          </h1>
          <div className="w-24 h-1 bg-black mx-auto rounded-full"></div>
        </div>

        <div className="flex justify-center">
          {/* Main Booking Form - Centered */}
          <div className="w-full max-w-2xl">
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl">
              {/* Venue Info */}
              <div className="mb-8 pb-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  {venue.name}
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="font-medium">
                      {formatAddress(venue.address)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                    <Star size={16} className="text-gray-600 fill-current" />
                    <span className="font-semibold text-gray-800">
                      {venue.rating?.average || "0.0"}
                    </span>
                    <span className="text-gray-500">
                      ({venue.rating?.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-8">
                {/* Sport Selection */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-900 uppercase tracking-wide">
                    Sport
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowSportDropdown(!showSportDropdown)}
                      className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors font-medium"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {selectedSport ? getSportIcon(selectedSport) : "�"}
                        </span>
                        <span className="text-gray-900 capitalize">
                          {selectedSport
                            ? selectedSport.replace("_", " ")
                            : "Select Sport"}
                        </span>
                      </div>
                      <ChevronDown size={20} className="text-gray-400" />
                    </button>
                    {showSportDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                        {sportsData.map((sport) => (
                          <button
                            key={sport._id}
                            onClick={() => {
                              setSelectedSport(sport._id);
                              setSelectedCourt(""); // Reset court selection
                              setShowSportDropdown(false);
                            }}
                            className="w-full text-left p-4 hover:bg-gray-50 transition-colors font-medium text-gray-900 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                          >
                            <span className="text-xl">
                              {getSportIcon(sport._id)}
                            </span>
                            <div>
                              <div className="capitalize">
                                {sport._id.replace("_", " ")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {sport.totalCourts} court
                                {sport.totalCourts !== 1 ? "s" : ""} • ₹
                                {sport.minPrice}-{sport.maxPrice}/hr
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-900 uppercase tracking-wide">
                    Date
                  </label>
                  <button
                    onClick={() => setShowCalendar(true)}
                    className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors font-medium"
                  >
                    <span className="text-gray-900">
                      {formatDate(selectedDate)}
                    </span>
                    <Calendar size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-900 uppercase tracking-wide">
                    Start Time
                  </label>
                  <button
                    onClick={() => setShowTimeSlots(true)}
                    className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors font-medium"
                  >
                    <span className="text-gray-900">
                      {formatTime(selectedTime)}
                    </span>
                    <Clock size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-900 uppercase tracking-wide">
                    Duration
                  </label>
                  <div className="flex items-center justify-center gap-6 bg-gray-50 p-4 rounded-xl">
                    <button
                      onClick={() =>
                        setDuration((prev) => Math.max(1, prev - 1))
                      }
                      className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg"
                      disabled={duration <= 1}
                    >
                      <Minus size={20} />
                    </button>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {duration}
                      </div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Hours
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setDuration((prev) => Math.min(8, prev + 1))
                      }
                      className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg"
                      disabled={duration >= 8}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  {selectedTime && (
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Booking until: {calculateEndTime(selectedTime, duration)}
                    </p>
                  )}
                </div>

                {/* Court Selection */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-900 uppercase tracking-wide">
                    Court
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowCourtDropdown(!showCourtDropdown)}
                      className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors font-medium"
                      disabled={
                        !selectedSport || !selectedDate || !selectedTime
                      }
                    >
                      <span className="text-gray-900">
                        {selectedCourt
                          ? availableCourts.find(
                              (c) => c.court._id === selectedCourt
                            )?.court.name || "Select Court"
                          : "--Select Court--"}
                      </span>
                      <ChevronDown size={20} className="text-gray-400" />
                    </button>
                    {showCourtDropdown && availableCourts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                        {availableCourts.map((courtData) => (
                          <button
                            key={courtData.court._id}
                            onClick={() => {
                              setSelectedCourt(courtData.court._id);
                              setShowCourtDropdown(false);
                            }}
                            className="w-full text-left p-4 hover:bg-gray-50 transition-colors font-medium text-gray-900 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div>{courtData.court.name}</div>
                                <div className="text-xs text-gray-500">
                                  Court #{courtData.court.courtNumber} •
                                  Capacity: {courtData.court.capacity}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600">
                                  ₹{courtData.court.pricePerHour}/hr
                                </div>
                                <div className="text-xs text-green-500">
                                  Available
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Court Availability Status */}
                  {courtAvailability && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Available Courts:</span>
                        <span className="font-semibold text-green-600">
                          {courtAvailability.statusCounts.available}/
                          {courtAvailability.statusCounts.total}
                        </span>
                      </div>
                      {courtAvailability.statusCounts.available === 0 && (
                        <p className="text-red-600 text-xs mt-1">
                          No courts available for selected time. Try different
                          time slot.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Selected Court Details */}
                  {selectedCourt && availableCourts.length > 0 && (
                    <div className="mt-4">
                      {(() => {
                        const selectedCourtData = availableCourts.find(
                          (c) => c.court._id === selectedCourt
                        );
                        return selectedCourtData ? (
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-green-800">
                                  {selectedCourtData.court.name}
                                </h4>
                                <p className="text-green-600 text-sm">
                                  ₹{selectedCourtData.court.pricePerHour}/hour •{" "}
                                  {selectedCourtData.court.capacity} players
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-800">
                                  ₹
                                  {selectedCourtData.court.pricePerHour *
                                    duration}
                                </div>
                                <div className="text-sm text-green-600">
                                  Total for {duration}h
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Continue to Payment Button */}
                <div className="pt-4">
                  <button
                    onClick={handleBooking}
                    disabled={
                      !selectedCourt ||
                      !selectedDate ||
                      !selectedTime ||
                      bookingLoading ||
                      (courtAvailability && courtAvailability.statusCounts.available === 0)
                    }
                    className="w-full bg-black text-white py-4 px-8 rounded-xl font-bold hover:bg-gray-800 transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {bookingLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : courtAvailability && courtAvailability.statusCounts.available === 0 ? (
                      "No Courts Available - Choose Different Time"
                    ) : (
                      `Continue to Payment - ₹${totalPrice.toLocaleString()}`
                    )}
                  </button>
                  <p className="text-center text-gray-500 text-sm mt-3">
                    {selectedCourt
                      ? "Secure payment • No hidden charges"
                      : "Please select all details to proceed"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      <TimeSlotModal
        isOpen={showTimeSlots}
        onClose={() => setShowTimeSlots(false)}
        selectedTime={selectedTime}
        onTimeSelect={(time) => {
          setSelectedTime(time);
          setSelectedCourt(""); // Reset court selection when time changes
          setShowTimeSlots(false); // Close the modal after selection
        }}
        selectedDate={selectedDate}
        venue={venue}
        selectedSport={selectedSport}
      />
    </div>
  );
};

export default VenueBookingPage;
