import React, { useState, useEffect } from "react";
import {
  Edit3,
  Trash2,
  Clock,
  Users,
  Ruler,
  Settings,
  Save,
  X,
  Menu,
  Plus,
  Target,
} from "lucide-react";
import OwnerSidebar from "../components/OwnerSidebar";
import {
  getOwnerCourtsService,
  createCourtService,
  updateCourtService,
  deleteCourtService,
  toggleCourtStatusService,
} from "../services/courtService";
import { getOwnerVenuesService } from "../services/venueService";

// CourtModal Component (moved outside to prevent re-creation on every render)
const CourtModal = ({ 
  isOpen, 
  onClose, 
  title, 
  formData, 
  setFormData, 
  handleInputChange, 
  handleNestedInputChange, 
  handleOperatingHoursChange, 
  venues, 
  loading, 
  sportsOptions, 
  featuresOptions, 
  equipmentOptions, 
  days, 
  handleSave, 
  isFormValid, 
  editingCourt 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g., Badminton Court 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue *
                </label>
                {!Array.isArray(venues) || venues.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-yellow-300 rounded-lg bg-yellow-50">
                    <p className="text-sm text-yellow-700">
                      {loading ? "Loading venues..." : 
                      "No venues found. Please add a venue first in Facility Management. Note: Venues must be approved by admin before you can add courts."}
                    </p>
                    {venues.length === 0 && !loading && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Check browser console for debug information.
                      </p>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.venue}
                    onChange={(e) =>
                      handleInputChange("venue", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  >
                    <option value="">Select Venue</option>
                    {Array.isArray(venues) &&
                      venues.map((venue) => (
                        <option key={venue._id} value={venue._id}>
                          {venue.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Type *
                </label>
                <select
                  value={formData.sportType}
                  onChange={(e) =>
                    handleInputChange("sportType", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="">Select Sport</option>
                  {sportsOptions.map((sport) => (
                    <option key={sport.value} value={sport.value}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour (₹) *
                </label>
                <input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) =>
                    handleInputChange("pricePerHour", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (persons) *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    handleInputChange("capacity", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="4"
                />
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dimensions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.dimensions.length}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "dimensions",
                      "length",
                      e.target.value ? parseFloat(e.target.value) : ""
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="13.4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.dimensions.width}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "dimensions",
                      "width",
                      e.target.value ? parseFloat(e.target.value) : ""
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="6.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={formData.dimensions.unit}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "dimensions",
                      "unit",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="meters">Meters</option>
                  <option value="feet">Feet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features & Equipment */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Features & Equipment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {featuresOptions.map((feature) => (
                    <label
                      key={feature.value}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              features: [...prev.features, feature.value],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              features: prev.features.filter(
                                (f) => f !== feature.value
                              ),
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">
                        {feature.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {equipmentOptions.map((equipment) => (
                    <label
                      key={equipment.value}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={formData.equipment.some(e => 
                          typeof e === 'string' ? e === equipment.value : e.name === equipment.value
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              equipment: [...prev.equipment, { 
                                name: equipment.value, 
                                available: true, 
                                rentPrice: 0 
                              }],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              equipment: prev.equipment.filter(
                                (e) => typeof e === 'string' ? e !== equipment.value : e.name !== equipment.value
                              ),
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">
                        {equipment.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Operating Hours
            </h3>
            <div className="space-y-3">
              {days.map((day) => (
                <div
                  key={day}
                  className="flex items-center space-x-4 p-3 bg-white rounded-lg"
                >
                  <div className="w-20">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </span>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={
                        formData.operatingHours[day]?.isAvailable ?? true
                      }
                      onChange={(e) =>
                        handleOperatingHoursChange(
                          day,
                          "isAvailable",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-600">Open</span>
                  </label>
                  {formData.operatingHours[day]?.isAvailable && (
                    <>
                      <div>
                        <input
                          type="time"
                          value={
                            formData.operatingHours[day]?.start || "06:00"
                          }
                          onChange={(e) =>
                            handleOperatingHoursChange(
                              day,
                              "start",
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black"
                        />
                      </div>
                      <span className="text-gray-500">to</span>
                      <div>
                        <input
                          type="time"
                          value={formData.operatingHours[day]?.end || "22:00"}
                          onChange={(e) =>
                            handleOperatingHoursChange(
                              day,
                              "end",
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !isFormValid()}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {loading
                ? "Saving..."
                : `${editingCourt ? "Update" : "Save"} Court`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const CourtManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courts, setCourts] = useState([]);
  const [venues, setVenues] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    venue: "",
    sportType: "",
    pricePerHour: "",
    capacity: "",
    dimensions: {
      length: "",
      width: "",
      unit: "meters",
    },
    features: [],
    equipment: [],
    operatingHours: {
      monday: { start: "06:00", end: "22:00", isAvailable: true },
      tuesday: { start: "06:00", end: "22:00", isAvailable: true },
      wednesday: { start: "06:00", end: "22:00", isAvailable: true },
      thursday: { start: "06:00", end: "22:00", isAvailable: true },
      friday: { start: "06:00", end: "22:00", isAvailable: true },
      saturday: { start: "06:00", end: "22:00", isAvailable: true },
      sunday: { start: "06:00", end: "22:00", isAvailable: true },
    },
  });

  // Sports and features options
  const sportsOptions = [
    { value: "badminton", label: "Badminton" },
    { value: "tennis", label: "Tennis" },
    { value: "basketball", label: "Basketball" },
    { value: "football", label: "Football" },
    { value: "volleyball", label: "Volleyball" },
    { value: "cricket", label: "Cricket" },
    { value: "table_tennis", label: "Table Tennis" },
    { value: "squash", label: "Squash" },
  ];

  const featuresOptions = [
    { value: "indoor", label: "Indoor" },
    { value: "outdoor", label: "Outdoor" },
    { value: "air_conditioned", label: "Air Conditioned" },
    { value: "floodlights", label: "Floodlights" },
    { value: "synthetic_turf", label: "Synthetic Turf" },
    { value: "wooden_floor", label: "Wooden Floor" },
    { value: "concrete", label: "Concrete" },
  ];

  const equipmentOptions = [
    { value: "rackets", label: "Rackets" },
    { value: "balls", label: "Balls" },
    { value: "nets", label: "Nets" },
    { value: "goals", label: "Goals" },
    { value: "markers", label: "Markers" },
    { value: "scoreboards", label: "Scoreboards" },
    { value: "shuttlecocks", label: "Shuttlecocks" },
    { value: "protective_gear", label: "Protective Gear" },
  ];

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Load static data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load venues owned by the user
      try {
        // Include all venues regardless of status (pending, approved, rejected)
        const venuesResponse = await getOwnerVenuesService({ 
          limit: 100, // Get more venues to ensure we don't miss any
          page: 1 
        });
        
        if (venuesResponse?.data?.success && venuesResponse?.data?.data?.venues) {
          // Backend returns venues under data.data.venues
          const venuesData = Array.isArray(venuesResponse.data.data.venues)
            ? venuesResponse.data.data.venues
            : [];
          setVenues(venuesData);
        } else {
          setVenues([]);
        }
      } catch (venueError) {
        console.error("Error loading venues:", venueError);
        setVenues([]);
      }

      // Load courts owned by the user
      try {
        const courtsResponse = await getOwnerCourtsService();

        
        if (courtsResponse?.data?.success && courtsResponse?.data?.data) {
          const courtsData = Array.isArray(courtsResponse.data.data)
            ? courtsResponse.data.data
            : [];
          setCourts(courtsData);
        } else {
          setCourts([]);
        }
      } catch (courtError) {
        console.error("Error loading courts:", courtError);
        setCourts([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleNestedInputChange = (parent, child, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value,
      },
    }));
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      venue: "",
      sportType: "",
      pricePerHour: "",
      capacity: "",
      dimensions: {
        length: "",
        width: "",
        unit: "meters",
      },
      features: [],
      equipment: [],
      operatingHours: {
        monday: { start: "06:00", end: "22:00", isAvailable: true },
        tuesday: { start: "06:00", end: "22:00", isAvailable: true },
        wednesday: { start: "06:00", end: "22:00", isAvailable: true },
        thursday: { start: "06:00", end: "22:00", isAvailable: true },
        friday: { start: "06:00", end: "22:00", isAvailable: true },
        saturday: { start: "06:00", end: "22:00", isAvailable: true },
        sunday: { start: "06:00", end: "22:00", isAvailable: true },
      },
    });
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.venue &&
      formData.sportType &&
      formData.pricePerHour &&
      formData.capacity
    );
  };

  const handleSave = async () => {
    // Validate required fields
    if (
      !formData.name ||
      !formData.venue ||
      !formData.sportType ||
      !formData.pricePerHour ||
      !formData.capacity
    ) {
      setError(
        "Please fill in all required fields: Court Name, Venue, Sport Type, Price per Hour, and Capacity."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data for backend
      const courtData = {
        name: formData.name,
        venue: formData.venue,
        sportType: formData.sportType,
        pricePerHour: parseFloat(formData.pricePerHour),
        capacity: parseInt(formData.capacity),
        dimensions: {
          length: parseFloat(formData.dimensions.length) || 0,
          width: parseFloat(formData.dimensions.width) || 0,
          unit: formData.dimensions.unit || "meters",
        },
        features: formData.features || [],
        equipment: formData.equipment || [],
        operatingHours: formData.operatingHours,
      };

      // Add courtNumber for new courts (backend will auto-generate if not provided)
      if (!editingCourt) {
        // Get the highest court number for this venue and sport type
        const existingCourts = courts.filter(
          (court) => 
            court.venue._id === formData.venue && 
            court.sportType === formData.sportType
        );
        const maxCourtNumber = existingCourts.length > 0 
          ? Math.max(...existingCourts.map(court => court.courtNumber || 0))
          : 0;
        courtData.courtNumber = maxCourtNumber + 1;
      }

      if (editingCourt) {
        // Update existing court
        const response = await updateCourtService(editingCourt._id, courtData);
        if (response?.data?.success) {
          setCourts((prev) =>
            prev.map((court) =>
              court._id === editingCourt._id ? response.data.data : court
            )
          );
          setIsEditModalOpen(false);
          setEditingCourt(null);
          setSuccessMessage("Court updated successfully!");
        } else {
          throw new Error("Failed to update court");
        }
      } else {
        // Create new court
        const response = await createCourtService(courtData);
        if (response?.data?.success) {
          setCourts((prev) => [...prev, response.data.data]);
          setIsCreateModalOpen(false);
          setSuccessMessage("Court created successfully!");
        } else {
          throw new Error("Failed to create court");
        }
      }

      resetForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error saving court:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to save court. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (court) => {
    if (!court || !court._id) {
      setError("Invalid court data");
      return;
    }

    setEditingCourt(court);
    setFormData({
      name: court.name || "",
      venue:
        court.venue && court.venue._id ? court.venue._id : court.venue || "",
      sportType: court.sportType || "",
      pricePerHour: court.pricePerHour ? court.pricePerHour.toString() : "",
      capacity: court.capacity ? court.capacity.toString() : "",
      dimensions: court.dimensions || { length: "", width: "", unit: "meters" },
      features: Array.isArray(court.features) ? court.features : [],
      equipment: Array.isArray(court.equipment) 
        ? court.equipment.map(eq => 
            typeof eq === 'string' 
              ? { name: eq, available: true, rentPrice: 0 }
              : eq
          ) 
        : [],
      operatingHours: court.operatingHours || {
        monday: { start: "06:00", end: "22:00", isAvailable: true },
        tuesday: { start: "06:00", end: "22:00", isAvailable: true },
        wednesday: { start: "06:00", end: "22:00", isAvailable: true },
        thursday: { start: "06:00", end: "22:00", isAvailable: true },
        friday: { start: "06:00", end: "22:00", isAvailable: true },
        saturday: { start: "06:00", end: "22:00", isAvailable: true },
        sunday: { start: "06:00", end: "22:00", isAvailable: true },
      },
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (courtId) => {
    if (window.confirm("Are you sure you want to delete this court?")) {
      try {
        setLoading(true);
        setError(null);

        const response = await deleteCourtService(courtId);
        if (response?.data?.success) {
          setCourts((prev) => prev.filter((court) => court._id !== courtId));
          setSuccessMessage("Court deleted successfully!");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (error) {
        console.error("Error deleting court:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to delete court. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (courtId) => {
    try {
      setLoading(true);
      const response = await toggleCourtStatusService(courtId);
      if (response?.data?.success) {
        setCourts((prev) =>
          prev.map((court) =>
            court._id === courtId
              ? { ...court, isActive: !court.isActive }
              : court
          )
        );
        setSuccessMessage("Court status updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error toggling court status:", error);
      setError("Failed to update court status.");
    } finally {
      setLoading(false);
    }
  };

  const getVenueName = (venue) => {
    if (typeof venue === "object" && venue?.name) {
      return venue.name;
    }
    if (typeof venue === "string" && Array.isArray(venues)) {
      const venueObj = venues.find((v) => v._id === venue);
      return venueObj ? venueObj.name : "Unknown Venue";
    }
    return "Unknown Venue";
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
                Court Management
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreate}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Court</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            )}

            {/* Courts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(courts) && courts.length > 0
                ? courts.map((court) => (
                    <div
                      key={court._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Header */}
                      <div className="bg-gray-900 text-white p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {court.name}
                            </h3>
                            <p className="text-gray-300 text-sm">
                              Court #{court.courtNumber}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                court.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {court.isActive ? "Active" : "Inactive"}
                            </span>
                            <button
                              onClick={() => handleToggleStatus(court._id)}
                              className="p-1 hover:bg-gray-700 rounded"
                              title={
                                court.isActive
                                  ? "Deactivate Court"
                                  : "Activate Court"
                              }
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Venue</span>
                            <span className="font-medium">
                              {getVenueName(court.venue)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Sport</span>
                            <span className="font-medium capitalize">
                              {court.sportType}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">
                              Price/Hour
                            </span>
                            <span className="font-semibold text-lg">
                              ₹{court.pricePerHour || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">
                              Capacity
                            </span>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-gray-600" />
                              <span className="font-medium">
                                {court.capacity || 0}
                              </span>
                            </div>
                          </div>
                          {court.dimensions && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-sm">
                                Dimensions
                              </span>
                              <div className="flex items-center space-x-1">
                                <Ruler className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-sm">
                                  {court.dimensions.length || 0}×
                                  {court.dimensions.width || 0}{" "}
                                  {court.dimensions.unit || "meters"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 mb-4">
                          {court.features && court.features.length > 0 && (
                            <div>
                              <span className="text-gray-600 text-sm">
                                Features
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {court.features
                                  .slice(0, 2)
                                  .map((feature, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                    >
                                      {feature.replace("_", " ").toUpperCase()}
                                    </span>
                                  ))}
                                {court.features.length > 2 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                    +{court.features.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {court.equipment && court.equipment.length > 0 && (
                            <div>
                              <span className="text-gray-600 text-sm">
                                Equipment
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {court.equipment
                                  .slice(0, 2)
                                  .map((equip, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                                    >
                                      {typeof equip === "object"
                                        ? equip.name
                                        : equip}
                                    </span>
                                  ))}
                                {court.equipment.length > 2 && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                    +{court.equipment.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center space-x-4">
                                <span>
                                  Bookings: {court.totalBookings || 0}
                                </span>
                                <span>Revenue: ₹{court.totalRevenue || 0}</span>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                Created:{" "}
                                {court.createdAt
                                  ? new Date(
                                      court.createdAt
                                    ).toLocaleDateString()
                                  : "Unknown"}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(court)}
                                className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit Court"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(court._id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Court"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : null}
            </div>

            {(!Array.isArray(courts) || courts.length === 0) && !loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Courts Found
                </h3>
                <p className="text-gray-600">
                  No courts have been added yet. Courts are managed through the
                  Facility Management section.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      <CourtModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCourt(null);
          resetForm();
        }}
        title="Edit Court"
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        handleNestedInputChange={handleNestedInputChange}
        handleOperatingHoursChange={handleOperatingHoursChange}
        venues={venues}
        loading={loading}
        sportsOptions={sportsOptions}
        featuresOptions={featuresOptions}
        equipmentOptions={equipmentOptions}
        days={days}
        handleSave={handleSave}
        isFormValid={isFormValid}
        editingCourt={editingCourt}
      />

      {/* Create Modal */}
      <CourtModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Court"
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        handleNestedInputChange={handleNestedInputChange}
        handleOperatingHoursChange={handleOperatingHoursChange}
        venues={venues}
        loading={loading}
        sportsOptions={sportsOptions}
        featuresOptions={featuresOptions}
        equipmentOptions={equipmentOptions}
        days={days}
        handleSave={handleSave}
        isFormValid={isFormValid}
        editingCourt={editingCourt}
      />
    </div>
  );
};

export default CourtManagement;
