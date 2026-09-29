"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { Box, Card, CardContent, Divider, Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSelector } from "react-redux";
import { isAdmin } from "../../../utlis/isAdmin";
import WonLeadStats from "./WonLeadStats";
import UserLeadLegend from "./UserLeadLegend";

import { getDateRange } from "./utils";
import { buildChartOptions, buildChartSeries } from "./chartConfig";
import useUsersAndTeams from "./hooks/useUsersAndTeams";
import useWonLeadsData from "./hooks/useWonLeadsData";
import useLegendVisibility from "./hooks/useLegendVisibility";
import LeadChartFilters from "./LeadChartFilters";
import LeadChartHeader from "./LeadChartHeader";

const cardSx = {
  p: { xs: 1.5, md: 2 },
  bgcolor: "#FAFAFA",
  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
};

const chartCardSx = {
  bgcolor: "#fff",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  p: { xs: 1.5, sm: 2 },
  "&:last-child": { pb: { xs: 1.5, sm: 2 } },
};

const loadingSx = {
  width: "100%",
  height: 500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
  fontSize: 13,
  fontWeight: 500,
};

export default function UserLeadChart() {
  const chartRef = useRef(null);
  const auth = useSelector((state) => state.auth.auth);

  // UI state
  const [chartType, setChartType] = useState("bar");
  const [showStats, setShowStats] = useState(true);
  const [showTargets, setShowTargets] = useState(true);
  const [metric, setMetric] = useState("value"); // "count" | "value"
  const [view, setView] = useState("monthly");

  // Filters
  const defaultUsers = () =>
    isAdmin(auth) ? [] : [auth?.user?.name].filter(Boolean);
  const [selectedUsers, setSelectedUsers] = useState(defaultUsers());
  const [dateFilter, setDateFilter] = useState("thisYear");
  const [dateRange, setDateRange] = useState(getDateRange("thisYear"));

  // Data
  const { users, teams, userTeamMap } = useUsersAndTeams();
  const { categories, rawSeries, hasLoadedOnce } = useWonLeadsData({
    auth,
    selectedUsers,
    dateRange,
    view,
  });

  const showTargetSeries = showTargets;

  const chartSeries = useMemo(
    () => buildChartSeries({ rawSeries, metric, categories, showTargetSeries }),
    [rawSeries, metric, categories, showTargetSeries],
  );

  const options = useMemo(
    () =>
      buildChartOptions({
        chartType,
        categories,
        chartSeries,
        metric,
        rawSeries,
      }),
    [chartType, categories, chartSeries, metric, rawSeries],
  );

  const { hiddenSeries, toggleSeries, toggleSeriesGroup } = useLegendVisibility(
    {
      chartRef,
      chartSeries,
      selectedUsers,
      showTargetSeries,
      chartType,
      metric,
      hasLoadedOnce,
    },
  );

  // Default the selection whenever auth changes
  useEffect(() => {
    const active = "All";
    setSelectedUsers(
      isAdmin(auth)
        ? active === "All"
          ? []
          : [active]
        : [auth?.user?.name].filter(Boolean),
    );
  }, [auth]);

  const handleQuickRangeSelect = (filter) => {
    setDateFilter(filter);
    setDateRange(getDateRange(filter));
  };

  const handleDateFilterChange = (val) => {
    setDateFilter(val);
    setDateRange(val !== "custom" ? getDateRange(val) : [null, null]);
  };

  const clearFilter = () => {
    setDateFilter("thisYear");
    setView("monthly");
    setDateRange(getDateRange("thisYear"));
    setSelectedUsers(defaultUsers());
  };

  const headerLabel =
    selectedUsers.length === 0
      ? "All Users"
      : selectedUsers.length === 1
      ? selectedUsers[0]
      : `${selectedUsers.length} users`;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardSx}>
        {/* Stats + filters row */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "flex-start" }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Box sx={{ maxWidth: { lg: "60%" }, minWidth: 0 }}>
            {showStats && (
              <WonLeadStats
                users={selectedUsers}
                dateRange={dateRange}
                isAdmin={isAdmin(auth)}
              />
            )}
          </Box>

          <LeadChartFilters
            showStats={showStats}
            onToggleStats={() => setShowStats(!showStats)}
            dateFilter={dateFilter}
            onDateFilterChange={handleDateFilterChange}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onQuickRangeSelect={handleQuickRangeSelect}
            users={users}
            teams={teams}
            selectedUsers={selectedUsers}
            onUsersChange={setSelectedUsers}
            onReset={clearFilter}
          />
        </Stack>

        <Divider sx={{ mb: 2, borderColor: "rgba(15,23,42,0.06)" }} />

        {/* Chart card */}
        <CardContent sx={chartCardSx}>
          <LeadChartHeader
            headerLabel={headerLabel}
            view={view}
            onViewChange={setView}
            metric={metric}
            onMetricChange={setMetric}
            chartType={chartType}
            onChartTypeChange={setChartType}
            showTargets={showTargets}
            onToggleTargets={() => setShowTargets((v) => !v)}
          />

          {hasLoadedOnce ? (
            <Box>
              <Chart
                key={`${chartType}-${metric}-${showTargetSeries}-${rawSeries
                  .map((s) => s.user)
                  .join("|")}`}
                ref={chartRef}
                options={options}
                series={chartSeries}
                type={chartType}
                height={500}
              />
              <UserLeadLegend
                series={chartSeries}
                hidden={hiddenSeries}
                onToggleOne={toggleSeries}
                onToggleGroup={toggleSeriesGroup}
                userTeamMap={userTeamMap}
              />
            </Box>
          ) : (
            <Box sx={loadingSx} className="animate-pulse">
              Loading chart…
            </Box>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}