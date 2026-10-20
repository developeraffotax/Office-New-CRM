import React from "react";
import { Box, Stack } from "@mui/material"; 
import LeadChartFilters from "./ChartFilters";
import { statsBoxSx, toolbarSx } from "../styles";
import JobsStats from "./JobsStats";

export default function ChartToolbar({
  admin,
  showStats,
  onToggleStats,
  filters,
  users,
  teams,
  onReset,
  savedViews,
  dateBasis
}) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", lg: "flex-start" }}
      spacing={1.5}
      sx={toolbarSx}
    >
      <Box sx={statsBoxSx}>
        {showStats && (
          <JobsStats
            users={filters.selectedUsers}
            dateRange={filters.dateRange}
            isAdmin={admin}
            dateBasis={dateBasis}
          />
        )}
      </Box>

      <LeadChartFilters
        showStats={showStats}
        onToggleStats={onToggleStats}
        dateFilter={filters.dateFilter}
        onDateFilterChange={filters.changeDateFilter}
        dateRange={filters.dateRange}
        onDateRangeChange={filters.setDateRange}
        onQuickRangeSelect={filters.selectQuickRange}
        users={users}
        teams={teams}
        selectedUsers={filters.selectedUsers}
        onUsersChange={filters.setSelectedUsers}
        onReset={onReset}

        savedViews={savedViews}
      />
    </Stack>
  );
}