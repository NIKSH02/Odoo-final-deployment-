import React, { useState } from "react";
import { X } from "lucide-react";

// Pricing Modal Component
const PricingModal = ({ sport, isOpen, onClose }) => {
  if (!isOpen || !sport) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">
            {sport._id.charAt(0).toUpperCase() + sport._id.slice(1)} Pricing
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <h4 className="text-lg font-bold mb-4">
              {sport._id.charAt(0).toUpperCase() + sport._id.slice(1)} Courts
            </h4>
            <div className="grid gap-4">
              {sport.courts.map((court) => (
                <div key={court._id} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold text-gray-900">
                      {court.name}
                    </h5>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{court.pricePerHour}/hour
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Court #{court.courtNumber} • Capacity: {court.capacity}{" "}
                    players
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <h5 className="font-semibold text-blue-900 mb-2">
              Pricing Summary
            </h5>
            <div className="space-y-1 text-sm text-blue-800">
              <p>• Total Courts: {sport.totalCourts}</p>
              <p>
                • Price Range: ₹{sport.minPrice} - ₹{sport.maxPrice} per hour
              </p>
              <p>• Average Price: ₹{Math.round(sport.averagePrice)} per hour</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sports Available Component
export default function SportsAvailable({ sportsData = [] }) {
  const [selectedSport, setSelectedSport] = useState(null);

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

  const getSportDescription = (sport) => {
    if (sport.isPlaceholder || sport.totalCourts === 0) {
      return "No courts available yet";
    }
    if (sport.totalCourts === 1) {
      return `${sport.totalCourts} court available`;
    }
    return `${sport.totalCourts} courts available`;
  };

  if (!sportsData || sportsData.length === 0) {
    return (
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Sports Available
          </h3>
          <span className="text-sm text-gray-500">
            No sports data available
          </span>
        </div>
        <div className="bg-gray-50 p-8 rounded-xl text-center">
          <p className="text-gray-600">
            Sports information will be displayed here once available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Sports Available
          </h3>
          <span className="text-sm text-gray-500">
            Click to view pricing and court details
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sportsData.map((sport) => (
            <button
              key={sport._id}
              onClick={() => {
                if (!sport.isPlaceholder && sport.totalCourts > 0) {
                  setSelectedSport(sport);
                }
              }}
              disabled={sport.isPlaceholder || sport.totalCourts === 0}
              className={`group bg-white border-2 border-gray-200 p-4 rounded-xl text-center transition-all duration-200 ${
                sport.isPlaceholder || sport.totalCourts === 0
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-black hover:shadow-md cursor-pointer"
              }`}
            >
              <div className="text-2xl mb-2">{getSportIcon(sport._id)}</div>
              <div className="font-semibold text-gray-900 text-sm mb-1 capitalize">
                {sport._id.replace("_", " ")}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {getSportDescription(sport)}
              </div>
              <div
                className={`text-xs font-medium transition-colors ${
                  sport.isPlaceholder || sport.totalCourts === 0
                    ? "text-gray-400"
                    : "text-gray-600 group-hover:text-black"
                }`}
              >
                {sport.isPlaceholder || sport.totalCourts === 0
                  ? "Coming Soon"
                  : "View Pricing"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <PricingModal
        sport={selectedSport}
        isOpen={!!selectedSport}
        onClose={() => setSelectedSport(null)}
      />
    </>
  );
}
