import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaKeyboard, FaMouse, FaChartPie } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";

const UserActivity = () => {
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

  // Fetch Activity
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    }

    if (showDetails) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDetails]);

  if (!activity) return null;

  const today = activity.today;
  const yesterday = activity.yesterday;

  // Comparison helper
  const diff = (todayVal, yesterdayVal) =>
    Math.round(todayVal - yesterdayVal);

  const badge = (value) => (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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
    <div ref={wrapperRef} className="relative">
      {/* Main badge */}
      <div
        className="cursor-pointer px-3 py-[4px] bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow hover:shadow-md transition flex justify-center items-center gap-1"
        onClick={() => setShowDetails(!showDetails)}
      >

            <FiActivity size={16} className="" />
        Activity: {today.overallActivityPercent}%
      </div>

      {/* Dropdown */}
      {showDetails && (
        <div className="absolute right-0 mt-3 w-80 bg-white  rounded-xl overflow-clip drop-shadow-lg z-50 animate-pop">
          <h5 className="font-semibold text-lg   bg-orange-500 text-white px-3 py-2  flex items-center justify-center gap-1 shadow-md shadow-black/20">
            <FiActivity size={16} className="" />
            Activity Summary
          </h5>

          <div className="flex flex-col gap-5 p-4 ">

            {/* ITEM COMPONENT */}
            {[
              {
                label: "Overall",
                icon: <FaChartPie className="text-orange-500" />,
                today: today.overallActivityPercent,
                yesterday: yesterday.overallActivityPercent,
              },
              {
                label: "Keyboard",
                icon: <FaKeyboard className="text-blue-600" />,
                today: today.keyboardActivityPercent,
                yesterday: yesterday.keyboardActivityPercent,
              },
              {
                label: "Mouse",
                icon: <FaMouse className="text-green-600" />,
                today: today.mouseActivityPercent,
                yesterday: yesterday.mouseActivityPercent,
              },
            ].map((item) => {
              const delta = diff(item.today, item.yesterday);
              return (
                <div key={item.label} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.today}%</span>
                      {badge(delta)}
                    </div>
                  </div>

                  <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${item.today}%`,
                        backgroundColor: progressColor(item.today),
                      }}
                    />
                  </div>

                  {/* Yesterday value (small subtle hint) */}
                  <div className="text-xs text-gray-500 mt-1">
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

export default UserActivity;
