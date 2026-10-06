import {
  Box,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { toggleGroupSx } from "../constants";

const VIEW_LABELS = { monthly: "Monthly", weekly: "Weekly", daily: "Daily" };
const DATE_BASIS_LABELS = { created: "Created Date", won: "Won Date" };

export default function LeadChartHeader({
  headerLabel,
  view,
  onViewChange,
  metric,
  onMetricChange,
  chartType,
  onChartTypeChange,
  showTargets,
  onToggleTargets,
  dateBasis = "created",
  onDateBasisChange,
  dailyAllowed = true,
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1}
      sx={{ mb: 2 }}
    >
      <Box>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{ mb: 0.25 }}
        >
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
            {VIEW_LABELS[view]} · {metric === "value" ? "Value" : "Count"} · by{" "}
            {DATE_BASIS_LABELS[dateBasis]}
          </Typography>
        </Stack>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#1e293b", lineHeight: 1.25 }}
        >
          Won Leads{" "}
          <Box component="span" sx={{ color: "#64748b", fontWeight: 500 }}>
            – {headerLabel}
          </Box>
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        <ToggleButtonGroup size="small" sx={toggleGroupSx}>
          <ToggleButton
            value="targets"
            selected={showTargets}
            onChange={onToggleTargets}
          >
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
          <ToggleButton value="value">Value</ToggleButton>
          <ToggleButton value="count">Count</ToggleButton>
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
            title={
              !dailyAllowed ? "Daily view is not allowed for this range" : ""
            }
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
        <Tooltip
          arrow
          title={
            dateBasis === "created"
              ? "Won leads are grouped by the date the lead was created"
              : "Won leads are grouped by the date the lead was marked as won"
          }
        >
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography
              variant="caption"
              sx={{ color: "#94a3b8", fontWeight: 600, fontSize: 11 }}
            >
              Date:
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={dateBasis}
              onChange={(e, val) => val && onDateBasisChange(val)}
              sx={toggleGroupSx}
            >
              <ToggleButton value="created">Created Date</ToggleButton>
              <ToggleButton value="won">Won Date</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Tooltip>


        
      </Stack>
    </Stack>
  );
}