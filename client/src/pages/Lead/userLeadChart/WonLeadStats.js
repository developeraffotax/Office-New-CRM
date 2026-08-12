"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { FiCheck, FiInbox } from "react-icons/fi";

// Keep in sync with the palette in UserLeadChart.jsx — indices line up
// because the backend returns `stats` in the same order as the selected
// `users` list, so card N always matches series N in the chart.
const PALETTE = [
  "#008FFB", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#22C55E", "#3B82F6", "#F97316", "#06B6D4",
  "#A855F7", "#84CC16",
];
const getUserColor = (index) => PALETTE[index % PALETTE.length];

// Same thresholds as before (>=100 / >=50 / below) — tuned for contrast
// on a white card.
function statusColor(pct) {
  if (pct >= 100) return "#15803D"; // green-700
  if (pct >= 50) return "#A16207"; // amber-700
  return "#B91C1C"; // red-700
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function RingGauge({ pct, color, size = 56, stroke = 5 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Number(pct), 100);
  const offset = circumference - (clamped / 100) * circumference;
  const complete = clamped >= 100;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(15,23,42,0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold tabular-nums text-slate-800">
          {pct}%
        </span>
      </div>
      {complete && (
        <div
          className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center"
          title="Target met"
        >
          <FiCheck size={10} color={color} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, target, pct, color, divider }) {
  return (
    <div
      className={`flex items-center gap-3 ${
        divider ? "pl-4 border-l border-slate-100" : ""
      }`}
    >
      <RingGauge pct={pct} color={color} />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
          {label}
        </span>
        <span className="text-[15px] font-bold text-slate-900 tabular-nums truncate">
          {value}
        </span>
        <span className="text-[11px] text-slate-400 tabular-nums truncate">
          of {target}
        </span>
      </div>
    </div>
  );
}

function StatCard({ stat, color, style }) {
  const valuePercentage =
    stat.targetValues > 0
      ? ((stat.totalValues / stat.targetValues) * 100).toFixed(2)
      : 0;

  const countPercentage =
    stat.targetCount > 0
      ? ((stat.totalCount / stat.targetCount) * 100).toFixed(2)
      : 0;

  return (
    <div
      className="group relative min-w-[300px] shrink-0 overflow-hidden rounded-md  bg-white border border-slate-200 p-2 transition-all duration-200   hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/60"
      style={style}
    >
      <div
        className="absolute top-0 left-0  h-[2px] w-full rounded-full opacity-60 transition-opacity duration-200 group-hover:opacity-100"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {getInitials(stat.user)}
        </div>
        <span className="text-[13px] font-semibold text-slate-800 tracking-tight truncate">
          {stat.user}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="Count"
          value={stat.totalCount}
          target={stat.targetCount}
          pct={countPercentage}
          color={statusColor(countPercentage)}
        />
        <Metric
          label="Value"
          value={`£${stat.totalValues.toLocaleString()}`}
          target={`£${stat.targetValues.toLocaleString()}`}
          pct={valuePercentage}
          color={statusColor(valuePercentage)}
          divider
        />
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="min-w-[300px] shrink-0 rounded-2xl bg-white border border-slate-200 p-4 animate-pulse">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-full bg-slate-100" />
        <div className="h-3 w-24 rounded bg-slate-100" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 w-14 rounded-full bg-slate-100" />
        <div className="h-14 w-14 rounded-full bg-slate-100 ml-4" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-slate-400">
      <FiInbox size={20} />
      <span className="text-[13px] font-medium">No stats for this selection</span>
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
      <div className="flex gap-3 overflow-hidden pb-1">
        {[0, 1, 2].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (stats.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex gap-3 overflow-x-auto animate-badge-pop">
      
      {stats.map((stat, i) => (
        <StatCard
          key={stat.user}
          stat={stat}
          color={getUserColor(i)}
          style={{
            animation: "stat-card-in 0.4s ease both",
            animationDelay: `${i * 45}ms`,
          }}
        />
      ))}
    </div>
  );
}