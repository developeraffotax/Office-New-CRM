"use client";
import React, { useCallback, useMemo } from "react";
import { Card, CardContent, Divider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSelector } from "react-redux";
import { isAdmin } from "../../../utlis/isAdmin";

import LeadChartToolbar from "./components/LeadChartToolbar";
import LeadChartHeader from "./components/LeadChartHeader";
import LeadChartCanvas from "./components/LeadChartCanvas";
import useLeadChartFilters from "./hooks/useLeadChartFilters";
import useLeadChartView from "./hooks/useLeadChartView";
import useUsersAndTeams from "./hooks/useUsersAndTeams";
import useWonLeadsData from "./hooks/useWonLeadsData";
import { getHeaderLabel, isDailyAllowed } from "./utils";
import { cardSx, chartCardSx, dividerSx } from "./styles";
import { useSavedFilters } from "../../../components/SavedFilters/useSavedFilters";
import SavedViews from "./components/SavedViews";

const selectAuth = (state) => state.auth.auth;

export default function UserLeadChart() {
  const auth = useSelector(selectAuth);
  const admin = isAdmin(auth);

  const filters = useLeadChartFilters(auth);


  const {dateBasis, setDateBasis, } = filters;

  const dailyAllowed = useMemo(
    () => isDailyAllowed(filters.dateRange),
    [filters.dateRange],
  );
  const viewState = useLeadChartView({ dailyAllowed });

  const { users, teams, userTeamMap } = useUsersAndTeams();
  const { categories, rawSeries, hasLoadedOnce } = useWonLeadsData({
    auth,
    selectedUsers: filters.selectedUsers,
    dateRange: filters.dateRange,
    view: viewState.view,
    dateBasis
  });




  const savedFiltersHook = useSavedFilters("targets_dashboard");

const snapshot = useMemo(
  () => ({
    dateFilter: filters.dateFilter,
    dateRange: {
      start: filters.dateRange[0]?.toISOString?.() ?? null,
      end: filters.dateRange[1]?.toISOString?.() ?? null,
    },
    users: filters.selectedUsers,
    view: viewState.view,
    metric: viewState.metric,
    chartType: viewState.chartType,
    showTargets: viewState.showTargets,
    showStats: viewState.showStats,
    dateBasis
  }),
  [
    filters.dateFilter, filters.dateRange, filters.selectedUsers,
    viewState.view, viewState.metric, viewState.chartType,
    viewState.showTargets, viewState.showStats, dateBasis
  ],
);

const { applyFilters } = filters;
const handleApplyView = useCallback(
  (v) => {
    applyFilters(v);
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



  const { reset: resetFilters } = filters;
  const { resetView } = viewState;
  const handleReset = useCallback(() => {
    resetFilters();
    resetView();
  }, [resetFilters, resetView]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardSx}>
        <LeadChartToolbar
          admin={admin}
          showStats={viewState.showStats}
          onToggleStats={viewState.toggleStats}
          filters={filters}
          users={users}
          teams={teams}
          onReset={handleReset}

          savedViews={savedViews}
        />

        <Divider sx={dividerSx} />

        <CardContent sx={chartCardSx}>
          <LeadChartHeader
            headerLabel={getHeaderLabel(filters.selectedUsers)}
            view={viewState.view}
            onViewChange={viewState.setView}
            metric={viewState.metric}
            onMetricChange={viewState.setMetric}
            chartType={viewState.chartType}
            onChartTypeChange={viewState.setChartType}
            showTargets={viewState.showTargets}
            onToggleTargets={viewState.toggleTargets}
            dailyAllowed={dailyAllowed}
            dateBasis={dateBasis}
            onDateBasisChange={setDateBasis}
          />

          <LeadChartCanvas
            rawSeries={rawSeries}
            categories={categories}
            hasLoadedOnce={hasLoadedOnce}
            chartType={viewState.chartType}
            metric={viewState.metric}
            showTargets={viewState.showTargets}
            selectedUsers={filters.selectedUsers}
            userTeamMap={userTeamMap}
          />
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}