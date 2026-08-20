import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LuLayoutDashboard,
  GrDocumentPerformance,
  FaTasks,
  BsBriefcase,
  BiLayer,
  GoRepoTemplate,
  BsFileEarmarkText,
  LuClipboardSignature,
  GoGoal,
  SlCalender,
  FaRegCreditCard,
  FaUserTie,
  TbDeviceDesktopAnalytics,
  MdCalendarMonth,
  LiaNetworkWiredSolid,
  BiMessageError,
  MdSecurity,
  FaUsers,
  LuClock2,
  VscSettings,
  IoMailUnreadOutline,
  FaWhatsapp,
} from "./sidebarIcons";
import { setActive } from "../../../redux/slices/authSlice";
import { hasPermission } from "../../../utlis/checkPermission";
import ProfileModal from "../../Modals/ProfileModal";
import SidebarDesktop from "./SidebarDesktop";
import SidebarMobile from "./SidebarMobile";

export default function Sidebar({
  hide = false,
  setHide,
  mobileOpen = false,
  onMobileClose,
}) {
  const router = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth.auth);
  const active = useSelector((state) => state.auth.active);
  const { settings } = useSelector((state) => state.settings);
  const notifications = useSelector(
    (state) => state.notifications.notificationData || [],
  );

  const [isProfile, setIsProfile] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const user = auth?.user;

  const {
    showCrmNotifications = true,
    showEmailNotifications = true,
  } = settings || {};

  const isNotificationAllowed = (type) =>
    type === "ticket_received" ? showEmailNotifications : showCrmNotifications;

  const getUnreadCount = (type) =>
    notifications.filter(
      (notification) =>
        notification.type === type &&
        notification.status === "unread" &&
        isNotificationAllowed(notification.type),
    ).length;

  const taskCount = getUnreadCount("task_assigned");
  const jobCount = getUnreadCount("job_assigned");
  const ticketAssignedCount = getUnreadCount("ticket_assigned");
  const ticketReceivedCount = getUnreadCount("ticket_received");
  const threadAssignedCount = getUnreadCount("thread_assigned");

  useEffect(() => {
    const firstPathSegment = location.pathname.split("/")[1];

    if (firstPathSegment) {
      dispatch(setActive(firstPathSegment));
    }
  }, [location.pathname, dispatch]);

  const hasAccess = (permission) =>
    user?.role?.access?.some((item) => item.permission === permission);

  const navigate = (item) => {
    router(item.path);
    dispatch(setActive(item.activeKey));
    onMobileClose?.();
  };

  const common = (permission, id, label, path, icon, extra = {}) => ({
    id,
    permission,
    label,
    path,
    activeKey: id,
    icon,
    ...extra,
  });

  const items = useMemo(() => {
    const main = [
      hasAccess("Dashboard") &&
        common("Dashboard", "dashboard", "Dashboard", "/dashboard", LuLayoutDashboard),
      hasAccess("Kpi-Dashboard") &&
        common(
          "Kpi-Dashboard",
          "kpi-dashboard",
          "Kpi Dashboard",
          "/kpi-dashboard",
          GrDocumentPerformance,
        ),
      hasAccess("Tasks") &&
        common("Tasks", "tasks", "Tasks", "/tasks", FaTasks, {
          badges: taskCount
            ? [
                {
                  key: "tasks",
                  title: "New Assigned Tasks",
                  count: taskCount,
                  className: "bg-orange-500 border-black/20 text-white",
                  // activeClass: "bg-white text-orange-600",
                },
              ]
            : [],
        }),
      hasAccess("Jobs") &&
        common("Jobs", "job-planning", "Jobs", "/job-planning", BsBriefcase, {
          badges: jobCount
            ? [
                {
                  key: "jobs",
                  title: "New Assigned Jobs",
                  count: jobCount,
                  className: "bg-orange-500 border-black/20 text-white",
                  // activeClass: "bg-white text-orange-600",
                },
              ]
            : [],
        }),
      hasAccess("Leads") &&
        common("Leads", "leads", "Leads", "/leads", BiLayer),
      hasAccess("Templates") &&
        common("Templates", "templates", "Templates", "/templates", GoRepoTemplate),
      hasAccess("Tickets") &&
        common("Tickets", "tickets", "Tickets", "/tickets", BsFileEarmarkText, {
          badges: [
            ticketReceivedCount && {
              key: "received",
              title: "New Received Tickets",
              count: ticketReceivedCount,
              className: "bg-blue-500 text-white",
              activeClass: "bg-white text-blue-500",
            },
            ticketAssignedCount && {
              key: "assigned",
              title: "New Assigned Tickets",
              count: ticketAssignedCount,
              className: "bg-orange-500 border-black/20 text-white",
              // activeClass: "bg-white text-orange-600",
            },
          ].filter(Boolean),
        }),
      (user?.role?.name === "Admin" || hasPermission(user, "Inbox")) &&
        common(
          "Inbox",
          "mail",
          "Inbox",
          user?.role?.name === "Admin"
            ? "/mail?folder=inbox&companyName=affotax&userId=unassigned&status=progress"
            : `/mail?folder=inbox&companyName=affotax&userId=${user?.id}&status=progress`,
          IoMailUnreadOutline,
          {
            badges: threadAssignedCount
              ? [
                  {
                    key: "threads",
                    title: "New Assigned Threads",
                    count: threadAssignedCount,
                    className: "bg-orange-500 border-black/20 text-white",
                    // activeClass: "bg-white text-orange-600",
                  },
                ]
              : [],
          },
        ),
      (user?.role?.name === "Admin" || hasPermission(user, "Whatsapp")) &&
        common(
          "Whatsapp",
          "whatsapp",
          "WhatsApp",
          "/whatsapp?companyName=affotax",
          FaWhatsapp,
        ),
      hasAccess("Proposals") &&
        common("Proposals", "proposals", "Proposals", "/proposals", LuClipboardSignature),
      hasAccess("Goals") &&
        common("Goals", "goals", "Goals", "/goals", GoGoal),
      hasAccess("Timesheet") &&
        common("Timesheet", "timesheet", "TimeSheet", "/timesheet", SlCalender),
      hasAccess("Subscription") &&
        common(
          "Subscription",
          "subscriptions",
          "Subscription",
          "/subscriptions",
          FaRegCreditCard,
        ),
      hasAccess("HR") && common("HR", "hr", "HR", "/hr/tasks", FaUserTie),
      hasAccess("Affotax-Analytics") &&
        common(
          "Affotax-Analytics",
          "affotax-analytics",
          "Affotax",
          "/affotax-analytics",
          TbDeviceDesktopAnalytics,
        ),
    ].filter(Boolean);

    const settings = [
      hasAccess("Meeting") &&
        common("Meeting", "meetings", "Meeting", "/meetings", MdCalendarMonth),
      hasAccess("Workflow") &&
        common("Workflow", "workflow", "Workflow", "/workflow", LiaNetworkWiredSolid),
      hasAccess("Complaints") &&
        common("Complaints", "complaints", "Complaints", "/complaints", BiMessageError),
      hasAccess("Roles") && common("Roles", "roles", "Roles", "/roles", MdSecurity),
      hasAccess("Users") && common("Users", "users", "Users", "/users", FaUsers),
      (user?.role?.name === "Admin" || hasAccess("Activity")) &&
        common("Activity", "activity", "Activity", "/activity", LuClock2),
      user?.role?.name === "Admin" &&
        common("Settings", "settings", "Personalized", "/settings", VscSettings),
    ].filter(Boolean);

    return {
      main,
      settings,
      showSettings: settings.length > 0,
      showSettingsDivider:
        hasAccess("Workflow") ||
        hasAccess("Roles") ||
        hasAccess("Activity") ||
        hasAccess("Users"),
    };
  }, [
    user,
    taskCount,
    jobCount,
    ticketAssignedCount,
    ticketReceivedCount,
    threadAssignedCount,
    showCrmNotifications,
    showEmailNotifications,
  ]);

  return (
    <>
      <div className="hidden md:block h-full w-full font-google">
        <SidebarDesktop
          items={items}
          active={active}
          onNavigate={navigate}
          hide={hide}
          setHide={setHide}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
        />
      </div>

      {mobileOpen && (
        <SidebarMobile
          items={items}
          active={active}
          onNavigate={navigate}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          onClose={onMobileClose || (() => {})}
        />
      )}

      {isProfile && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-black/70 flex items-center justify-center py-6 px-4">
          <ProfileModal
            setIsProfile={setIsProfile}
            setIsActive={setIsActive}
          />
        </div>
      )}
    </>
  );
}
