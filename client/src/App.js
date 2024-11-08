import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/dashboard/Dashboard";
import AllJobs from "./pages/Jobs/AllJobs";
import AllTasks from "./pages/Tasks/AllTasks";
// import AllLists from "./pages/lists/AllLists";
import Profile from "./pages/Auth/Profile";
import { useEffect } from "react";
import socketIO from "socket.io-client";
import TimeSheet from "./pages/TimerSheet/TimeSheet";
import Tickets from "./pages/Tickets/Tickets";
import Template from "./pages/Templates/Template";
import EmailDetail from "./pages/Tickets/EmailDetail";
import CompleteTickets from "./pages/Tickets/CompleteTickets";
import Lead from "./pages/Lead/Lead";
import Proposal from "./pages/Proposal/Proposal";
import Roles from "./pages/role/Roles";

import { useAuth } from "./context/authContext";
import NotFound from "./pages/NotFound/NotFound";
import Users from "./pages/Auth/Users";
import Subscription from "./pages/Subscription/Subscription";
import Inbox from "./pages/Tickets/Inbox";
import Goals from "./pages/Goal/Goals";
import AllLists from "./pages/lists/AllLists";
import Workflow from "./pages/Workflow/Workflow";
import Complaints from "./pages/Complaints/Complaints";

const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

function App() {
  const { auth } = useAuth();
  const user = auth.user;

  const routeAccess = {
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
  };

  const userAccessRoutes = user?.role?.access
    ?.map((accessItem) => {
      return routeAccess[accessItem.permission];
    })
    .filter(Boolean);

  console.log("Access:", user?.role?.access);

  useEffect(() => {
    socketId.on("connection", () => {});
  }, []);

  useEffect(() => {
    const cacheBuster = () => {
      if ("caches" in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => caches.delete(cacheName));
        });
      }
    };

    cacheBuster();

    // Set cache-control headers on every API request
    const defaultHeaders = new Headers();
    defaultHeaders.append(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    defaultHeaders.append("Pragma", "no-cache");
    defaultHeaders.append("Expires", "0");
    defaultHeaders.append("Surrogate-Control", "no-store");
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* If the user is not authenticated, navigate to login */}
          {/* {!user && <Route path="*" element={<Navigate to="/" />} />} */}
          <Route path="/" element={<Login />} />
          {userAccessRoutes}
          <Route path="/profile" element={<Profile />} />
          {/* Catch-all route: if no access to a route, show 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
