import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkIcon from '@mui/icons-material/Work';
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";

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
        chartKey: "subscriptions.value",
        label: "Subscription Value",
        isMulti: false,
        valueType: "currency",
      },
      {
        chartKey: "subscriptions.count",
        label: "Subscription Count",
        isMulti: false,
        valueType: "count",
      },
      
    ],
  },



   {
    key: "jobs",
    label: "Jobs",
    icon: <WorkIcon />,
    tabs: [
      {
        chartKey: "jobs.prepared",
        label: "Prepared",
        isMulti: false,
        valueType: "count",
      },
      {
        chartKey: "jobs.review",
        label: "Review",
        isMulti: false,
        valueType: "count",
      },
      {
        chartKey: "jobs.filed",
        label: "Filed",
        isMulti: false,
        valueType: "count",
      },
      
    ],
  },




  {
    key: "emails",
    label: "Emails",
    icon: <ForwardToInboxIcon />,
    tabs: [
      {
        chartKey: "emails.initial",
        label: "Initial Emails",
        isMulti: false,
        valueType: "count",
      },
      {
        chartKey: "emails.replies",
        label: "Replies",
        isMulti: false,
        valueType: "count",
      },
    ],
  },




];