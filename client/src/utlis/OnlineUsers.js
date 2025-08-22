import { useEffect, useState } from "react";
import { useSocket } from "../context/socketProvider";

export default function OnlineUsers() {
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if(!socket) {
      return;
    }
    socket.on("onlineUsersUpdate", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("onlineUsersUpdate");
    };
  }, [socket]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      {/* Trigger Button */}
      <div className="flex items-center gap-2 cursor-pointer bg-white/75 text-green-700 px-3 py-1.5 rounded-full font-medium shadow-sm hover:bg-gray-100     transition">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        {onlineUsers.length} Online
      </div>

      {/* Dropdown */}
      <div
        className={`absolute left-0 mt-3 w-72 bg-white shadow-xl rounded-xl border border-gray-100 z-50 overflow-hidden transform transition-all duration-200 ${
          showDropdown
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
          Online Users ({onlineUsers.length})
        </div>

        {/* User List */}
        <ul className="max-h-72 overflow-y-auto list-none">
          {onlineUsers.map((user) => (
            <li
              key={user._id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition list-none m-0"
            >
              <div className="relative flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white text-sm font-semibold flex items-center justify-center">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <span className="text-gray-800 font-medium truncate">
                {user.name}
              </span>
            </li>
          ))}

          {onlineUsers.length === 0 && (
            <li className="px-4 py-3 text-gray-500 text-sm text-center">
              No users online
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
