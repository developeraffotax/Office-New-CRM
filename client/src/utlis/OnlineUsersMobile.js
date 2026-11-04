import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/socketProvider";
import axios from "axios";

export default function OnlineUsersMobile() {
  const [users, setUsers] = useState([]);
  const [runningTimers, setRunningTimers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState("");

  const socket = useSocket();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.on("runningTimersUpdate", getTimers);
    return () => socket.off("runningTimersUpdate", getTimers);
  }, [socket]);

  const getTimers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/running/timers`
      );
      if (data) setRunningTimers(data.timers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTimers();
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    if (!showDropdown) setSearchQuery("");
  }, [showDropdown]);

  const formatElapsedTime = (startTime) => {
    const start = new Date(startTime);
    let diff = Math.floor((now - start) / 1000);
    if (diff < 0) diff = 0;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor(diff / 60) % 60;
    return `${hours > 0 ? hours + "h " : ""}${minutes}m`;
  };

  const filteredTimers = runningTimers.filter((timer) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      timer?.task?.toLowerCase().includes(query) ||
      timer?.clientName?.toLowerCase().includes(query) ||
      timer?.companyName?.toLowerCase().includes(query) ||
      timer?.jobHolderName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="relative md:hidden" ref={wrapperRef}>
      {/* Compact trigger */}
      <div
        className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-lg text-xs font-medium transition-all
          ${
            showDropdown
              ? "bg-emerald-500 text-white shadow"
              : "bg-white/80 text-emerald-600 shadow-sm"
          }`}
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${
            showDropdown ? "bg-white" : "bg-emerald-500"
          }`}
        />
        <span>{runningTimers.length}</span>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200 rounded-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50/70">
            Online ({runningTimers.length})
          </div>

          <div className="px-2.5 py-2 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <ul className="overflow-y-auto max-h-[60vh]">
            {filteredTimers.length > 0 ? (
              filteredTimers
                .slice()
                .sort((a, b) =>
                  a?.jobHolderName?.localeCompare(b?.jobHolderName)
                )
                .map((timer) => {
                  const timerUser = users.find(
                    (user) => user._id === timer.clientId
                  );

                  return (
                    <li
                      key={timer._id}
                      className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors list-none m-0"
                    >
                      <div className="relative flex-shrink-0">
                        {timerUser?.avatar ? (
                          <img
                            src={timerUser.avatar}
                            alt={timerUser.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-xs font-semibold flex items-center justify-center">
                            {timerUser?.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>

                      <div className="flex flex-col truncate min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {timerUser?.name}
                            </span>
                            {timer?.isAgentOnline && (
                              <span
                                title="AffoStaff Running"
                                className="shrink-0 w-3.5 h-3.5 text-[10px] rounded-full bg-amber-500 text-white flex items-center justify-center"
                              >
                                A
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 text-[10px] shrink-0">
                            <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                              {new Date(timer?.startTime).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                            <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
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
              <li className="px-4 py-5 text-gray-400 text-sm text-center">
                {searchQuery.trim() ? "No matches" : "No users online"}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}