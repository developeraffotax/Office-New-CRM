"use client";
import React, { useCallback, useMemo } from "react";
import { Card, CardContent, Divider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSelector } from "react-redux";
import { isAdmin } from "../../../utlis/isAdmin";

import ChartToolbar from "./components/ChartToolbar";
import ChartHeader from "./components/ChartHeader";
import ChartCanvas from "./components/ChartCanvas";
import useChartFilters from "./hooks/useChartFilters";
import useChartView from "./hooks/useChartView";
import useUsersAndTeams from "./hooks/useUsersAndTeams";
import useJobsData from "./hooks/useJobsData";
import { getHeaderLabel, isDailyAllowed } from "./utils";
import { cardSx, chartCardSx, dividerSx } from "./styles";
import { DEFAULTS } from "./constants";
import { useSavedFilters } from "../../../components/SavedFilters/useSavedFilters";
import SavedViews from "./components/SavedViews";

const selectAuth = (state) => state.auth.auth;

export default function UserJobsChart() {
  const auth = useSelector(selectAuth);
  const admin = isAdmin(auth);

  const filters = useChartFilters(auth);
  const { dateBasis, setDateBasis } = filters;

  const dailyAllowed = useMemo(
    () => isDailyAllowed(filters.dateRange),
    [filters.dateRange],
  );
  const viewState = useChartView({ dailyAllowed });
  const { metric, setMetric } = viewState;

  const { users, teams, userTeamMap } = useUsersAndTeams();
  const { categories, rawSeries, hasLoadedOnce } = useJobsData({
    auth,
    selectedUsers: filters.selectedUsers,
    dateRange: filters.dateRange,
    view: viewState.view,
    metric,
    dateBasis,
  });

  // separate key so jobs views don't mix with the won-leads saved views
  const savedFiltersHook = useSavedFilters("jobs_targets_dashboard");

  const snapshot = useMemo(
    () => ({
      dateFilter: filters.dateFilter,
      dateRange: {
        start: filters.dateRange[0]?.toISOString?.() ?? null,
        end: filters.dateRange[1]?.toISOString?.() ?? null,
      },
      users: filters.selectedUsers,
      view: viewState.view,
      metric,
      chartType: viewState.chartType,
      showTargets: viewState.showTargets,
      showStats: viewState.showStats,
      dateBasis,
    }),
    [
      filters.dateFilter, filters.dateRange, filters.selectedUsers,
      viewState.view, viewState.chartType,
      viewState.showTargets, viewState.showStats, metric, dateBasis,
    ],
  );

  const { applyFilters } = filters;
  const handleApplyView = useCallback(
    (v) => {
      applyFilters(v); // also applies v.dateBasis (see the fix below)
      if (v.view) viewState.setView(v.view);
      if (v.metric) viewState.setMetric(v.metric);
      if (v.chartType) viewState.setChartType(v.chartType);
      if (!!v.showTargets !== viewState.showTargets) viewState.toggleTargets();
      if (!!v.showStats !== viewState.showStats) viewState.toggleStats();
    },
    [applyFilters, viewState],
  );

  const savedViews = (
    <SavedViews
      snapshot={snapshot}
      onApply={handleApplyView}
      savedFiltersHook={savedFiltersHook}
    />
  );

  const { reset: resetFilters } = filters; // also resets dateBasis
  const { resetView } = viewState;
  const handleReset = useCallback(() => {
    resetFilters();
    resetView();
    setMetric(DEFAULTS.metric); // resetView only resets `view`
  }, [resetFilters, resetView, setMetric]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardSx}>
        <ChartToolbar
          admin={admin}
          showStats={viewState.showStats}
          onToggleStats={viewState.toggleStats}
          filters={filters}
          users={users}
          teams={teams}
          onReset={handleReset}
          savedViews={savedViews}
          dateBasis={dateBasis}
        />

        <Divider sx={dividerSx} />

        <CardContent sx={chartCardSx}>
          <ChartHeader
            headerLabel={getHeaderLabel(filters.selectedUsers)}
            view={viewState.view}
            onViewChange={viewState.setView}
            metric={metric}
            onMetricChange={setMetric}
            chartType={viewState.chartType}
            onChartTypeChange={viewState.setChartType}
            showTargets={viewState.showTargets}
            onToggleTargets={viewState.toggleTargets}
            dailyAllowed={dailyAllowed}
            dateBasis={dateBasis}
            onDateBasisChange={setDateBasis}
          />

          <ChartCanvas
            rawSeries={rawSeries}
            categories={categories}
            hasLoadedOnce={hasLoadedOnce}
            chartType={viewState.chartType}
            metric={metric}
            showTargets={viewState.showTargets}
            selectedUsers={filters.selectedUsers}
            userTeamMap={userTeamMap}
          />
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}