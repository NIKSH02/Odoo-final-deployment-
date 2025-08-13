// Sports configuration and data
export const SPORTS_CONFIG = {
  badminton: {
    name: "Badminton",
    minPlayers: 2,
    maxPlayers: 4,
    typicalDuration: 1, // hours
    equipment: ["racket", "shuttlecock", "net"],
    standardDimensions: { length: 13.4, width: 6.1, unit: "meters" }, // Reference only
    variations: [
      {
        type: "standard",
        length: 13.4,
        width: 6.1,
        unit: "meters",
        description: "Standard doubles court",
      },
      {
        type: "compact",
        length: 10,
        width: 5,
        unit: "meters",
        description: "Compact recreational court",
      },
      {
        type: "singles",
        length: 13.4,
        width: 5.18,
        unit: "meters",
        description: "Singles court",
      },
    ],
  },
  tennis: {
    name: "Tennis",
    minPlayers: 2,
    maxPlayers: 4,
    typicalDuration: 1.5,
    equipment: ["racket", "ball", "net"],
    standardDimensions: { length: 23.77, width: 10.97, unit: "meters" },
    variations: [
      {
        type: "full_court",
        length: 23.77,
        width: 10.97,
        unit: "meters",
        description: "Full size tennis court",
      },
      {
        type: "mini_court",
        length: 18,
        width: 8,
        unit: "meters",
        description: "Mini tennis court",
      },
      {
        type: "practice_court",
        length: 20,
        width: 9,
        unit: "meters",
        description: "Practice court",
      },
    ],
  },
  football: {
    name: "Football",
    minPlayers: 6, // Reduced for flexibility
    maxPlayers: 22,
    typicalDuration: 1.5,
    equipment: ["ball", "goal_posts"],
    standardDimensions: { length: 100, width: 50, unit: "meters" },
    variations: [
      {
        type: "full_field",
        length: 100,
        width: 50,
        unit: "meters",
        description: "Full size football field",
      },
      {
        type: "7v7",
        length: 70,
        width: 45,
        unit: "meters",
        description: "7-a-side football field",
      },
      {
        type: "5v5",
        length: 40,
        width: 30,
        unit: "meters",
        description: "5-a-side football turf",
      },
      {
        type: "futsal",
        length: 25,
        width: 16,
        unit: "meters",
        description: "Indoor futsal court",
      },
    ],
  },
  basketball: {
    name: "Basketball",
    minPlayers: 4, // Reduced for flexibility
    maxPlayers: 10,
    typicalDuration: 1,
    equipment: ["ball", "basket"],
    standardDimensions: { length: 28, width: 15, unit: "meters" },
    variations: [
      {
        type: "full_court",
        length: 28,
        width: 15,
        unit: "meters",
        description: "Full basketball court",
      },
      {
        type: "half_court",
        length: 14,
        width: 15,
        unit: "meters",
        description: "Half court basketball",
      },
      {
        type: "3v3",
        length: 15,
        width: 11,
        unit: "meters",
        description: "3v3 basketball court",
      },
      {
        type: "streetball",
        length: 12,
        width: 10,
        unit: "meters",
        description: "Street basketball court",
      },
    ],
  },
  cricket: {
    name: "Cricket",
    minPlayers: 6, // Reduced for box cricket
    maxPlayers: 22,
    typicalDuration: 2, // Reduced for shorter formats
    equipment: ["bat", "ball", "wickets", "pads"],
    standardDimensions: { length: 150, width: 150, unit: "meters" }, // Full ground
    variations: [
      {
        type: "full_ground",
        length: 150,
        width: 150,
        unit: "meters",
        description: "Full cricket ground",
      },
      {
        type: "box_cricket",
        length: 30,
        width: 30,
        unit: "meters",
        description: "Box cricket arena",
      },
      {
        type: "indoor_cricket",
        length: 40,
        width: 20,
        unit: "meters",
        description: "Indoor cricket facility",
      },
      {
        type: "nets_practice",
        length: 25,
        width: 4,
        unit: "meters",
        description: "Cricket practice nets",
      },
      {
        type: "tape_ball",
        length: 50,
        width: 50,
        unit: "meters",
        description: "Tape ball cricket ground",
      },
    ],
  },
  volleyball: {
    name: "Volleyball",
    minPlayers: 6,
    maxPlayers: 12,
    typicalDuration: 1,
    equipment: ["ball", "net"],
    standardDimensions: { length: 18, width: 9, unit: "meters" },
    variations: [
      {
        type: "indoor",
        length: 18,
        width: 9,
        unit: "meters",
        description: "Indoor volleyball court",
      },
      {
        type: "beach",
        length: 16,
        width: 8,
        unit: "meters",
        description: "Beach volleyball court",
      },
      {
        type: "recreational",
        length: 15,
        width: 8,
        unit: "meters",
        description: "Recreational volleyball",
      },
    ],
  },
  table_tennis: {
    name: "Table Tennis",
    minPlayers: 2,
    maxPlayers: 4,
    typicalDuration: 0.5,
    equipment: ["paddle", "ball", "table", "net"],
    standardDimensions: { length: 2.74, width: 1.525, unit: "meters" },
    variations: [
      {
        type: "single_table",
        length: 2.74,
        width: 1.525,
        unit: "meters",
        description: "Single table tennis table",
      },
      {
        type: "multi_table",
        length: 8,
        width: 6,
        unit: "meters",
        description: "Multi-table facility (4 tables)",
      },
      {
        type: "tournament_hall",
        length: 14,
        width: 7,
        unit: "meters",
        description: "Tournament standard hall",
      },
    ],
  },
};

