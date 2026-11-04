import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaKeyboard, FaMouse, FaChartPie } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";

const UserActivityMobile = () => {
  const [activity, setActivity] = useState({
    today: {
      keyboardActivityPercent: 0,
      mouseActivityPercent: 0,
      overallActivityPercent: 0,
    },
    yesterday: {
      keyboardActivityPercent: 0,
      mouseActivityPercent: 0,
      overallActivityPercent: 0,
    },
  });
  const [showDetails, setShowDetails] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/agent/activity`
        );
        setActivity(data);
      } catch (error) {
        console.error("Failed to fetch user activity:", error);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    }
    if (showDetails) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDetails]);

  if (!activity) return null;

  const today = activity.today;
  const yesterday = activity.yesterday;

  const diff = (todayVal, yesterdayVal) => Math.round(todayVal - yesterdayVal);

  const badge = (value) => (
    <span
      className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
        value > 0
          ? "bg-green-100 text-green-700"
          : value < 0
          ? "bg-red-100 text-red-700"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {value > 0 ? `+${value}%` : value < 0 ? `${value}%` : "0%"}
    </span>
  );

  const progressColor = (percent) =>
    percent > 50 ? "#16a34a" : percent > 20 ? "#facc15" : "#ef4444";

  return (
    <div ref={wrapperRef} className="relative md:hidden">
      {/* Compact trigger */}
      <div
        className="cursor-pointer px-2.5 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1"
        onClick={() => setShowDetails(!showDetails)}
      >
        <FiActivity size={13} />
        <span>{today.overallActivityPercent}%</span>
      </div>

      {/* Dropdown */}
      {showDetails && (
        <div className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] bg-white rounded-xl overflow-hidden shadow-xl z-50">
          <h5 className="font-semibold text-sm bg-orange-500 text-white px-3 py-2 flex items-center justify-center gap-1.5">
            <FiActivity size={14} />
            Activity Summary
          </h5>

          <div className="flex flex-col gap-4 p-3">
            {[
              {
                label: "Overall",
                icon: <FaChartPie className="text-orange-500" size={14} />,
                today: today.overallActivityPercent,
                yesterday: yesterday.overallActivityPercent,
              },
              {
                label: "Keyboard",
                icon: <FaKeyboard className="text-blue-600" size={14} />,
                today: today.keyboardActivityPercent,
                yesterday: yesterday.keyboardActivityPercent,
              },
              {
                label: "Mouse",
                icon: <FaMouse className="text-green-600" size={14} />,
                today: today.mouseActivityPercent,
                yesterday: yesterday.mouseActivityPercent,
              },
            ].map((item) => {
              const delta = diff(item.today, item.yesterday);
              return (
                <div key={item.label} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold">{item.today}%</span>
                      {badge(delta)}
                    </div>
                  </div>

                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${item.today}%`,
                        backgroundColor: progressColor(item.today),
                      }}
                    />
                  </div>

                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Yesterday: {item.yesterday}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityMobile;