import "./App.css";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";

import {
  loadAuthFromLocalStorage,
  checkTokenExpiry,
} from "./redux/slices/authSlice";

// Components
import Layout from "./components/Loyout/Layout";
import SocketListeners from "./components/SocketListeners";
import Spinner from "./utlis/Spinner";
import TimerDueListener from "./components/TimerDueListener";
import Temp from "./components/Temp";

// Pages
import Login from "./pages/Auth/Login";
import Profile from "./pages/Auth/Profile";
import Users from "./pages/Auth/Users";
import UDashboard from "./pages/Auth/Dashboard";
import Dashboard from "./pages/dashboard/Dashboard";
import AllJobs from "./pages/Jobs/AllJobs";
import AllTasks from "./pages/Tasks/AllTasks";
import TimeSheet from "./pages/TimerSheet/TimeSheet";
import Tickets from "./pages/Tickets/Tickets";
import CompleteTickets from "./pages/Tickets/CompleteTickets";
import EmailDetail from "./pages/Tickets/EmailDetail";
import Inbox from "./pages/Tickets/Inbox";
import Template from "./pages/Templates/Template";
import TemplateEditor from "./pages/Tickets/TemplateEditor";
import PDFEditor from "./pages/Editor/PDFEditor";
import Lead from "./pages/Lead/Lead";
import LeadsStats from "./pages/Lead/leadStats/LeadStats";
import Proposal from "./pages/Proposal/Proposal";
import Roles from "./pages/role/Roles";
import Subscription from "./pages/Subscription/Subscription";
import Goals from "./pages/Goal/Goals";
import AllLists from "./pages/lists/AllLists";
import Workflow from "./pages/Workflow/Workflow";
import Complaints from "./pages/Complaints/Complaints";
import Meeting from "./pages/Meeting/Meeting";
import HR from "./pages/HR/HR";
import NotFound from "./pages/NotFound/NotFound";

// Redux listeners
import { initTimerListener } from "./redux/slices/timerSlice";
import { initNotificationListener } from "./redux/slices/notificationSlice";
import { initReminderListener } from "./redux/slices/reminderSlice";
import ScreenshotDashboard from "./pages/AffoStaff/ScreenshotDashboard";
import AutoCreateLeadFromURL from "./pages/Lead/AutoCreateLeadFromURL";
import { getUserSettings, initSettingsListener } from "./redux/slices/settingsSlice";
import SettingsPage from "./pages/Settings/Settings";
import { initGlobalTimerListener } from "./redux/slices/globalTimerSlice";
import RegisterGlobalComponents from "./components/global/RegisterGlobalComponents";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const { auth, isLoading, isInitializing } = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settings);
  const { user, token } = auth || {};


  console.log("THE SETTINGS ARE >>>>>>>>>>>>> 1️⃣2️⃣3️⃣4️⃣5️⃣", settings)

  // Load auth from storage & check token expiry
  useEffect(() => {
    dispatch(loadAuthFromLocalStorage());
    dispatch(checkTokenExpiry());

    dispatch(getUserSettings());
  }, [dispatch]);

  // Clear caches on load (safe wrapped)
  useEffect(() => {
    if ("caches" in window) {
      caches.keys()
        .then((cacheNames) =>
          Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
        )
        .catch((err) => console.error("Cache clear failed:", err));
    }
  }, []);

  // Initialize socket listeners
  useEffect(() => {
    dispatch(initTimerListener());
    dispatch(initNotificationListener());
    dispatch(initSettingsListener());
    dispatch(initReminderListener());
    dispatch(initGlobalTimerListener());
  }, [dispatch]);

  // Define access-controlled routes
  const routeAccess = useMemo(
    () => ({
      Dashboard: <Route path="/dashboard" element={<Dashboard />} />,
      MyList: <Route path="/all/lists" element={<AllLists />} />,
      Users: <Route path="/users" element={<Users />} />,
      Roles: <Route path="/roles" element={<Roles />} />,
      Timesheet: <Route path="/timesheet" element={<TimeSheet />} />,
      Proposals: <Route path="/proposals" element={<Proposal />} />,
      Leads: <Route path="/leads" element={<Lead />} />,
      Tasks: <Route path="/tasks" element={<AllTasks />} />,
      Jobs: <Route path="/job-planning" element={<AllJobs />} />,
      Goals: <Route path="/goals" element={<Goals />} />,
      Workflow: <Route path="/workflow" element={<Workflow />} />,
      Complaints: <Route path="/complaints" element={<Complaints />} />,
      Meeting: <Route path="/meetings" element={<Meeting />} />,
      HR: <Route path="/hr/tasks" element={<HR />} />,
      Tickets: (
        <>
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/complete" element={<CompleteTickets />} />
          <Route path="/ticket/detail/:id" element={<EmailDetail />} />
          <Route path="/tickets/inbox" element={<Inbox />} />
        </>
      ),
      Templates: <Route path="/templates" element={<Template />} />,
      Subscription: <Route path="/subscriptions" element={<Subscription />} />,
    }),
    []
  );

  // Filter routes based on user permissions
  const userAccessRoutes = useMemo(
    () =>
      (user?.role?.access || [])
        .map((accessItem) => routeAccess[accessItem.permission])
        .filter(Boolean),
    [user, routeAccess]
  );

  // Show spinner while initializing
  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <main>
      <SocketListeners />
      <TimerDueListener />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/temp/:hrTaskId" element={<Temp />} />

        {token ? (
          // Private routes (only for logged-in users)
          <Route element={<Layout />}>
            {userAccessRoutes}
            <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="/leads/stats" element={<LeadsStats />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/employee/dashboard" element={<UDashboard />} />
            <Route path="/editor/templates" element={<TemplateEditor />} />
            <Route path="/pdf/editor" element={<PDFEditor />} />
            <Route path="/activity" element={<ScreenshotDashboard />} />
            <Route path="/leads/create" element={<AutoCreateLeadFromURL user={user}/>} />
            <Route path="/settings" element={<SettingsPage  />} />
          </Route>
        ) : (
          // If no token, redirect any private route access to login
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        {/* Catch-all fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster />

      <RegisterGlobalComponents />

      
    </main>
  );
}

export default App;
