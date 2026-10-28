import dayjs from "dayjs";
import React, { useState, useMemo } from "react";
import { FaRegImages, FaKeyboard, FaMouse } from "react-icons/fa";
import { ImageModal } from "./ImageModal";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

export default function ScreenshotGallery({ screenshots, loading }) {
  const [modalIndex, setModalIndex] = useState(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // -----------------------------
  // 1️⃣ SORT SCREENSHOTS
  // -----------------------------
  const sortedScreenshots = useMemo(() => {
    return [...(screenshots || [])].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );
  }, [screenshots]);

  // -----------------------------
  // 2️⃣ GROUP BY DATE → THEN BY HOUR
  // -----------------------------
  const groupedByDate = useMemo(() => {
    const groups = {};

    sortedScreenshots.forEach((shot) => {
      const dateLabel = dayjs(shot.timestamp).format("MMMM D, YYYY");

      if (!groups[dateLabel]) groups[dateLabel] = {};

      const hour = dayjs(shot.timestamp).startOf("hour");
      const next = hour.add(1, "hour");

      const hourLabel = `${hour.format("h:mm A")} - ${next.format("h:mm A")}`;

      if (!groups[dateLabel][hourLabel]) groups[dateLabel][hourLabel] = [];

      groups[dateLabel][hourLabel].push(shot);
    });

    return groups;
  }, [sortedScreenshots]);

  const allDates = Object.keys(groupedByDate);

  const currentDate = allDates[currentDayIndex];
  const currentHours = currentDate ? groupedByDate[currentDate] : {};

  // -----------------------------
  // MODAL HANDLERS
  // -----------------------------
  const handleOpen = (globalIndex) => setModalIndex(globalIndex);
  const handleClose = () => setModalIndex(null);

  const handleNextModal = () =>
    setModalIndex((i) => (i === sortedScreenshots.length - 1 ? 0 : i + 1));

  const handlePrevModal = () =>
    setModalIndex((i) => (i === 0 ? sortedScreenshots.length - 1 : i - 1));

  // -----------------------------
  // DAY NAVIGATION
  // -----------------------------
  const handlePrevDay = () => setCurrentDayIndex((i) => Math.max(i - 1, 0));
  const handleNextDay = () =>
    setCurrentDayIndex((i) => Math.min(i + 1, allDates.length - 1));

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="bg-white p-8 rounded-none shadow border font-inter">
      {/* HEADER */}
      <h3 className="text-[17px] font-semibold mb-6 flex items-center gap-2 text-gray-800">
        <FaRegImages className="text-blue-500 text-[18px]" />
        <span className="tracking-tight">Screenshot Gallery</span>
      </h3>

      {/* DAY NAVIGATION */}
      {!loading && allDates.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <button
            disabled={currentDayIndex === 0}
            onClick={handlePrevDay}
            className="px-4 py-1 bg-gray-100 border rounded disabled:opacity-50"
          >
            Prev Day
          </button>

          <p className="text-sm text-gray-500">{currentDate}</p>

          <button
            disabled={currentDayIndex === allDates.length - 1}
            onClick={handleNextDay}
            className="px-4 py-1 bg-gray-100 border rounded disabled:opacity-50"
          >
            Next Day
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      {loading ? (
        <p>Loading...</p>
      ) : currentDate ? (
        <div className="space-y-10">
          {Object.entries(currentHours).map(([hourLabel, hourShots]) => (
            <div key={hourLabel} className="flex items-start gap-6">
              {/* Hour label */}
              <div className="w-36 text-right pr-4 border-r border-gray-200">
                <p className="text-sm font-medium text-gray-700">{hourLabel}</p>
              </div>

              {/* Screenshot grid */}
              <div className="grid flex-1 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {hourShots.map((shot) => {
                  const globalIndex = sortedScreenshots.findIndex(
                    (s) => s._id === shot._id,
                  );

                  const activityPercent =
                    shot.activity?.overallActivityPercent || 0;

                  return (
                    <div
                      key={shot._id}
                      className="pb-4 rounded-lg border hover:shadow-md transition overflow-hidden"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-36 bg-gray-50">
                        <ScreenshotThumbnail
                          src={shot.signedUrl}
                          alt={shot.activeWindow?.title || "Screenshot"}
                          onClick={() => handleOpen(globalIndex)}
                        />
                      </div>

                      {/* Time slot + period */}
                      {shot.activity?.startedAt && shot.activity?.endedAt && (
                        <div className="mt-2 px-4 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">
                            {dayjs(shot.activity.startedAt).format("h:mm A")} -{" "}
                            {dayjs(shot.activity.endedAt).format("h:mm A")}
                          </span>
                          {shot.activity?.period && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                              {shot.activity.period.replace("min", " min")}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Activity */}

                      <div className="mt-2 px-4">
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs">
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <FaKeyboard className="text-gray-400" />
                              Keyboard
                            </span>
                            <span className="text-gray-800">
                              <span className="font-semibold">
                                {shot.activity?.keyboardActivityPercent ?? 0}%
                              </span>
                              <span className="mx-1 text-gray-300">•</span>
                              <span>{shot.activity?.keyboardCount ?? 0}</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs">
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <FaMouse className="text-gray-400" />
                              Mouse
                            </span>
                            <span className="text-gray-800">
                              <span className="font-semibold">
                                {shot.activity?.mouseActivityPercent ?? 0}%
                              </span>
                              <span className="mx-1 text-gray-300">•</span>
                              <span>{shot.activity?.mouseCount ?? 0}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Activity</span>
                          <span>{activityPercent}%</span>
                        </div>

                        {/* Activity bar with hover tooltip */}
                        <div className="h-2 rounded-full bg-gray-200 relative group">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${activityPercent}%`,
                              backgroundColor:
                                activityPercent > 50
                                  ? "#16a34a"
                                  : activityPercent > 20
                                  ? "#facc15"
                                  : "#ef4444",
                            }}
                          />

                          <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Keyboard:{" "}
                            {shot.activity?.keyboardActivityPercent || 0}% |
                            Mouse: {shot.activity?.mouseActivityPercent || 0}%
                          </div>
                        </div>

                        {/* Keyboard + Mouse: percent and count on one line each */}
                      </div>

                      {/* Window title */}
                      <div className="mt-2 px-4">
                        <p className="text-xs text-gray-600 truncate">
                          {shot.activeWindow?.title || "No title"}
                        </p>

                        {/* <p className="text-xs text-gray-400">
                          Taken at: {dayjs(shot.timestamp).format("h:mm A")}
                        </p> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No screenshots available.</p>
      )}

      {/* MODAL */}
      {modalIndex !== null && sortedScreenshots[modalIndex] && (
        <ImageModal
          src={sortedScreenshots[modalIndex].signedUrl}
          alt={sortedScreenshots[modalIndex].activeWindow?.title}
          takenAt={dayjs(sortedScreenshots[modalIndex].timestamp).format(
            "MMMM D, YYYY h:mm A",
          )}
          onClose={handleClose}
          onNext={handleNextModal}
          onPrev={handlePrevModal}
        />
      )}
    </div>
  );
}
