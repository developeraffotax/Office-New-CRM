import { useCallback, useEffect, useState } from "react";
import affotaxApi from "./api/affotaxApi";
import ChangeLabel from "./ChangeLabel";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import PublicIcon from "@mui/icons-material/Public";

const CHIP_ICON = { fontSize: 10 };
const CARD_ICON = { fontSize: 18 };

const SOURCE_META = {
  facebook: { label: "Facebook", icon: <FacebookIcon style={CHIP_ICON} />, color: "bg-blue-600" },
  google:   { label: "Google",   icon: <GoogleIcon style={CHIP_ICON} />,   color: "bg-red-500" },
  openai:   { label: "OpenAI",   icon: <span className="font-bold leading-none">AI</span>, color: "bg-emerald-600" },
  direct:   { label: "Direct",   icon: <PublicIcon style={CHIP_ICON} />,   color: "bg-gray-600" },
};

const TRAFFIC_SOURCES = ["facebook", "google", "openai", "direct"];

// Send calendar dates (YYYY-MM-DD) instead of UTC timestamps, so the server
// can't shift the range by a timezone. Assumes dateRange holds dayjs objects.
const buildRangeParams = (dateRange) => {
  if (!dateRange) return {};
  const [startDate, endDate] = dateRange;
  return {
    start: startDate.format("YYYY-MM-DD"),
    end: endDate.format("YYYY-MM-DD"),
  };
};

/* One compact metric card: label / value / change on the left, icon on the right.
   Optional children render in a footer row (used for the source breakdown). */
const StatCard = ({ label, value, change, dateRange, icon, iconBg, children }) => (
  <div className="rounded-lg px-3 py-2.5 bg-gray-50 border border-gray-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <h3 className="text-xl font-bold text-gray-800 leading-tight">{value}</h3>
        <div className="text-xs font-medium leading-tight mt-0.5">
          <ChangeLabel percent={change} dateRange={dateRange} />
        </div>
      </div>
      <div
        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white ${iconBg}`}
      >
        {icon}
      </div>
    </div>
    {children}
  </div>
);

/* Single row of tiny "icon + count" chips that share the full width. Hover shows the source name. */
const SourceChips = ({ counts }) => (
  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-200">
    {TRAFFIC_SOURCES.map((source) => {
      const meta = SOURCE_META[source];
      return (
        <span
          key={source}
          title={meta.label}
          className="flex flex-1 min-w-[3.5rem] items-center justify-center gap-1 rounded-md bg-white border border-gray-200 pl-1 pr-1.5 py-0.5 text-[11px] font-medium text-gray-700"
        >
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] shrink-0 ${meta.color}`}
          >
            {meta.icon}
          </span>
          {counts[source] || 0}
        </span>
      );
    })}
  </div>
);

const PerformanceStats = ({ dateRange, activeLabel }) => {
  const [totalOrders, setTotalOrders] = useState({ total: 0, change: 0 });
  const [totalSales, setTotalSales] = useState({ total: 0, change: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const [totalViews, setTotalViews] = useState({ total: 0, change: 0 });
  const [uniqueVisitors, setUniqueVisitors] = useState({ total: 0, change: 0 });
  const [totalQuotes, setTotalQuotes] = useState({ total: 0, change: 0 });
  const [totalWaSubmissions, setTotalWaSubmissions] = useState({ total: 0, change: 0 });

  const [viewsBySource, setViewsBySource] = useState({});
  const [uniqueBySource, setUniqueBySource] = useState({});
  const [quotesBySource, setQuotesBySource] = useState({});
  const [waBySource, setWaBySource] = useState({});

  const getSiteStats = useCallback(async () => {
    const params = buildRangeParams(dateRange);

    try {
      const { data } = await affotaxApi.get("/api/chart/site/stats", { params });

      setTotalViews({ total: data.totalViews, change: data.viewsPercentChange });
      setUniqueVisitors({
        total: data.totalUniqueVisitors,
        change: data.uniqueVisitorsPercentChange,
      });
      setTotalQuotes({ total: data.totalQuotes, change: data.quotesPercentChange });
      setTotalWaSubmissions({
        total: data.totalWaSubmissions,
        change: data.waSubmissionsPercentChange,
      });
      setViewsBySource(data.viewsBySource || {});
      setUniqueBySource(data.uniqueBySource || {});
      setQuotesBySource(data.quotesBySource || {});
      setWaBySource(data.waSubmissionsBySource || {});
    } catch (err) {
      console.error("Error fetching site stats:", err);
    }
  }, [dateRange]);

  const getStats = useCallback(async () => {
    const params = buildRangeParams(dateRange);
    setIsLoading(true);

    try {
      const { data } = await affotaxApi.get("/api/chart/orders/stats", { params });

      setTotalOrders({ total: data.totalOrders, change: data.ordersPercentChange });
      setTotalSales({ total: data.totalSales, change: data.salesPercentChange });
    } catch (err) {
      console.error("Error fetching chart data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    getStats();
    getSiteStats();
  }, [getStats, getSiteStats]);

  return (
    <div className="font-outfit">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3 items-start">
        <StatCard
          label="Total Sales"
          value={`£${totalSales.total}`}
          change={totalSales.change}
          dateRange={dateRange}
          icon={<AttachMoneyIcon style={CARD_ICON} />}
          iconBg="bg-orange-500"
        />

        <StatCard
          label="Total Orders"
          value={totalOrders.total}
          change={totalOrders.change}
          dateRange={dateRange}
          icon={<ShoppingCartIcon style={CARD_ICON} />}
          iconBg="bg-slate-700"
        />

        <StatCard
          label="Page Views"
          value={totalViews.total}
          change={totalViews.change}
          dateRange={dateRange}
          icon={<VisibilityIcon style={CARD_ICON} />}
          iconBg="bg-indigo-600"
        >
          <SourceChips counts={viewsBySource} />
        </StatCard>

        <StatCard
          label="Unique Visitors"
          value={uniqueVisitors.total}
          change={uniqueVisitors.change}
          dateRange={dateRange}
          icon={<PeopleIcon style={CARD_ICON} />}
          iconBg="bg-sky-600"
        >
          <SourceChips counts={uniqueBySource} />
        </StatCard>

        <StatCard
          label="Quote Requests"
          value={totalQuotes.total}
          change={totalQuotes.change}
          dateRange={dateRange}
          icon={<DescriptionIcon style={CARD_ICON} />}
          iconBg="bg-orange-500"
        >
          <SourceChips counts={quotesBySource} />
        </StatCard>

        <StatCard
          label="WhatsApp Submissions"
          value={totalWaSubmissions.total}
          change={totalWaSubmissions.change}
          dateRange={dateRange}
          icon={<WhatsAppIcon style={CARD_ICON} />}
          iconBg="bg-teal-600"
        />
      </div>
    </div>
  );
};

export default PerformanceStats;