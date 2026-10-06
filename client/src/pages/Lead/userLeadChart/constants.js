export const TARGET_SUFFIX = " (Target)";


export const CHART_HEIGHT = 500;

export const VIEW = { DAILY: "daily", MONTHLY: "monthly" };
export const DATE_FILTER = { THIS_YEAR: "thisYear", CUSTOM: "custom" };

export const DEFAULTS = {
  chartType: "bar",
  metric: "value", // "count" | "value"
  view: VIEW.MONTHLY,
  dateFilter: DATE_FILTER.THIS_YEAR,
  showStats: true,
  showTargets: true,
  dateBasis: "won"
};


// A distinct color per selected user. Cycles if more users are picked than
// colors defined here — add more hex values if you expect >12 at once.
export const PALETTE = [
  "#008FFB",
  "#14B8A6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#22C55E",
  "#3B82F6",
  "#F97316",
  "#06B6D4",
  "#A855F7",
  "#84CC16",
];
export const getUserColor = (index) => PALETTE[index % PALETTE.length];

export const QUICK_RANGE_FILTERS = [
  { code: "M", label: "This Month", filter: "thisMonth" },
  { code: "Q", label: "This Quarter", filter: "thisQuarter" },
  { code: "Y", label: "This Year", filter: "thisYear" },
  { code: "LM", label: "Last Month", filter: "lastMonth" },
  { code: "LQ", label: "Last Quarter", filter: "lastQuarter" },
  { code: "LY", label: "Last Year", filter: "lastYear" },
];

export const DATE_FILTER_OPTIONS = [
  { value: "thisYear", label: "This Year" },
  { value: "lastYear", label: "Last Year" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisQuarter", label: "This Quarter" },
  { value: "lastQuarter", label: "Last Quarter" },
  { value: "custom", label: "Custom Range" },
];

// Shared look for every ToggleButtonGroup in the toolbar (period / metric /
// chart type) so they read as one consistent control style.
export const toggleGroupSx = {
  bgcolor: "#fff",
  border: "1px solid rgba(15,23,42,0.12)",
  borderRadius: 2,
  p: 0.25,
  "& .MuiToggleButton-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: 13,
    lineHeight: 1,
    px: 1.75,
    py: 0.85,
    border: "none",
    borderRadius: "6px !important",
    color: "#64748b",
  },
  "& .MuiToggleButton-root.Mui-selected": {
    bgcolor: "#EEF2FF",
    color: "#4338CA",
  },
  "& .MuiToggleButton-root.Mui-selected:hover": {
    bgcolor: "#E0E7FF",
  },
  "& .MuiToggleButton-root.Mui-disabled": {
    color: "#cbd5e1",
    bgcolor: "transparent",
    opacity: 1, // keep full opacity so it still looks like part of the group
    cursor: "not-allowed",
  },
};