"use client";
import { useEffect, useState } from "react";
import axios from "axios";

// Keep in sync with the palette in UserLeadChart.jsx — indices line up
// because the backend returns `stats` in the same order as the selected
// `users` list, so card N always matches series N in the chart.
const PALETTE = [
  "#008FFB", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#22C55E", "#3B82F6", "#F97316", "#06B6D4",
  "#A855F7", "#84CC16",
];
const getUserColor = (index) => PALETTE[index % PALETTE.length];

function pillStyle(pct) {
  if (pct >= 100) return { bg: "#DCFCE7", fg: "#15803D" };
  if (pct >= 50) return { bg: "#FEF9C3", fg: "#A16207" };
  return { bg: "#FEE2E2", fg: "#B91C1C" };
}

function StatCard({ stat, color }) {
  const valuePercentage =
    stat.targetValues > 0
      ? ((stat.totalValues / stat.targetValues) * 100).toFixed(2)
      : 0;

  const countPercentage =
    stat.targetCount > 0
      ? ((stat.totalCount / stat.targetCount) * 100).toFixed(2)
      : 0;

  const countPill = pillStyle(countPercentage);
  const valuePill = pillStyle(valuePercentage);

  return (
    <div
      className="min-w-[270px] shrink-0 rounded-xl bg-white overflow-hidden"
      style={{
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-2">
        <span
          className="inline-block rounded-full"
          style={{ width: 8, height: 8, backgroundColor: color }}
        />
        <span className="text-[13px] font-semibold text-slate-700 truncate">
          {stat.user}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 px-3.5 pb-3.5">
        <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-slate-50">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Count</span>
            <span className="text-sm font-bold text-slate-800">{stat.totalCount}</span>
          </div>
          <div className="flex justify-between items-baseline gap-2 pb-1 border-b border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium">Target</span>
            <span className="text-sm font-semibold text-slate-500">{stat.targetCount}</span>
          </div>
          <div className="flex justify-end">
            <span
              className="px-1.5 py-0.5 rounded text-[11px] font-bold"
              style={{ backgroundColor: countPill.bg, color: countPill.fg }}
            >
              {countPercentage}%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-slate-50">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Value</span>
            <span className="text-sm font-bold text-slate-800">
              £{stat.totalValues.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-2 pb-1 border-b border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium">Target</span>
            <span className="text-sm font-semibold text-slate-500">
              £{stat.targetValues.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-end">
            <span
              className="px-1.5 py-0.5 rounded text-[11px] font-bold"
              style={{ backgroundColor: valuePill.bg, color: valuePill.fg }}
            >
              {valuePercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// `users` is an array of selected user names (or ["All"]) — one card is
// fetched and rendered per user.
export default function WonLeadStats({ users, dateRange }) {
  const [stats, setStats] = useState([]);
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
              users: users.join(","),
              startDate: start ? start.toISOString() : null,
              endDate: end ? end.toISOString() : null,
            },
          }
        );

        setStats(res.data.stats || []);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (users?.length && dateRange?.[0] && dateRange?.[1]) {
      fetchStats();
    }
  }, [users, dateRange]);

  if (loading) {
    return (
      <div
        className="w-full flex justify-center items-center gap-2 p-3 rounded-xl text-sm text-slate-500 font-medium"
        style={{ border: "1px dashed rgba(15,23,42,0.15)" }}
      >
        Loading stats…
      </div>
    );
  }

  return (
    <div className="w-full flex gap-3 overflow-x-auto pb-1">
      {stats.map((stat, i) => (
        <StatCard key={stat.user} stat={stat} color={getUserColor(i)} />
      ))}
    </div>
  );
}