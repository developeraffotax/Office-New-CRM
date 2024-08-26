import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/dashboard/Dashboard";
import AllJobs from "./pages/Jobs/AllJobs";
import AllTasks from "./pages/Tasks/AllTasks";
import AllLists from "./pages/lists/AllLists";
import AllUsers from "./pages/Auth/AllUsers";
import Profile from "./pages/Auth/Profile";
import { useEffect } from "react";
import socketIO from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

function App() {
  useEffect(() => {
    socketId.on("connection", () => {});
  }, []);
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my_list" element={<AllLists />} />
          <Route path="/tasks" element={<AllTasks />} />
          <Route path="/job-planning" element={<AllJobs />} />
          <Route path="/users" element={<AllUsers />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
