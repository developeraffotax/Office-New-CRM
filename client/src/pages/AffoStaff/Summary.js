import dayjs from 'dayjs';
import React from 'react'

const Summary = ({screenshots }) => {

    // --- Summary stats ---
    const avgActivity = Math.round(
      screenshots.reduce((sum, s) => sum + s.activity?.overallActivityPercent, 0) /
        screenshots.length
    );
    const totalScreenshots = screenshots.length;
    const firstDate = dayjs(screenshots[0]?.timestamp).format("MMM D");


  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-100 text-blue-800 p-4 rounded-xl shadow">
              <p className="text-sm font-medium">Average Activity</p>
              <p className="text-3xl font-bold mt-1">{avgActivity}%</p>
            </div>
            <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow">
              <p className="text-sm font-medium">Total Screenshots</p>
              <p className="text-3xl font-bold mt-1">{totalScreenshots}</p>
            </div>
            <div className="bg-orange-100 text-orange-800 p-4 rounded-xl shadow">
              <p className="text-sm font-medium">Tracking Date</p>
              <p className="text-3xl font-bold mt-1">{firstDate}</p>
            </div>
          </div>
  )
}

export default Summary