import dayjs from "dayjs";
import React from "react";
import { FiActivity } from "react-icons/fi";
import { FiCalendar } from "react-icons/fi";

const Summary = ({
  screenshots,
  timers,
  loading,
  totalWorkedTimeInMins,
  selectedDate,
  startDate,
  endDate,
  filterType,
}) => {
  // --------------------------
  // SAFE AVERAGE ACTIVITY
  // --------------------------
  const avgActivity =
    screenshots.length > 0
      ? Math.round(
          screenshots.reduce(
            (sum, s) => sum + (s.activity?.overallActivityPercent || 0),
            0
          ) / screenshots.length
        )
      : 0;

  // --------------------------
  // TOTAL SCREENSHOTS
  // --------------------------
  const totalScreenshots = screenshots.length;

  // --------------------------
  // DATE / DATE RANGE DISPLAY
  // --------------------------
  const trackingLabel = filterType === "range"
    ? `${dayjs(startDate).format("MMM D")} - ${dayjs(
        endDate
      ).format("MMM D")}`
    : dayjs(selectedDate).format("MMM D, YYYY");

  // --------------------------
  // WORKED TIME
  // --------------------------
  const hours = Math.floor(totalWorkedTimeInMins / 60);
  const minutes = Math.floor(totalWorkedTimeInMins % 60);

  return (
    <div className="w-[30%] flex flex-col gap-4">
      {/* LEFT — ACTIVITY + WORKED TIME */}
      <div className="flex-1 p-8 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-gray-200 flex flex-col justify-start">
        <h2 className="text-xl md:text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
          <FiActivity className="text-blue-500 w-6 h-6" />
          Productivity Summary
        </h2>

        <div className="flex items-center justify-between">
          {/* Worked Time */}
          <div className="flex-1">
            <p className="text-md text-gray-500">Worked Time</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">
              {loading ? (
                <span className="inline-block w-24 h-3 bg-gray-300 rounded animate-pulse"></span>
              ) : (
                `${hours}h ${minutes}m`
              )}
            </p>
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-gray-300 mx-6"></div>

          {/* Average Activity */}
          <div className="flex-1">
            <p className="text-md text-gray-500">Average Activity</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">
              {loading ? (
                <span className="inline-block w-24 h-3 bg-gray-300 rounded animate-pulse"></span>
              ) : (
                `${avgActivity}%`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — DATE + SCREENSHOTS */}
      <div className="flex-1 p-8 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-gray-200 flex flex-col justify-start">
        <h2 className="text-xl md:text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
          <FiCalendar className="text-blue-500 w-6 h-6" />
          Tracking Info
        </h2>

        <div className="flex items-center justify-between">
          {/* Total Screenshots */}
          <div className="flex-1">
            <p className="text-md text-gray-500">Total Screenshots</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? (
                <span className="inline-block w-24 h-3 bg-gray-300 rounded animate-pulse"></span>
              ) : (
                totalScreenshots
              )}
            </p>
          </div>

          <div className="w-px h-12 bg-gray-300 mx-6"></div>

          {/* Date or Range */}
          <div className="flex-1">
            <p className="text-md text-gray-500">
              {filterType === "range" ? "Tracking Range" : "Tracking Date"}
            </p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {loading ? (
                <span className="inline-block w-24 h-3 bg-gray-300 rounded animate-pulse"></span>
              ) : (
                trackingLabel
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
