import React from "react";
import {
  Wifi,
  Car,
  AirVent,
  Shield,
  Droplets,
  Zap,
  Users,
  Coffee,
  CheckCircle,
  ShowerHead,
  Utensils,
  MapPin,
  Lightbulb,
  Camera,
  Lock,
  TreePine,
  Waves,
  Music,
  Shirt,
} from "lucide-react";

// Amenities Component
export default function Amenities({ amenities = [] }) {
  const getAmenityIcon = (amenityName) => {
    const iconMap = {
      // Venue amenities from backend model
      parking: Car,
      washroom: Droplets,
      drinking_water: Droplets,
      changing_room: Shirt,
      equipment_rental: Shield,
      cafeteria: Coffee,
      ac: AirVent,
      lighting: Lightbulb,

      // Court features from backend model
      indoor: Shield,
      outdoor: TreePine,
      air_conditioned: AirVent,
      floodlights: Lightbulb,
      synthetic_turf: Waves,
      wooden_floor: CheckCircle,
      concrete: CheckCircle,

      // Additional common amenities
      restroom: Droplets,
      toilet: Droplets,
      bathroom: Droplets,
      refreshments: Coffee,
      food: Utensils,
      canteen: Coffee,
      restaurant: Utensils,
      security: Shield,
      cctv: Camera,
      surveillance: Camera,
      seating: Users,
      waiting_area: Users,
      lounge: Users,
      wifi: Wifi,
      internet: Wifi,
      power_backup: Zap,
      generator: Zap,
      locker: Lock,
      storage: Lock,
      locker_room: Lock,
      shower: ShowerHead,
      first_aid: Shield,
      medical: Shield,
      water: Droplets,
      sound_system: Music,
      audio: Music,
      music: Music,
      gps: MapPin,
      location: MapPin,
      equipment: Shield,
      gear: Shield,
      rental: Shield,

      // Sports specific
      court: CheckCircle,
      field: TreePine,
      ground: TreePine,
      net: CheckCircle,
      goal: CheckCircle,
      basket: CheckCircle,
      racket: CheckCircle,
      bat: CheckCircle,
      ball: CheckCircle,
    };

    const normalizedName = amenityName.toLowerCase().replace(/\s+/g, "_");
    return iconMap[normalizedName] || CheckCircle;
  };

  const formatAmenityName = (name) => {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/Ac\b/g, "AC")
      .replace(/Wifi\b/g, "WiFi")
      .replace(/Cctv\b/g, "CCTV")
      .replace(/Gps\b/g, "GPS");
  };

  if (!amenities || amenities.length === 0) {
    return (
      <div className="mb-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Amenities & Facilities
          </h3>
          <div className="w-8 h-1 bg-black rounded-full"></div>
        </div>
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 text-center hover:border-gray-200 hover:shadow-lg transition-all duration-300">
          <div className="p-4 bg-gray-100 rounded-xl mb-4 inline-block">
            <CheckCircle size={24} className="text-gray-600" />
          </div>
          <p className="text-gray-600 font-medium">
            Amenities information will be available soon
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Amenities & Facilities
        </h3>
        <div className="w-8 h-1 bg-black rounded-full"></div>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {amenities.map((amenity, index) => {
            const IconComponent = getAmenityIcon(amenity);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-white shadow-sm">
                  <IconComponent size={20} className="text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                    {formatAmenityName(amenity)}
                  </h4>
                  <div className="w-2 h-2 rounded-full mt-1 bg-green-500"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800 font-medium">
            ✨ All amenities are maintained regularly to ensure the best
            experience for our customers.
          </p>
        </div>
      </div>
    </div>
  );
}
