import {
  Box,
  Chip,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { toggleGroupSx } from "../constants";
import {
  JOB_METRIC_OPTIONS,
  JOB_METRIC_LABELS,
  JOB_DATE_BASIS_OPTIONS,
  JOB_DATE_BASIS_LABELS,
} from "../constants";

const VIEW_LABELS = { monthly: "Monthly", weekly: "Weekly", daily: "Daily" };

export default function ChartHeader({
  headerLabel,
  view,
  onViewChange,
  metric,
  onMetricChange,
  chartType,
  onChartTypeChange,
  showTargets,
  onToggleTargets,
  dateBasis = "workDeadline",
  onDateBasisChange,
  dailyAllowed = true,
}) {
  const dateHint =
    JOB_DATE_BASIS_OPTIONS.find((o) => o.value === dateBasis)?.hint || "";

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1}
      sx={{ mb: 2 }}
    >
      <Box>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
          <Chip
            label="Stats"
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: "#94a3b8", fontWeight: 600, fontSize: 11 }}
          >
            {VIEW_LABELS[view]} · {JOB_METRIC_LABELS[metric]} · by{" "}
            {JOB_DATE_BASIS_LABELS[dateBasis]}
          </Typography>
        </Stack>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#1e293b", lineHeight: 1.25 }}
        >
          {JOB_METRIC_LABELS[metric]}{" "}
          <Box component="span" sx={{ color: "#64748b", fontWeight: 500 }}>
            – {headerLabel}
          </Box>
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <ToggleButtonGroup size="small" sx={toggleGroupSx}>
          <ToggleButton value="targets" selected={showTargets} onChange={onToggleTargets}>
            Targets
          </ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={metric}
          onChange={(e, val) => val && onMetricChange(val)}
          sx={toggleGroupSx}
        >
          {JOB_METRIC_OPTIONS.map(({ value, label }) => (
            <ToggleButton key={value} value={value}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(e, val) => val && onViewChange(val)}
          sx={toggleGroupSx}
        >
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="weekly">Weekly</ToggleButton>
          <Tooltip
            title={!dailyAllowed ? "Daily view is not allowed for this range" : ""}
            arrow
          >
            <span>
              <ToggleButton value="daily" disabled={!dailyAllowed}>
                Daily
              </ToggleButton>
            </span>
          </Tooltip>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={chartType}
          onChange={(e, val) => val && onChartTypeChange(val)}
          sx={toggleGroupSx}
        >
          <ToggleButton value="bar">Bar</ToggleButton>
          <ToggleButton value="line">Line</ToggleButton>
          <ToggleButton value="area">Area</ToggleButton>
        </ToggleButtonGroup>

        {/* Date basis */}
        <Tooltip arrow title={dateHint}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography
              variant="caption"
              sx={{ color: "#94a3b8", fontWeight: 600, fontSize: 11 }}
            >
              Date:
            </Typography>
            <Select
              size="small"
              value={dateBasis}
              onChange={(e) => onDateBasisChange(e.target.value)}
              sx={{ height: 32, fontSize: 12, bgcolor: "#fff", borderRadius: 1.5 }}
            >
              {JOB_DATE_BASIS_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value} sx={{ fontSize: 12 }}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Tooltip>
      </Stack>
    </Stack>
  );
}