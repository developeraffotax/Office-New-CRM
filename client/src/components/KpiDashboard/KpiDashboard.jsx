import { useEffect, useState } from "react";
import axios from "axios";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import ChartPanel from "./charts/ChartPanel";
import PerformanceStats from "./PerformanceStats";
import ManualRangePicker from "./ManualRangePicker";
import QuickFilterMenu from "./QuickFilterMenu";

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

const SOURCES = ["FIV", "UPW", "PPH", "Website", "Direct", "Partner"];

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

  // Date Filters
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [activeLabel, setActiveLabel] = useState("This Year");

  // Dropdown Filters
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);

  // UI State
  const [chartType, setChartType] = useState("bar");
  const [activeGroup, setActiveGroup] = useState(TAB_GROUPS[0].key);
  const [activeTab, setActiveTab] = useState(TAB_GROUPS[0].tabs[0].chartKey);
  const [visitedTabs, setVisitedTabs] = useState(new Set([TAB_GROUPS[0].tabs[0].chartKey]));
  const [showStats, setShowStats] = useState(true);

  // Fetch Users
  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users?module=whatsapp`
        );
        setUsers(data?.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    getAllUsers();
  }, []);

  // Track Visited Tabs
  useEffect(() => {
    setVisitedTabs((prev) => new Set(prev).add(activeTab));
  }, [activeTab]);

  const isFilterActive =
    dateRange !== defaultDateRange ||
    activeLabel !== "This Year" ||
    selectedSource !== "" ||
    selectedUser !== "";

  const handleQuickFilterSelect = (label, range) => {
    setActiveLabel(label);
    setDateRange(range);
  };

  const handleClearFilters = () => {
    setDateRange(defaultDateRange);
    setActiveLabel("This Year");
    setSelectedSource("");
    setSelectedUser("");
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
          {/* Left Controls: Date Pickers & Reset */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center" useFlexGap>
            <ManualRangePicker value={dateRange} onChange={setDateRange} />
            <QuickFilterMenu activeLabel={activeLabel} onSelect={handleQuickFilterSelect} />

            {isFilterActive && (
              <Button color="error" startIcon={<CancelIcon />} onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Stack>

          {/* Right Controls: Source & User Filters + Stats Toggle + Chart View Toggle */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center" useFlexGap>
            {/* Source Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}  >
              <InputLabel id="source-select-label">Source</InputLabel>
              <Select
                labelId="source-select-label"
                value={selectedSource}
                
                
                 
                label="Source"
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {SOURCES.map((src) => (
                  <MenuItem key={src} value={src}>
                    {src}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* User Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="user-select-label">User</InputLabel>
              <Select
                labelId="user-select-label"
                value={selectedUser}
                label="User"
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user._id} value={user.name}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Stats visibility toggle */}
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={showStats ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              onClick={() => setShowStats((prev) => !prev)}
            >
              {showStats ? "Hide Stats" : "Show Stats"}
            </Button>

            {/* Global chart type toggle */}
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
        </Stack>

        {/* Stat cards */}
        {showStats && (
          <Box sx={{ width: "100%" }}>
            <PerformanceStats
              dateRange={dateRange}
              source={selectedSource}
              user={selectedUser}
            />
          </Box>
        )}

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
                      source={selectedSource}
                      user={selectedUser}
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