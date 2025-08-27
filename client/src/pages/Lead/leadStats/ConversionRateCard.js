import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaPercentage,
} from "react-icons/fa";

const LeadStatsCards = ({ start, end }) => {
  const [stats, setStats] = useState({
    total: null,
    won: null,
    lost: null,
    progress: null,
    conversionRate: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/conversion-stats?start=${start}&end=${end}`
        );
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching lead stats:", error);
      }
    };

    if (start && end) fetchStats();
  }, [start, end]);

  const cards = [
    {
      label: "Total Leads",
      value: stats.total,
      icon: <FaUsers className="text-blue-500 text-2xl" />,
      glow: "from-blue-400/20 to-indigo-400/20",
      border: "border-blue-200",
    },
    {
      label: "Won Leads",
      value: stats.won,
      icon: <FaCheckCircle className="text-green-500 text-2xl" />,
      glow: "from-green-400/20 to-emerald-400/20",
      border: "border-green-200",
    },
    {
      label: "Lost Leads",
      value: stats.lost,
      icon: <FaTimesCircle className="text-red-500 text-2xl" />,
      glow: "from-red-400/20 to-pink-400/20",
      border: "border-red-200",
    },
    {
      label: "Pending Leads",
      value: stats.progress,
      icon: <FaHourglassHalf className="text-yellow-500 text-2xl" />,
      glow: "from-yellow-400/20 to-orange-400/20",
      border: "border-yellow-200",
    },
    {
      label: "Conversion Rate",
      value: stats.conversionRate ? `${stats.conversionRate}%` : "--",
      icon: <FaPercentage className="text-purple-500 text-2xl" />,
      glow: "from-purple-400/20 to-pink-400/20",
      border: "border-purple-200",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8 mb-10">
      {/* Top row: 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cards.slice(0, 3).map((card, idx) => (
          <div
            key={idx}
            className={`relative bg-gradient-to-br ${card.glow} border ${card.border} 
                        shadow-lg rounded-2xl p-6 flex flex-col items-center 
                        justify-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl`}
          >
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-2">
                {card.icon}
                <h3 className="text-base font-semibold text-gray-800">
                  {card.label}
                </h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mt-3 drop-shadow-sm">
                {card.value !== null ? card.value : "--"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row: 2 cards centered */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center max-w-2xl mx-auto">
        {cards.slice(3).map((card, idx) => (
          <div
            key={idx}
            className={`relative bg-gradient-to-br ${card.glow} border ${card.border} 
                        shadow-lg rounded-2xl p-6 flex flex-col items-center 
                        justify-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl`}
          >
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-2">
                {card.icon}
                <h3 className="text-base font-semibold text-gray-800">
                  {card.label}
                </h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mt-3 drop-shadow-sm">
                {card.value !== null ? card.value : "--"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadStatsCards;
