"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function WonLeadStats({ user, dateRange }) {
  const [stats, setStats] = useState({
    totalValues: 0,
    targetValues: 0,
    totalCount: 0,
    targetCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [start, end] = dateRange || [];

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/userchart/won/stats`,
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

  // Calculate percentages safely
  const valuePercentage =
    stats.targetValues > 0
      ? ((stats.totalValues / stats.targetValues) * 100).toFixed(2)
      : 0;

  const countPercentage =
    stats.targetCount > 0
      ? ((stats.totalCount / stats.targetCount) * 100).toFixed(2)
      : 0;

  return (
    <div className=" w-[25%] flex items-end justify-end  h-full">
      <div className="w-full grid grid-cols-2 gap-4   rounded-xl shadow-sm">
        {/* Counts Section */}
        <div className="flex flex-col gap-2 p-3 bg-white rounded-lg border shadow-md">
          {/* <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
          Counts
        </h3> */}
          <div className="flex justify-between gap-2 text-sm">
            <span className="text-gray-600">Count</span>
            <span className="text-blue-600 font-bold">{stats.totalCount}</span>
          </div>
          <div className="flex justify-between gap-2 text-sm  border-b pb-1 ">
            <span className="text-gray-600">Target</span>
            <span className="text-green-600 font-bold">
              {stats.targetCount}
            </span>
          </div>
          <div className="flex justify-between gap-2 text-sm">
            <span className="text-gray-600">% Achieved</span>
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold
      ${
        countPercentage >= 100
          ? "bg-green-100 text-green-700"
          : countPercentage >= 50
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700"
      }`}
            >
              {countPercentage}%
            </span>
          </div>
        </div>

        {/* Values Section */}
        <div className="flex flex-col gap-2 p-3 bg-white rounded-lg border shadow-md">
          {/* <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
          Values
        </h3> */}
          <div className="flex justify-between gap-2 text-sm">
            <span className="text-gray-600">Value</span>
            <span className="text-[#F59E0B] font-bold">
              £{stats.totalValues.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-2 text-sm  border-b pb-1">
            <span className="text-gray-600">Target</span>
            <span className="text-[#EF4444] font-bold">
              £{stats.targetValues.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-2 text-sm">
            <span className="text-gray-600">% Achieved</span>
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold
      ${
        valuePercentage >= 100
          ? "bg-green-100 text-green-700"
          : valuePercentage >= 50
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700"
      }`}
            >
              {valuePercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
