import { useCallback, useEffect, useState } from "react";
import dashboardApi from "./api/dashboardApi";
import ChangeLabel from "./ChangeLabel";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PercentIcon from "@mui/icons-material/Percent";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import PaidIcon from "@mui/icons-material/Paid";
import PersonIcon from "@mui/icons-material/Person";

/**
 * `key` matches the dot-notation keys under the real /api/v1/dashboard/stats
 * response's `stats` object exactly (e.g. stats["sales.total"] = { value, change }) —
 * same chartKey naming your chart routes already use, so this stays in
 * sync with the backend by construction rather than needing a separate
 * naming convention.
 *
 * "clients.unique" isn't one of your original 8 tabs, but the backend
 * sends it, so it's included as a bonus card — delete this entry if you
 * don't want it shown.
 */
const STAT_CARDS = [
  { key: "sales.total", label: "Total Sales", valueType: "currency", icon: <AttachMoneyIcon style={{ fontSize: 20 }} />, iconBg: "bg-orange-500" },
  { key: "sales.new", label: "New Sales", valueType: "currency", icon: <TrendingUpIcon style={{ fontSize: 20 }} />, iconBg: "bg-amber-600" },
  { key: "sales.subscription", label: "Subscription Sales", valueType: "currency", icon: <AutorenewIcon style={{ fontSize: 20 }} />, iconBg: "bg-slate-700" },
  { key: "leads.total", label: "Total Leads", valueType: "count", icon: <GroupsIcon style={{ fontSize: 20 }} />, iconBg: "bg-sky-600" },
  { key: "leads.won", label: "Won Leads", valueType: "count", icon: <EmojiEventsIcon style={{ fontSize: 20 }} />, iconBg: "bg-teal-600" },
  { key: "leads.conversion", label: "Leads Conversion", valueType: "percent", icon: <PercentIcon style={{ fontSize: 20 }} />, iconBg: "bg-indigo-600" },
  { key: "subscriptions.count", label: "Subscription Count", valueType: "count", icon: <SubscriptionsIcon style={{ fontSize: 20 }} />, iconBg: "bg-purple-600" },
  { key: "subscriptions.value", label: "Subscription Value", valueType: "currency", icon: <PaidIcon style={{ fontSize: 20 }} />, iconBg: "bg-rose-600" },
  { key: "clients.unique", label: "Unique Clients", valueType: "count", icon: <PersonIcon style={{ fontSize: 20 }} />, iconBg: "bg-cyan-600" },
];

const formatValue = (value, valueType) => {
  const num = Number(value) || 0;
  if (valueType === "currency") return `£${num.toLocaleString()}`;
  if (valueType === "percent") return `${num.toFixed(1)}%`;
  return num.toLocaleString();
};

const StatCard = ({ label, value, change, dateRange, iconBg, icon }) => (
  <div className="rounded-md p-4 bg-gray-50 border border-gray-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
    <div className="w-full flex items-start justify-between ">
      <p className="text-base   text-gray-500">{label}</p>
      <div className={`p-1.5 rounded-md text-white ${iconBg}`}>{icon}</div>
    </div>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <span className="flex items-center text-sm font-medium mt-1">
        <ChangeLabel percent={change} dateRange={dateRange} />
      </span>
    
  </div>
);

 


const PerformanceStats = ({ dateRange, source, users }) => {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getStats = useCallback(async () => {
    const params = {};
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      params.start = startDate.toISOString();
      params.end = endDate.toISOString();
    }

    if(source) {
      params.source = source;
    }

    if (users && users.length > 0) {
      params.jobHolder = users.join(",");
    }

    setIsLoading(true);
    try {
      const { data } = await dashboardApi.get("/api/v1/dashboard/stats", { params });
      // Real shape: { success, filters, stats: { "sales.total": { value, change }, ... } }
      setStats(data.stats || {});
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, source, users]);

  useEffect(() => {
    getStats();
  }, [getStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-6 min-[2000px]:grid-cols-9 gap-4 font-inter">
      {STAT_CARDS.map(({ key, label, valueType, icon, iconBg }) => {

        
        const entry = stats[key]; // { value, change } | undefined
        return (
          <StatCard
            key={key}
            label={label}
            value={isLoading ? "…" : formatValue(entry?.value, valueType)}
            change={entry?.change}
            dateRange={dateRange}
            iconBg={iconBg}
            icon={icon}
          />
        );
      })}
    </div>
  );
};

export default PerformanceStats;