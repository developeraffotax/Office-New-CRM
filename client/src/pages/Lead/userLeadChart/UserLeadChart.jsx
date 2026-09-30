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

const selectAuth = (state) => state.auth.auth;

export default function UserLeadChart() {
  const auth = useSelector(selectAuth);
  const admin = isAdmin(auth);

  const filters = useLeadChartFilters(auth);
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
  });

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