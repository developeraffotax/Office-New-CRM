"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { FiCheck, FiInbox } from "react-icons/fi";
import { getUserColor } from "../constants";

const METRICS = [
  { key: "prepared", label: "Prepared" },
  { key: "reviewed", label: "Reviewed" },
  { key: "filed", label: "Filed" },
];

function statusColor(pct) {
  if (pct >= 100) return "#15803D";
  if (pct >= 50) return "#A16207";
  return "#B91C1C";
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function RingGauge({ pct, color, size = 42, stroke = 4 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Number(pct), 100);
  const offset = circumference - (clamped / 100) * circumference;
  const complete = clamped >= 100;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(15,23,42,0.07)" strokeWidth={stroke} />
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
        <span className="text-[9px] font-bold tabular-nums text-slate-800">{pct}%</span>
      </div>
      {complete && (
        <div
          className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center"
          title="Target met"
        >
          <FiCheck size={8} color={color} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, target, pct, color, divider }) {
  return (
    <div className={`flex items-center gap-2 min-w-0 ${divider ? "pl-2.5 border-l border-slate-100" : ""}`}>
      <RingGauge pct={pct} color={color} />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] text-slate-400 font-medium leading-none">{label}</span>
        <span className="text-[13px] font-bold text-slate-900 tabular-nums leading-none truncate">{value}</span>
        <span className="text-[10px] text-slate-400 tabular-nums leading-none truncate">of {target}</span>
      </div>
    </div>
  );
}

function StatCard({ stat, color, style }) {
  return (
    <div
      className="group relative min-w-[330px] shrink-0 overflow-hidden rounded-lg bg-white border border-slate-200 p-2.5 transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5"
      style={style}
    >
      <div
        className="absolute top-0 left-0 h-[2px] w-full opacity-60 transition-opacity duration-200 group-hover:opacity-100"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {getInitials(stat.user)}
        </div>
        <span className="text-[12px] font-semibold text-slate-800 tracking-tight truncate">{stat.user}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {METRICS.map(({ key, label }, i) => {
          const total = stat[key]?.total ?? 0;
          const target = stat[key]?.target ?? 0;
          const pct = target > 0 ? ((total / target) * 100).toFixed(2) : 0;
          return (
            <Metric
              key={key}
              label={label}
              value={total}
              target={target}
              pct={pct}
              color={statusColor(pct)}
              divider={i > 0}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="min-w-[330px] shrink-0 rounded-lg bg-white border border-slate-200 p-2.5 animate-pulse">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="h-6 w-6 rounded-full bg-slate-100" />
        <div className="h-2.5 w-20 rounded bg-slate-100" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 w-10 rounded-full bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 w-full rounded-lg border border-dashed border-slate-200 bg-white p-5 text-slate-400">
      <FiInbox size={16} />
      <span className="text-[12px] font-medium">No stats for this selection</span>
    </div>
  );
}

export default function JobsStats({ users, dateRange, isAdmin, dateBasis }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [start, end] = dateRange || [];

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/client/userchart/jobs/stats`, // adjust prefix
          {
            params: {
              users: users.length ? users.join(",") : "All",
              startDate: start ? start.toISOString() : null,
              endDate: end ? end.toISOString() : null,
              dateBasis,
            },
          },
        );

        setStats(res.data.stats || []);
      } catch (err) {
        console.error("Error fetching job stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if ((isAdmin || users?.length) && dateRange?.[0] && dateRange?.[1]) {
      fetchStats();
    }
  }, [users, dateRange, isAdmin, dateBasis]);

  if (loading) {
    return (
      <div className="flex gap-2 overflow-hidden pb-1">
        {[0, 1, 2].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (stats.length === 0) return <EmptyState />;

  return (
    <div className="flex gap-2 overflow-x-auto animate-badge-pop">
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