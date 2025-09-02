import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/socketProvider";
import axios from "axios";

export default function OnlineUsers() {
  const [users, setUsers] = useState([]);
  const [runningTimers, setRunningTimers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [now, setNow] = useState(Date.now());

  const socket = useSocket();
  const wrapperRef = useRef(null); // ✅ wrapper ref for outside click

  useEffect(() => {
    if (!socket) return;

    socket.on("runningTimersUpdate", getTimers);
    return () => socket.off("runningTimersUpdate", getTimers);
  }, [socket]);

  // Fetch Running Timer
  const getTimers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/running/timers`
      );
      if (data) {
        setRunningTimers(data.timers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTimers();
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Get All Users
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Format elapsed time
  const formatElapsedTime = (startTime) => {
    const start = new Date(startTime);
    let diff = Math.floor((now - start) / 1000);
    if (diff < 0) diff = 0;

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor(diff / 60) % 60;
    const displayMinutes = diff < 60 ? 0 : minutes;

    return `${hours > 0 ? hours + "h " : ""}${displayMinutes}m`;
  };

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      {/* Trigger */}
      <div
className={` flex items-center gap-2 cursor-pointer 
  backdrop-blur-md px-4 py-1.5 rounded-xl text-sm font-medium 
  transition-all duration-200  
  ${
    showDropdown
      ? "bg-emerald-500 text-white shadow-md scale-[0.98]"
      : "bg-white/70 text-emerald-600 shadow-sm hover:shadow-md "
  }`}
        onClick={() => setShowDropdown((prev) => !prev)} // ✅ toggle
      >
        <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${showDropdown ? "bg-white" : "bg-emerald-500"}   `}></span> 
        {runningTimers.length} Online
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 mt-2 w-80 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50/50">
            Online Users ({runningTimers.length})
          </div>

          {/* User List */}
          <ul className="overflow-y-auto">
            {runningTimers.length > 0 ? (
              runningTimers
                .slice()
                .sort((a, b) =>
                  a?.jobHolderName.localeCompare(b?.jobHolderName)
                )
                .map((timer) => {
                  const timerUser = users.find(
                    (user) => user._id === timer.clientId
                  );

                  return (
                    <li
                      key={timer._id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/70 transition-colors m-0"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {timerUser?.avatar ? (
                          <img
                            src={timerUser?.avatar}
                            alt={timerUser?.name}
                            className="w-9 h-9 rounded-full object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-sm font-semibold flex items-center justify-center shadow-sm">
                            {timerUser?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col truncate w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-900 font-medium truncate">
                            {timerUser?.name}
                          </span>
                          <div className="flex gap-1 text-[11px]">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">
                              {new Date(
                                timer?.startTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg">
                              {formatElapsedTime(timer?.startTime)}
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-xs text-gray-600 truncate mt-0.5"
                          title={timer?.task || timer?.clientName}
                        >
                          {timer?.task || timer?.clientName}
                        </span>
                      </div>
                    </li>
                  );
                })
            ) : (
              <li className="px-4 py-5 text-gray-400 text-sm text-center m-0">
                No users online
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
