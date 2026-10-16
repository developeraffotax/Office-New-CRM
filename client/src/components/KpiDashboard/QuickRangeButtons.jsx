import { ButtonGroup, Button, Tooltip } from "@mui/material";
import { getQuickDateRanges } from "./utils/quickDateRanges";

const QUICK_RANGES = [
  { code: "M", label: "This Month" },
  { code: "Q", label: "This Quarter" },
  { code: "Y", label: "This Year" },
  { code: "LM", label: "Last Month" },
  { code: "LQ", label: "Last Quarter" },
  { code: "LY", label: "Last Year" },
];

// shown first in each half ("this" ones, then the "last" ones) when showWeekly is on
const THIS_WEEK = { code: "W", label: "This Week" };
const LAST_WEEK = { code: "LW", label: "Last Week" };

// showWeekly: opt-in, so pages that don't pass it (e.g. the chart dashboard) look exactly as before
export default function QuickRangeButtons({ activeLabel, onSelect, showWeekly = false }) {
  const ranges = getQuickDateRanges();

  const buttons = showWeekly
    ? [THIS_WEEK, ...QUICK_RANGES.slice(0, 3), LAST_WEEK, ...QUICK_RANGES.slice(3)]
    : QUICK_RANGES;

  return (
    <ButtonGroup variant="outlined" size="small">
      {buttons.map(({ code, label }) => {
        const isActive = activeLabel === label;
        return (
          <Tooltip key={code} title={label} arrow>
            <Button
              onClick={() => onSelect(label, ranges[label])}
              sx={{
                minWidth: 36,
                width: 36,
                height: 36,
                p: 0,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.2,
                ...(isActive && {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  borderColor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                    borderColor: "primary.dark",
                  },
                }),
              }}
            >
              {code}
            </Button>
          </Tooltip>
        );
      })}
    </ButtonGroup>
  );
}