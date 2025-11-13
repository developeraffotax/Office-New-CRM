import dayjs from 'dayjs';
import React from 'react'
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";


const Timeline = ({screenshots}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow border">
        <h3 className="font-semibold mb-4">Timeline</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {screenshots.map((shot) => {
            const activity = shot.activity?.overallActivityPercent || 0;
            return (
              <div
                key={shot._id}
                className="flex flex-col items-center min-w-[80px]"
              >
                <div
                  className="w-3 rounded-full"
                  style={{
                    height: `${activity}px`,
                    backgroundColor:
                      activity > 70
                        ? "#16a34a"
                        : activity > 40
                        ? "#facc15"
                        : "#ef4444",
                  }}
                  title={`${activity}% activity`}
                ></div>
                <Zoom>
                  <img
                    src={shot.signedUrl}
                    alt="Screenshot"
                    className="w-20 h-14 mt-2 rounded-md shadow cursor-pointer object-cover"
                  />
                </Zoom>
                <p className="text-xs text-gray-500 mt-1">
                  {dayjs(shot.timestamp).format("HH:mm")}
                </p>
              </div>
            );
          })}
        </div>
      </div>
  )
}

export default Timeline