import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import Temp from "./components/Temp";
import { initTimerListener } from "./redux/slices/timerSlice";
import { initNotificationListener } from "./redux/slices/notificationSlice";
import { initReminderListener } from "./redux/slices/reminderSlice";
import LeadsStats from "./pages/Lead/leadStats/LeadStats";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
const { auth, isLoading, isInitializing } = useSelector((state) => state.auth);
  const { user, token } = auth || {};

  // Load auth state & check token expiry
  useEffect(() => {
    dispatch(loadAuthFromLocalStorage());
    dispatch(checkTokenExpiry());
  }, [dispatch]);

  // Cache-busting to avoid stale assets
  useEffect(() => {
    if ("caches" in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => caches.delete(cacheName));
      });
    }
  }, []);

  // Route access map
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

  // Build allowed routes from user permissions
  const userAccessRoutes = useMemo(
    () =>
      user?.role?.access
        ?.map((accessItem) => routeAccess[accessItem.permission])
        .filter(Boolean),
    [user, routeAccess]
  );


  useEffect(() => {
   
    dispatch(initTimerListener());
    dispatch(initNotificationListener());
    dispatch(initReminderListener());
   
}, []);


// Show spinner if app is still initializing OR doing an async call
if (isInitializing || isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}

  // If not logged in
  if (!token) {
    return <Login />;
  }

  return (
    <main>
      <SocketListeners />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/temp/:hrTaskId" element={<Temp />} />

        {/* Authenticated layout routes */}
        <Route element={<Layout />}>
          {userAccessRoutes}
          <Route path="/leads/stats" element={<LeadsStats />} />,
          <Route path="/profile" element={<Profile />} />
          <Route path="/employee/dashboard" element={<UDashboard />} />
          <Route path="/editor/templates" element={<TemplateEditor />} />
          <Route path="/pdf/editor" element={<PDFEditor />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster />
    </main>
  );
}

export default App;
