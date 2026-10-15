import { useMemo } from "react";
import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CancelIcon from "@mui/icons-material/Cancel";

import ManualRangePicker from "./ui/ManualRangePicker";
import QuickFilterMenu from "./ui/QuickFilterMenu";
import QuickRangeButtons from "./ui/QuickRangeButtons";
import UserFilterSelect from "./ui/UserFilterSelect";
import KpiSavedViews from "./ui/KpiSavedViews";
import KpiTable from "./tables/KpiTable";
import useKpiFilters from "./hooks/useKpiFilters";
import { useSavedFilters } from "../SavedFilters/useSavedFilters";
import { LEADS_SOURCES } from "../../constants/constants";
import KpiChartButton from "./ui/KpiChartButton";

export default function KpiTablePage() {
  const f = useKpiFilters();

  // its own saved-view bucket, separate from the chart dashboard's
  const savedFiltersHook = useSavedFilters("kpi_table");

  const snapshot = useMemo(
    () => ({
      dateRange: {
        label: f.activeLabel,
        start: f.dateRange[0]?.toISOString(),
        end: f.dateRange[1]?.toISOString(),
      },
      source: f.selectedSource,
      users: f.selectedUsers,
    }),
    [f.activeLabel, f.dateRange, f.selectedSource, f.selectedUsers],
  );

  const handleApplyView = (v) => {
    if (v.dateRange?.start && v.dateRange?.end) {
      f.setDateRange([dayjs(v.dateRange.start), dayjs(v.dateRange.end)]);
      f.setActiveLabel(v.dateRange.label || "Custom");
    }
    f.setSelectedSource(v.source || "");
    f.setSelectedUsers(v.users || []);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2} sx={{ width: "100%", p: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{ pb: 0.5 }}
        >
          {/* Left: dates, reset, saved views */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center" useFlexGap>
            <KpiChartButton />
            <ManualRangePicker value={f.dateRange} onChange={f.setDateRange} />
            <QuickFilterMenu activeLabel={f.activeLabel} onSelect={f.handleQuickFilterSelect} />
            <QuickRangeButtons activeLabel={f.activeLabel} onSelect={f.handleQuickFilterSelect} />

            {f.isFilterActive && (
              <Button color="error" startIcon={<CancelIcon />} onClick={f.handleClearFilters}>
                Clear Filters
              </Button>
            )}

            <KpiSavedViews
              snapshot={snapshot}
              onApply={handleApplyView}
              savedFiltersHook={savedFiltersHook}
              tabGroups={[]}
            />
          </Stack>

          {/* Right: users + source */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <UserFilterSelect
                users={f.users}
                teams={f.teams}
                selected={f.selectedUsers}
                onChange={f.setSelectedUsers}
              />
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="kpi-table-source-label">Source</InputLabel>
              <Select
                labelId="kpi-table-source-label"
                value={f.selectedSource}
                label="Source"
                onChange={(e) => f.setSelectedSource(e.target.value)}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {LEADS_SOURCES.map((src) => (
                  <MenuItem key={src} value={src}>
                    {src}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Card variant="outlined" sx={{ background: "#F9FAFB" }}>
          <CardContent>
            <KpiTable
              dateRange={f.dateRange}
              source={f.selectedSource}
              users={f.selectedUsers}
            />
          </CardContent>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
}