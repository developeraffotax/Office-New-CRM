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
  savedViews
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
          <WonLeadStats
            users={filters.selectedUsers}
            dateRange={filters.dateRange}
            isAdmin={admin}
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