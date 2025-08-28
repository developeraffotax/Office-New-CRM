import { useEffect, useState } from "react";
import { useSocket } from "../context/socketProvider";
import axios from "axios";

export default function OnlineUsers() {
  const [users, setUsers] = useState([]);
  const [runningTimers, setRunningTimers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [now, setNow] = useState(Date.now()); // for live timer update


  const socket = useSocket()


  useEffect(() => {

    if(!socket) return;

      socket.on("runningTimersUpdate", getTimers)
 
    return () => socket.off("runningTimersUpdate", getTimers)

  }, [socket])








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

    // Update live elapsed time every second
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

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

  // Helper function to format elapsed time
const formatElapsedTime = (startTime) => {
  const start = new Date(startTime);
  let diff = Math.floor((now - start) / 1000); // total seconds

  if (diff < 0) diff = 0; // safety check for -1 bug

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor(diff / 60) % 60;

  // Show minutes rounded up when any seconds have passed
  const displayMinutes = diff < 60 ? 0 : minutes;

  return `${hours > 0 ? hours + "h " : ""}${displayMinutes}m`;
};


  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      {/* Trigger Button */}
      <div className="flex items-center gap-2 cursor-pointer bg-white/75 text-green-700 px-3 py-1.5 rounded-full font-medium shadow-sm hover:bg-gray-100 transition">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        {runningTimers.length} Online
      </div>

      {/* Dropdown */}
      <div
        className={`absolute left-0 mt-3 w-80 bg-white shadow-xl rounded-xl border border-gray-100 z-50 overflow-hidden transform transition-all duration-200 ${
          showDropdown
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
          Online Users ({runningTimers.length})
        </div>

        {/* User List */}
        <ul className="  overflow-y-auto list-none">
          {runningTimers
            .slice() // clone array so original state is not mutated
            .sort((a, b) => a?.jobHolderName.localeCompare(b?.jobHolderName))
            .map((timer) => {
              const timerUser = users.find(
                (user) => user._id === timer.clientId
              );

              return (
                <li
                  key={timer._id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition list-none m-0"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {timerUser?.avatar ? (
                      <img
                        src={timerUser?.avatar}
                        alt={timerUser?.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white text-sm font-semibold flex items-center justify-center">
                        {timerUser?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>

                  {/* Info Row */}
                  <div className="flex flex-col truncate w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-gray-800 font-medium truncate">
                        {timerUser?.name}
                      </span>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-sky-500 text-white px-2 py-0.5 rounded">
                          {new Date(timer?.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="bg-teal-500 text-white px-2 py-0.5 rounded">
                          {formatElapsedTime(timer?.startTime)}
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-700 text-sm truncate">
                      {timer?.task || timer?.clientName}
                    </span>
                  </div>
                </li>
              );
            })}

          {runningTimers.length === 0 && (
            <li className="px-4 py-3 text-gray-500 text-sm text-center">
              No users online
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
