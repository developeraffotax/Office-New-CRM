"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function WonTicketStats({ user, dateRange }) {
  const [stats, setStats] = useState({
  ticketsGenerated: 0,
  ticketsGeneratedTarget: 0,
  ticketsReplied: 0,
  ticketsRepliedTarget: 0,
});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [start, end] = dateRange || [];

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/tickets/userchart/ticketActivity/stats`,
          {
            params: {
              user: user !== "All" ? user : null,
              startDate: start ? start.toISOString() : null,
              endDate: end ? end.toISOString() : null,
            },
          }
        );

        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && dateRange?.[0] && dateRange?.[1]) {
      fetchStats();
    }
  }, [user, dateRange]);

  if (loading) {
    return (
      <div className="  w-[25%] h-full   flex  justify-center items-center gap-2 p-3 border rounded-md shadow-sm text-sm text-gray-600">
        Loading stats...
      </div>
    );
  }

const generatedPercentage =
  stats.ticketsGeneratedTarget > 0
    ? (
        (stats.ticketsGenerated / stats.ticketsGeneratedTarget) *
        100
      ).toFixed(2)
    : 0;

const repliedPercentage =
  stats.ticketsRepliedTarget > 0
    ? (
        (stats.ticketsReplied / stats.ticketsRepliedTarget) *
        100
      ).toFixed(2)
    : 0;

return (
  <div className="w-[25%] flex items-end justify-end h-full">
    <div className="w-full grid grid-cols-2 gap-4 rounded-xl shadow-sm">

      {/* Tickets Generated */}
      <div className="flex flex-col gap-2 p-3 bg-white rounded-lg border shadow-md">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Generated</span>
          <span className="text-blue-600 font-bold">
            {stats.ticketsGenerated}
          </span>
        </div>

        <div className="flex justify-between text-sm border-b pb-1">
          <span className="text-gray-600">Target</span>
          <span className="text-green-600 font-bold">
            {stats.ticketsGeneratedTarget}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">% Achieved</span>
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-bold
              ${
                generatedPercentage >= 100
                  ? "bg-green-100 text-green-700"
                  : generatedPercentage >= 50
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
          >
            {generatedPercentage}%
          </span>
        </div>
      </div>

      {/* Tickets Replied */}
      <div className="flex flex-col gap-2 p-3 bg-white rounded-lg border shadow-md">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Replied</span>
          <span className="text-purple-600 font-bold">
            {stats.ticketsReplied}
          </span>
        </div>

        <div className="flex justify-between text-sm border-b pb-1">
          <span className="text-gray-600">Target</span>
          <span className="text-red-600 font-bold">
            {stats.ticketsRepliedTarget}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">% Achieved</span>
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-bold
              ${
                repliedPercentage >= 100
                  ? "bg-green-100 text-green-700"
                  : repliedPercentage >= 50
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
          >
            {repliedPercentage}%
          </span>
        </div>
      </div>
    </div>
  </div>
);

}