export const AMENITIES_LIST = [
  { value: "parking", label: "Parking" },
  { value: "washroom", label: "Washroom" },
  { value: "drinking_water", label: "Drinking Water" },
  { value: "changing_room", label: "Changing Room" },
  { value: "equipment_rental", label: "Equipment Rental" },
  { value: "cafeteria", label: "Cafeteria" },
  { value: "ac", label: "Air Conditioning" },
  { value: "lighting", label: "Floodlights" },
];

export const COURT_FEATURES = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "air_conditioned", label: "Air Conditioned" },
  { value: "floodlights", label: "Floodlights" },
  { value: "synthetic_turf", label: "Synthetic Turf" },
  { value: "wooden_floor", label: "Wooden Floor" },
  { value: "concrete", label: "Concrete Floor" },
];

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const VENUE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
};

// Helper functions
export const getSportsList = () => {
  return Object.keys(SPORTS_CONFIG).map((key) => ({
    value: key,
    label: SPORTS_CONFIG[key].name,
  }));
};

export const getSportConfig = (sportType) => {
  return SPORTS_CONFIG[sportType] || null;
};

// Get sport variations for flexible court setup
export const getSportVariations = (sportType) => {
  const sport = SPORTS_CONFIG[sportType];
  return sport ? sport.variations || [] : [];
};

// Flexible dimension validation (not mandatory, just reasonable)
export const validateDimensions = (sportType, dimensions) => {
  const sport = SPORTS_CONFIG[sportType];
  if (!sport) return { valid: false, message: "Invalid sport type" };

  // Allow any reasonable dimensions (not mandatory to match standard)
  const minDimensions = { length: 3, width: 2 }; // Minimum viable
  const maxDimensions = { length: 200, width: 150 }; // Maximum reasonable

  if (
    dimensions.length < minDimensions.length ||
    dimensions.width < minDimensions.width
  ) {
    return {
      valid: false,
      message: `Dimensions too small for ${sport.name}. Minimum: ${minDimensions.length}m x ${minDimensions.width}m`,
    };
  }

  if (
    dimensions.length > maxDimensions.length ||
    dimensions.width > maxDimensions.width
  ) {
    return {
      valid: false,
      message: `Dimensions too large. Maximum: ${maxDimensions.length}m x ${maxDimensions.width}m`,
    };
  }

  return { valid: true, message: "Dimensions are acceptable" };
};

// Get dimension suggestions for a sport
export const getDimensionSuggestions = (sportType) => {
  const variations = getSportVariations(sportType);
  if (variations.length === 0) {
    const sport = SPORTS_CONFIG[sportType];
    return sport ? [sport.standardDimensions] : [];
  }
  return variations.map((v) => ({
    type: v.type,
    dimensions: { length: v.length, width: v.width, unit: v.unit },
    description: v.description,
  }));
};

// Check if a court variant is valid for a sport
export const isValidCourtVariant = (sportType, variant) => {
  const variations = getSportVariations(sportType);
  return variations.some((v) => v.type === variant);
};

export const getDefaultOperatingHours = () => {
  const defaultHours = { open: "06:00", close: "22:00", isOpen: true };
  return {
    monday: defaultHours,
    tuesday: defaultHours,
    wednesday: defaultHours,
    thursday: defaultHours,
    friday: defaultHours,
    saturday: defaultHours,
    sunday: defaultHours,
  };
};

export const getDefaultCourtOperatingHours = () => {
  const defaultHours = { start: "06:00", end: "22:00", isAvailable: true };
  return {
    monday: defaultHours,
    tuesday: defaultHours,
    wednesday: defaultHours,
    thursday: defaultHours,
    friday: defaultHours,
    saturday: defaultHours,
    sunday: defaultHours,
  };
};

export const calculateDuration = (startTime, endTime) => {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return (endMinutes - startMinutes) / 60; // Return hours
};

export const isTimeSlotValid = (
  startTime,
  endTime,
  operatingHours,
  dayOfWeek
) => {
  const dayKey = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][dayOfWeek];
  const dayHours = operatingHours[dayKey];

  if (!dayHours.isAvailable) return false;

  return startTime >= dayHours.start && endTime <= dayHours.end;
};

export default {
  SPORTS_CONFIG,
  AMENITIES_LIST,
  COURT_FEATURES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  VENUE_STATUS,
  getSportsList,
  getSportConfig,
  getSportVariations,
  validateDimensions,
  getDimensionSuggestions,
  isValidCourtVariant,
  getDefaultOperatingHours,
  getDefaultCourtOperatingHours,
  calculateDuration,
  isTimeSlotValid,
};
