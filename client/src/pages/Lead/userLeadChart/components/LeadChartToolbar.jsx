import React from "react";
import { Box, Stack } from "@mui/material";
import WonLeadStats from "./WonLeadStats";
import LeadChartFilters from "./LeadChartFilters";
import { statsBoxSx, toolbarSx } from "../styles";

export default function LeadChartToolbar({
  admin,
  showStats,
  onToggleStats,
  filters,
  users,
  teams,
  onReset,
  savedViews,
  dateBasis,
  compare = "none",
  onCompareChange,
  compareOptions,
}) {
  return (
    <Stack
      direction="column"
      spacing={2}
      sx={toolbarSx}
    >
      {/* Filters on top */}
      <LeadChartFilters
        showStats={showStats}
        onToggleStats={onToggleStats}
        dateFilter={filters.dateFilter}
        onDateFilterChange={filters.changeDateFilter}
        dateRange={filters.dateRange}
        onDateRangeChange={filters.setDateRange}
        onQuickRangeSelect={filters.selectQuickRange}
        compare={compare}
        onCompareChange={onCompareChange}
        compareOptions={compareOptions}
        users={users}
        teams={teams}
        selectedUsers={filters.selectedUsers}
        onUsersChange={filters.setSelectedUsers}
        onReset={onReset}
        savedViews={savedViews}
      />

      {/* Stats below filters */}
      {showStats && (
        <Box sx={statsBoxSx}>
          <WonLeadStats
            users={filters.selectedUsers}
            dateRange={filters.effectiveRange}
            isAdmin={admin}
            dateBasis={dateBasis}
          />
        </Box>
      )}
    </Stack>
  );
}