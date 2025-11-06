import { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineClose } from "react-icons/ai";

const ActivityLogDrawer = ({ onClose, ticketId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!ticketId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/tickets/activity/${ticketId}`
        );
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching activity logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [ticketId]);

  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     if (event.key === "Escape") onClose();
  //   };

  //   document.addEventListener("keydown", handleKeyDown);
  //   return () => document.removeEventListener("keydown", handleKeyDown);
  // }, [onClose]);

  return (
    <div className="h-full w-full  border border-gray-200 rounded-lg shadow-sm flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-100/80 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">Activity Logs</h2>
        {/* <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Press Esc to Close"
        >
          <AiOutlineClose size={20} />
        </button> */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="text-sm text-gray-500 text-center py-4">
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No activity found.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log._id}
              className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 p-3 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {new Date(log.createdAt).toLocaleString()}
                </p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md text-white ${
                    log.action === "created"
                      ? "bg-green-600"
                      : log.action === "updated"
                      ? "bg-blue-600"
                      : log.action === "replied"
                      ? "bg-yellow-600"
                      : "bg-gray-500"
                  }`}
                >
                  {log.action === "created"
                    ? "Created"
                    : log.action === "updated"
                    ? "Updated"
                    : log.action === "replied"
                    ? "Replied"
                    : ""}
                </span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 mb-2">
                {log.userId?.avatar ? (
                  <img
                    src={log.userId.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full text-white font-medium flex items-center justify-center"
                    style={{
                      backgroundColor: `#${Math.floor(
                        Math.random() * 16777215
                      ).toString(16)}`,
                    }}
                  >
                    {log.userId?.name?.[0] || "S"}
                  </div>
                )}
                <strong className="text-sm text-gray-800 font-medium">
                  {log.userId?.name || "System"}
                </strong>
              </div>

              {/* Details */}
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-800">Details:</span>{" "}
                <span className="font-normal text-gray-600">
                  {log.details || "No details provided."}
                </span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLogDrawer;
