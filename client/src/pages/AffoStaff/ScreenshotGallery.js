import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { FaRegImages } from "react-icons/fa";
import { ImageModal } from "./ImageModal";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

const ScreenshotGallery = ({ screenshots, loading }) => {
  const [modalIndex, setModalIndex] = useState(null);

  // --- Sort screenshots by time ---
  const sortedScreenshots = useMemo(() => {
    return [...(screenshots || [])].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [screenshots]);

  // --- Compute hourly spans based on screenshots ---
  const groupedScreenshots = useMemo(() => {
    if (!sortedScreenshots.length) return [];

    const start = dayjs(sortedScreenshots[0].timestamp).startOf("hour");
    const end = dayjs(
      sortedScreenshots[sortedScreenshots.length - 1].timestamp
    ).endOf("hour");

    const hours = [];
    let current = start;

    while (current.isBefore(end)) {
      const next = current.add(1, "hour");
      const label = `${current.format("h:mm A")} - ${next.format("h:mm A")}`;

      const hourShots = sortedScreenshots.filter((shot) => {
        const time = dayjs(shot.timestamp);
        return time.isAfter(current) && time.isBefore(next);
      });

      hours.push({ label, screenshots: hourShots });
      current = next;
    }

    return hours;
  }, [sortedScreenshots]);

  // --- Modal Navigation Handlers ---
  const handleOpen = (index) => setModalIndex(index);
  const handleClose = () => setModalIndex(null);

  const handleNext = () => {
    setModalIndex((prev) =>
      prev === sortedScreenshots.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setModalIndex((prev) =>
      prev === 0 ? sortedScreenshots.length - 1 : prev - 1
    );
  };

  
  return (
  <div className="bg-white p-8 rounded-none shadow border">

    {/* Header */}
    <h3 className="text-[17px] font-semibold mb-6 flex items-center gap-2 text-gray-800">
      <FaRegImages className="text-blue-500 text-[18px]" />
      <span className="tracking-tight">Screenshot Gallery</span>
    </h3>

    {loading ? (
      // -----------------------
      // PREMIUM LOADING SKELETON
      // -----------------------
      <div className="space-y-10 animate-pulse">

        {[...Array(3)].map((_, hourIdx) => (
          <div key={hourIdx} className="flex items-start gap-6">

            {/* Timeline Label Placeholder */}
            <div className="w-36 text-right pr-4 border-r border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>

            {/* Screenshots Grid Placeholder */}
            <div className="grid flex-1 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {[...Array(5)].map((_, shotIdx) => (
                <div
                  key={shotIdx}
                  className="pb-4 rounded-lg border border-gray-300 shadow-sm overflow-hidden"
                >
                  {/* Thumbnail Placeholder */}
                  <div className="h-36 bg-gray-200 rounded-lg"></div>

                  {/* Activity Bar Placeholder */}
                  <div className="mt-2 px-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="h-2 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-2 bg-gray-300 rounded w-1/6"></div>
                    </div>
                    <div className="h-2 bg-gray-300 rounded w-full"></div>
                  </div>

                  {/* Window Title & Times Placeholder */}
                  <div className="mt-2 px-4 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex justify-between">
                      <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    ) : (
      // -----------------------
      // REAL GALLERY
      // -----------------------
      <div className="space-y-10">
        {groupedScreenshots.map(({ label, screenshots: hourShots }) => (
          <div key={label} className="flex items-start gap-6">
            {/* Timeline Label */}
            <div className="w-36 text-right pr-4 border-r border-gray-200">
              <p className="text-sm font-medium text-gray-700">{label}</p>
            </div>

            {/* Screenshots */}
            <div className="grid flex-1 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {hourShots.length > 0 ? (
                hourShots.map((shot, idx) => {
                  const overallIndex = sortedScreenshots.findIndex(
                    (s) => s._id === shot._id
                  );

                  const startTime = shot.activity?.startedAt
                    ? dayjs(shot.activity.startedAt).format("h:mm A")
                    : "N/A";
                  const endTime = shot.activity?.endedAt
                    ? dayjs(shot.activity.endedAt).format("h:mm A")
                    : "N/A";
                  const activityPercent =
                    shot.activity?.overallActivityPercent || 0;

                  return (
                    <div
                      key={shot._id}
                      className="pb-4 rounded-lg border hover:shadow-md shadow-black/50 border-gray-300 transition overflow-hidden"
                    >
                      <div className="relative h-36 bg-gray-50">
                        <ScreenshotThumbnail
                          src={shot.signedUrl}
                          alt={shot.activeWindow?.title || "Screenshot"}
                          onClick={() => handleOpen(overallIndex)}
                        />
                      </div>

                      <div className="mt-2 relative group px-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Activity</span>
                          <span>{activityPercent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200 relative">
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
                            {shot.activity?.keyboardActivityPercent || 0}% | Mouse:{" "}
                            {shot.activity?.mouseActivityPercent || 0}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 px-4">
                        <p className="text-xs text-gray-600 truncate">
                          {shot.activeWindow?.title || "No title"}
                        </p>
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-400">
                            {startTime} - {endTime}
                          </p>
                          <p className="text-xs text-gray-400">
                            Taken at: {dayjs(shot.timestamp).format("h:mm A")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No screenshots for this hour
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Modal */}
    {modalIndex !== null && (
      <ImageModal
        src={sortedScreenshots[modalIndex].signedUrl}
        alt={sortedScreenshots[modalIndex].activeWindow?.title || "Screenshot"}
        takenAt={dayjs(sortedScreenshots[modalIndex].timestamp).format(
          "MMMM D, YYYY h:mm A"
        )}
        onClose={handleClose}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    )}
  </div>
);

};

export default ScreenshotGallery;
