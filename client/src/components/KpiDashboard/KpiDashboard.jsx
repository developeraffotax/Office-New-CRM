import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import CancelIcon from "@mui/icons-material/Cancel";
import BarChartIcon from "@mui/icons-material/BarChart";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupsIcon from "@mui/icons-material/Groups";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";


import ChartPanel from "./charts/ChartPanel";
import PerformanceStats from "./PerformanceStats";
import ManualRangePicker from "./ManualRangePicker";
import QuickFilterMenu from "./QuickFilterMenu";


// ---- Chart groups, mirroring your router's chartKeys 1:1 ----
// group.key + tab.key together are only used for UI state; the actual
// API call uses tab.chartKey against /api/v1/chart/{single|multi}/:chartKey
const TAB_GROUPS = [
  {
    key: "sales",
    label: "Sales",
    icon: <AttachMoneyIcon />,
    tabs: [
      { chartKey: "sales.total", label: "Total Sales", isMulti: true, valueType: "currency" },
      { chartKey: "sales.new", label: "New Sales", isMulti: false, valueType: "currency" },
      { chartKey: "sales.subscription", label: "Subscription Sales", isMulti: false, valueType: "currency" },
    ],
  },
  {
    key: "leads",
    label: "Leads",
    icon: <GroupsIcon />,
    tabs: [
      { chartKey: "leads.total", label: "Total Leads", isMulti: false, valueType: "count" },
      { chartKey: "leads.won", label: "Won Leads", isMulti: false, valueType: "count" },
      // If your multi endpoint for this returns raw totalLeads/wonLeads
      // arrays rather than a computed rate, switch valueType to "count".
      { chartKey: "leads.conversion", label: "Leads Conversion", isMulti: true, valueType: "percent" },
    ],
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    icon: <SubscriptionsIcon />,
    tabs: [
      { chartKey: "subscriptions.count", label: "Subscription Count", isMulti: false, valueType: "count" },
      { chartKey: "subscriptions.value", label: "Subscription Value", isMulti: false, valueType: "currency" },
    ],
  },
];

// Keeps a tab's chart mounted (hidden via CSS) once it's been visited,
// instead of unmounting on every switch, so charts don't re-fetch on
// every tab click.
function TabPanel({ children, active }) {
  return (
    <Box sx={{ display: active ? "block" : "none" }}>
      <Box sx={{ p: 0.5, minHeight: 400, display: "flex", flexDirection: "column" }}>
        {children}
      </Box>
    </Box>
  );
}

export default function KpiDashboard() {
const defaultDateRange = [
  dayjs().startOf("year"),
  dayjs().endOf("year"),
];

const [dateRange, setDateRange] = useState(defaultDateRange);
const [activeLabel, setActiveLabel] = useState("This Year");

  const [chartType, setChartType] = useState("bar");
 

  const [activeGroup, setActiveGroup] = useState(TAB_GROUPS[0].key);
  const [activeTab, setActiveTab] = useState(TAB_GROUPS[0].tabs[0].chartKey);
  const [visitedTabs, setVisitedTabs] = useState(new Set([TAB_GROUPS[0].tabs[0].chartKey]));

  useEffect(() => {
    setVisitedTabs((prev) => new Set(prev).add(activeTab));
  }, [activeTab]);

  const isFilterActive = dateRange !== defaultDateRange || activeLabel !== "This Year";

  const handleQuickFilterSelect = (label, range) => {
    setActiveLabel(label);
    setDateRange(range);
  };

  const handleClearFilters = () => {
    setDateRange(defaultDateRange);
    setActiveLabel("This Year");
  };

  const handleGroupChange = (e, newGroupKey) => {
    setActiveGroup(newGroupKey);
    const firstTab = TAB_GROUPS.find((g) => g.key === newGroupKey).tabs[0];
    setActiveTab(firstTab.chartKey);
  };

  const currentGroup = TAB_GROUPS.find((g) => g.key === activeGroup);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2} sx={{ width: "100%", p: 4 }}>
        {/* Top filter control deck */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{ pb: 0.5 }}
        >
          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center" useFlexGap>
            <ManualRangePicker value={dateRange} onChange={setDateRange} />
            <QuickFilterMenu activeLabel={activeLabel} onSelect={handleQuickFilterSelect} />

            {isFilterActive && (
              <Button color="error" startIcon={<CancelIcon />} onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Stack>

          {/* Global chart type toggle — applies to whichever tab is active */}
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(e, newValue) => newValue && setChartType(newValue)}
            size="small"
          >
            <ToggleButton value="bar">
              <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
              Bar View
            </ToggleButton>
            <ToggleButton value="area">
              <StackedLineChartIcon fontSize="small" sx={{ mr: 1 }} />
              Area View
            </ToggleButton>
            <ToggleButton value="line">
              <ShowChartIcon fontSize="small" sx={{ mr: 1 }} />
              Line View
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Stat cards */}
        <Box sx={{ width: "100%" }}>
          <PerformanceStats dateRange={dateRange} />
        </Box>

        <Card variant="outlined" sx={{ background: "#F9FAFB" }}>
          {/* Level 1: Sales / Leads / Subscriptions */}
          <Tabs
            value={activeGroup}
            onChange={handleGroupChange}
            variant="standard"
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{ borderBottom: 1, borderColor: "divider", px: 1 }}
          >
            {TAB_GROUPS.map((group) => (
              <Tab key={group.key} value={group.key} icon={group.icon} iconPosition="start" label={group.label} />
            ))}
          </Tabs>

          {/* Level 2: the specific metric within the selected group */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{
              minHeight: 40,
              px: 1,
              "& .MuiTab-root": {
                minHeight: 40,
                borderRadius: 1.5,
                mx: 0.5,
                my: 0.75,
              },
              "& .Mui-selected": {
                backgroundColor: "rgba(227, 227, 227, 0.7)",
              },
            }}
          >
            {currentGroup.tabs.map((tab) => (
              <Tab key={tab.chartKey} value={tab.chartKey} label={tab.label} />
            ))}
          </Tabs>

          <CardContent>
            {TAB_GROUPS.flatMap((group) => group.tabs).map(
              (tab) =>
                visitedTabs.has(tab.chartKey) && (
                  <TabPanel key={tab.chartKey} active={activeTab === tab.chartKey}>
                    <ChartPanel
                      chartKey={tab.chartKey}
                      isMulti={tab.isMulti}
                      valueType={tab.valueType}
                      dateRange={dateRange}
                      type={chartType}
                    />
                  </TabPanel>
                )
            )}
          </CardContent>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
}





