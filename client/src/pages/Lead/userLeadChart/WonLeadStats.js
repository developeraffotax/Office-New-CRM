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
      <div className="flex flex-col items-center gap-2 p-3 border rounded-md shadow-sm w-56 text-sm text-gray-600">
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
    <div className="flex flex-col items-center gap-3 p-4 border rounded-md shadow-sm w-64 bg-white">
      {/* Values Section */}
      <div className="w-full">
        <div className="text-sm font-semibold text-gray-700">
          Total Values:{" "}
          <span className="text-blue-600 font-bold">
            £{stats.totalValues.toLocaleString()}
          </span>
        </div>
        <div className="text-sm font-semibold text-gray-700">
          Target Values:{" "}
          <span className="text-green-600 font-bold">
            £{stats.targetValues.toLocaleString()}
          </span>
        </div>
        <div className="text-sm font-semibold text-gray-700">
          % Achieved:{" "}
          <span className="text-orange-600 font-bold">{valuePercentage}%</span>
        </div>
      </div>

      <hr className="w-full border-gray-200" />

      {/* Counts Section */}
      <div className="w-full">
        <div className="text-sm font-semibold text-gray-700">
          Total Count:{" "}
          <span className="text-blue-600 font-bold">{stats.totalCount}</span>
        </div>
        <div className="text-sm font-semibold text-gray-700">
          Target Count:{" "}
          <span className="text-green-600 font-bold">{stats.targetCount}</span>
        </div>
        <div className="text-sm font-semibold text-gray-700">
          % Achieved:{" "}
          <span className="text-orange-600 font-bold">{countPercentage}%</span>
        </div>
      </div>
    </div>
  );
}
