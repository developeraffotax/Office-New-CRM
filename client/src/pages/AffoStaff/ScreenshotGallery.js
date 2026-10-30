import dayjs from "dayjs";
import React, { useState, useMemo } from "react";
import { FaRegImages, FaKeyboard, FaMouse } from "react-icons/fa";
import { ImageModal } from "./ImageModal";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";
import { useSelector } from "react-redux";
import { isAdmin } from "../../utlis/checkPermission";

// Same thresholds as before (>50 green, >20 amber, else red),
// kept as full class names so Tailwind can pick them up.
const getTone = (percent) => {
  if (percent > 50)
    return { bar: "bg-emerald-500", text: "text-emerald-700", dot: "bg-emerald-500" };
  if (percent > 20)
    return { bar: "bg-amber-400", text: "text-amber-700", dot: "bg-amber-400" };
  return { bar: "bg-rose-500", text: "text-rose-700", dot: "bg-rose-500" };
};

// Average overall activity % for a group of screenshots
const getAverageActivity = (shots) => {
  if (!shots.length) return 0;
  const total = shots.reduce(
    (sum, s) => sum + (s.activity?.overallActivityPercent || 0),
    0,
  );
  return Math.round(total / shots.length);
};

export default function ScreenshotGallery({ screenshots, loading }) {
  const [modalIndex, setModalIndex] = useState(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const { auth: { user }, } = useSelector((state) => state.auth);
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
        /* LOADING SKELETON */
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-lg border border-gray-200"
            >
              <div className="h-36 bg-gray-100" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-2/3 rounded bg-gray-100" />
                <div className="h-2 rounded-full bg-gray-100" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : currentDate ? (
        <div className="space-y-10">
          {Object.entries(currentHours).map(([hourLabel, hourShots]) => {
            const hourAverage = getAverageActivity(hourShots);
            const hourTone = getTone(hourAverage);

            return (
            <div key={hourLabel} className="flex items-start gap-6">
              {/* Hour label + average */}
              <div className="w-36 text-right pr-4 border-r border-gray-200">
                <p className="text-sm font-medium text-gray-700">{hourLabel}</p>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Average activity</p>
                  <p className="flex items-center justify-end gap-2 text-lg font-semibold text-gray-900">
                    <span className={`h-2.5 w-2.5 rounded-full ${hourTone.dot}`} />
                    {hourAverage}%
                  </p>
                </div>
              </div>

              {/* Screenshot grid */}
              <div className="grid flex-1 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {hourShots.map((shot) => {
                  const globalIndex = sortedScreenshots.findIndex(
                    (s) => s._id === shot._id,
                  );

                  const activityPercent =
                    shot.activity?.overallActivityPercent || 0;
                  const tone = getTone(activityPercent);

                  return (
                    <div
                      key={shot._id}
                      className="pb-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition overflow-hidden"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-36 bg-gray-50 border-b border-gray-200">
                        <ScreenshotThumbnail
                          src={shot.signedUrl}
                          alt={shot.activeWindow?.title || "Screenshot"}
                          onClick={() => handleOpen(globalIndex)}
                        />
                      </div>

                      {/* Time slot + period */}
                      {shot.activity?.startedAt && shot.activity?.endedAt && (
                        <div className="mt-3 px-4 flex items-center justify-between">
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
                      <div className="mt-3 px-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-gray-500">Activity</span>
                          <span className={`font-semibold ${tone.text}`}>
                            {activityPercent}%
                          </span>
                        </div>

                        <div
                          className="h-2 rounded-full bg-gray-200 overflow-hidden"
                          title={`Keyboard: ${
                            shot.activity?.keyboardActivityPercent || 0
                          }% | Mouse: ${
                            shot.activity?.mouseActivityPercent || 0
                          }%`}
                        >
                          <div
                            className={`h-2 rounded-full transition-all ${tone.bar}`}
                            style={{ width: `${activityPercent}%` }}
                          />
                        </div>

                        {/* Keyboard | Mouse inline */}
                            
                        {
                          isAdmin(user) && (
                            <div className="mt-3 flex items-stretch rounded-md bg-gray-50 border border-gray-100 text-xs">
                          <div
                            className="flex-1 min-w-0 px-2.5 py-2"
                            title="Keyboard"
                          >
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <FaKeyboard className="shrink-0 text-gray-400" />
                              <span className="text-[11px] font-medium">
                                Keyboard
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm font-semibold leading-none text-gray-900">
                              {shot.activity?.keyboardActivityPercent ?? 0}%
                            </p>
                            <p className="mt-1 text-[11px] leading-tight text-gray-500">
                              {shot.activity?.keyboardCount ?? 0} keys
                            </p>
                          </div>

                          {/* Divider bar */}
                          <div className="w-px self-stretch bg-gray-300 my-1.5" />

                          <div
                            className="flex-1 min-w-0 px-2.5 py-2"
                            title="Mouse movement and clicks"
                          >
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <FaMouse className="shrink-0 text-gray-400" />
                              <span className="text-[11px] font-medium">
                                Mouse
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm font-semibold leading-none text-gray-900">
                              {shot.activity?.mouseActivityPercent ?? 0}%
                            </p>
                            <p className="mt-1 text-[11px] leading-tight text-gray-500">
                              {shot.activity?.mouseCount ?? 0} moves &amp; clicks
                            </p>
                          </div>
                        </div>

                          )
                        }

                        
                      </div>

                      {/* Window title */}
                      <div className="mt-3 px-4">
                        <p
                          className="text-xs text-gray-600 truncate"
                          title={shot.activeWindow?.title || "No title"}
                        >
                          {shot.activeWindow?.title || "No title"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <FaRegImages className="text-xl" />
          </span>
          <p className="text-sm font-medium text-gray-800">
            No screenshots available
          </p>
        </div>
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