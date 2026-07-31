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

import CancelIcon from "@mui/icons-material/Cancel";
import BarChartIcon from "@mui/icons-material/BarChart";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PublicIcon from "@mui/icons-material/Public";
import DescriptionIcon from "@mui/icons-material/Description";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import CountChart from "./charts/CountChart";
import SalesChart from "./charts/SalesChart";
import PerformanceStats from "./PerformanceStats";
import PageViewsChart from "./charts/PageViewsChart";
import QuoteSubmissionsChart from "./charts/QuoteSubmissionsChart";
import WaSubmissionsChart from "./charts/WaSubmissionsChart";
import ManualRangePicker from "./ManualRangePicker";
import QuickFilterMenu from "./QuickFilterMenu";

// ---- Workspace tab definitions (was tabItems in the antd version) ----
const TAB_DEFS = [
  { key: "sales", label: "Gross Sales", icon: <AttachMoneyIcon />, Component: SalesChart },
  { key: "orders", label: "Orders Volume", icon: <ShoppingCartIcon />, Component: CountChart },
  { key: "traffic", label: "Web Traffic", icon: <PublicIcon />, Component: PageViewsChart },
  { key: "quotes", label: "Quote Requests", icon: <DescriptionIcon />, Component: QuoteSubmissionsChart },
  {
    key: "wa_submissions",
    label: "WhatsApp Submissions",
    icon: <WhatsAppIcon />,
    Component: WaSubmissionsChart,
  },
];

// Keeps a tab's chart mounted (hidden via CSS) once it's been visited,
// instead of unmounting on every switch — mirrors antd Tabs' default
// "render once, keep alive" behaviour so charts don't re-fetch on
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

export default function DashboardComponent() {
  const [activeLabel, setActiveLabel] = useState("Select Filter");
  const [chartType, setChartType] = useState("bar");
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState("sales");
  const [visitedTabs, setVisitedTabs] = useState(new Set(["sales"]));

  useEffect(() => {
    setVisitedTabs((prev) => new Set(prev).add(activeTab));
  }, [activeTab]);

  const isFilterActive = dateRange !== null || activeLabel !== "Select Filter";

  const handleQuickFilterSelect = (label, range) => {
    setActiveLabel(label);
    setDateRange(range);
  };

  const handleClearFilters = () => {
    setDateRange(null);
    setActiveLabel("Select Filter");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2} sx={{ width: "100%", p: 4, background: "",   }}>
        {/* Top Filter Workspace Control Deck */}
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

          {/* Global Chart Renderer Rule */}
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

        {/* Main Stats Header strip */}
        <Box sx={{ width: "100%" }}>
          <PerformanceStats dateRange={dateRange} activeLabel={activeLabel} />
        </Box>

        <Card variant="outlined"  sx={{background: "#F9FAFB"}}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="standard"
            scrollButtons="auto"
              TabIndicatorProps={{ style: { display: "none" } }}
            sx={{ borderBottom: 1, borderColor: "divider", px: 1 }}
          >
            {TAB_DEFS.map((tab) => (
              <Tab key={tab.key} value={tab.key} icon={tab.icon} iconPosition="start" label={tab.label} />
            ))}
          </Tabs>
          <CardContent>
            {TAB_DEFS.map(
              ({ key, Component }) =>
                visitedTabs.has(key) && (
                  <TabPanel key={key} active={activeTab === key}>
                    <Component dateRange={dateRange} type={chartType} />
                  </TabPanel>
                )
            )}
          </CardContent>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
}
