import { useCallback, useEffect, useState } from "react";
import affotaxApi from "./api/affotaxApi";
import ChangeLabel from "./ChangeLabel";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const StatCard = ({ label, value, change, dateRange, iconBg, icon }) => (
  <div className="rounded-xl p-5 bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <span className="flex items-center text-sm font-medium mt-1">
        <ChangeLabel percent={change} dateRange={dateRange} />
      </span>
    </div>
    <div className={`p-3 rounded-full text-white ${iconBg}`}>{icon}</div>
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

  const getSiteStats = useCallback(async () => {
    const params = {};
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      params.start = startDate.toISOString();
      params.end = endDate.toISOString();
    }

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
    } catch (err) {
      console.error("Error fetching site stats:", err);
    }
  }, [dateRange]);

  const getStats = useCallback(async () => {
    const params = {};
    setIsLoading(true);
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      params.start = startDate.toISOString();
      params.end = endDate.toISOString();
    }

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
    <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-6 gap-4 font-outfit">
      <StatCard
        label="Total Sales"
        value={`£${totalSales.total}`}
        change={totalSales.change}
        dateRange={dateRange}
        iconBg="bg-orange-500"
        icon={<AttachMoneyIcon style={{ fontSize: 20 }} />}
      />
      <StatCard
        label="Total Orders"
        value={totalOrders.total}
        change={totalOrders.change}
        dateRange={dateRange}
        iconBg="bg-slate-700"
        icon={<ShoppingCartIcon style={{ fontSize: 20 }} />}
      />
      <StatCard
        label="Page Views"
        value={totalViews.total}
        change={totalViews.change}
        dateRange={dateRange}
        iconBg="bg-teal-600"
        icon={<StackedLineChartIcon style={{ fontSize: 20 }} />}
      />
      <StatCard
        label="Unique Visitors"
        value={uniqueVisitors.total}
        change={uniqueVisitors.change}
        dateRange={dateRange}
        iconBg="bg-sky-600"
        icon={<PersonIcon style={{ fontSize: 20 }} />}
      />
      <StatCard
        label="Quote Requests"
        value={totalQuotes.total}
        change={totalQuotes.change}
        dateRange={dateRange}
        iconBg="bg-orange-500"
        icon={<DescriptionIcon style={{ fontSize: 20 }} />}
      />
      <StatCard
        label="WhatsApp Submissions"
        value={totalWaSubmissions.total}
        change={totalWaSubmissions.change}
        dateRange={dateRange}
        iconBg="bg-teal-600"
        icon={<WhatsAppIcon style={{ fontSize: 20 }} />}
      />
    </div>
  );
};

export default PerformanceStats;
