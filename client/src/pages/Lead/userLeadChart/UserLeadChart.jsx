"use client";
import React, { useCallback, useMemo, useState } from "react";
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
import { DATE_FILTER } from "./constants";
import { getDateRange, getHeaderLabel, isDailyAllowed } from "./utils";
import { suggestView, extendRange, resolveCompare } from "./rangeHelpers";
import { cardSx, chartCardSx, dividerSx } from "./styles";
import { useSavedFilters } from "../../../components/SavedFilters/useSavedFilters";
import SavedViews from "./components/SavedViews";

const selectAuth = (state) => state.auth.auth;

export default function UserLeadChart() {
  const auth = useSelector(selectAuth);
  const admin = isAdmin(auth);

  const filters = useLeadChartFilters(auth);
  const { dateBasis, setDateBasis } = filters;

  // Legend selection (hidden user names) lives here so saved views can store/restore it
  const [hiddenSeries, setHiddenSeries] = useState(() => new Set());

  // dateRange = what the user picked; effectiveRange = picked range widened by "Compare with"
  const dailyAllowed = useMemo(
    () => isDailyAllowed(filters.effectiveRange),
    [filters.effectiveRange],
  );
  const viewState = useLeadChartView({ dailyAllowed });

  const { users, teams, userTeamMap } = useUsersAndTeams();
  const { categories, rawSeries, hasLoadedOnce, isLoading } = useWonLeadsData({
    auth,
    selectedUsers: filters.selectedUsers,
    dateRange: filters.effectiveRange,
    view: viewState.view,
    dateBasis,
  });

  /* ───────── Auto view: pick the best view for the range ───────── */
  // only apply the compare if it still fits the NEW range
const autoView = (range) => {
  const v = suggestView(range, resolveCompare(range, filters.compare));
  if (v) viewState.setView(v);
};
  // Wrapped handlers: same API as `filters`, but each range change also sets the view.
  // Done here (not in an effect) so saved views and Reset keep their own view.
  const toolbarFilters = {
    ...filters,
    changeDateFilter: (value) => {
      filters.changeDateFilter(value);
      if (value !== DATE_FILTER.CUSTOM) autoView(getDateRange(value));
    },
    selectQuickRange: (filter) => {
      filters.selectQuickRange(filter);
      autoView(getDateRange(filter));
    },
    setDateRange: (range) => {
      filters.setDateRange(range);
      autoView(range);
    },
setCompare: (value) => {
  filters.setCompare(value);
  const v = suggestView(
    filters.dateRange,
    resolveCompare(filters.dateRange, value),
  );
  if (v) viewState.setView(v);
},
    // picking different users manually starts with a clean legend
    setSelectedUsers: (next) => {
      filters.setSelectedUsers(next);
      setHiddenSeries(new Set());
    },
  };

  /* ───────── Saved views ───────── */
  const savedFiltersHook = useSavedFilters("targets_dashboard");

  // only names that exist in the current chart, sorted so comparisons are stable
  const hiddenUsers = useMemo(() => {
    const present = new Set(rawSeries.map((s) => s.user));
    return [...hiddenSeries].filter((n) => present.has(n)).sort();
  }, [hiddenSeries, rawSeries]);

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
      dateBasis,
      compare: filters.compare,
      hiddenUsers,
    }),
    [
      filters.dateFilter,
      filters.dateRange,
      filters.selectedUsers,
      filters.compare,
      viewState.view,
      viewState.metric,
      viewState.chartType,
      viewState.showTargets,
      viewState.showStats,
      dateBasis,
      hiddenUsers,
    ],
  );

  const { applyFilters } = filters;
  const handleApplyView = useCallback(
    (v) => {
      applyFilters(v); // dates, users, dateBasis, compare
      setHiddenSeries(new Set(v.hiddenUsers || [])); // legend selection (old views: none hidden)
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

  /* ───────── Reset ───────── */
  const { reset: resetFilters } = filters;
  const { resetView } = viewState;
  const handleReset = useCallback(() => {
    resetFilters();
    resetView();
    setHiddenSeries(new Set());
  }, [resetFilters, resetView]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={cardSx}>
        <LeadChartToolbar
          admin={admin}
          showStats={viewState.showStats}
          onToggleStats={viewState.toggleStats}
          filters={toolbarFilters}
          users={users}
          teams={teams}
          onReset={handleReset}
          savedViews={savedViews}
          dateBasis={dateBasis}
          compare={filters.compare}
          onCompareChange={toolbarFilters.setCompare}
          compareOptions={filters.compareOptions}
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
            compareLabel={filters.compareLabel}
          />

          <LeadChartCanvas
            rawSeries={rawSeries}
            categories={categories}
            hasLoadedOnce={hasLoadedOnce}
            chartType={viewState.chartType}
            metric={viewState.metric}
            showTargets={viewState.showTargets}
            userTeamMap={userTeamMap}
            hiddenSeries={hiddenSeries}
            onHiddenChange={setHiddenSeries}
              isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}