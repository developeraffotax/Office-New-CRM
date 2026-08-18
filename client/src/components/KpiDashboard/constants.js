import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupsIcon from "@mui/icons-material/Groups";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";

export const KPI_DASHBOARD_PERMISSION = "Kpi-Dashboard";


export const TAB_GROUPS = [
  {
    key: "sales",
    label: "Sales",
    icon: <AttachMoneyIcon />,
    tabs: [
      {
        chartKey: "sales.total",
        label: "Total Sales",
        isMulti: true,
        valueType: "currency",
      },
      {
        chartKey: "sales.new",
        label: "New Sales",
        isMulti: false,
        valueType: "currency",
      },
      {
        chartKey: "sales.subscription",
        label: "Subscription Sales",
        isMulti: false,
        valueType: "currency",
      },
    ],
  },
  {
    key: "leads",
    label: "Leads",
    icon: <GroupsIcon />,
    tabs: [
      {
        chartKey: "leads.total",
        label: "Total Leads",
        isMulti: false,
        valueType: "count",
      },
      {
        chartKey: "leads.won",
        label: "Won Leads",
        isMulti: false,
        valueType: "count",
      },
      {
        chartKey: "leads.conversion",
        label: "Leads Conversion",
        isMulti: true,
        valueType: "percent",
      },
    ],
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    icon: <SubscriptionsIcon />,
    tabs: [
      {
        chartKey: "subscriptions.count",
        label: "Subscription Count",
        isMulti: false,
        valueType: "count",
      },
      {
        chartKey: "subscriptions.value",
        label: "Subscription Value",
        isMulti: false,
        valueType: "currency",
      },
    ],
  },
];