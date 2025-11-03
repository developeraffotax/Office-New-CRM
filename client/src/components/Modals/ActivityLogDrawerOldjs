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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/tickets/activity/${ticketId}`);
        console.log("Fetched logs:", res.data);
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching activity logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [ticketId]);


  useEffect(() => {

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };


  }, [])

  return (
    <div className="fixed inset-0 z-50 ">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-gray-100 shadow-lg p-5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold ">Activity Logs</h2>
          <button onClick={onClose} className="text-white   bg-red-500 hover:bg-red-600 rounded-lg p-1 transition-colors duration-300" title="Press Esc to Close">
            <AiOutlineClose size={24} />
          </button>
        </div>

        <hr className="border-gray-300 my-2 pb-4" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 activity-scroll-container">
          {loading ? (
            <div className="text-sm text-gray-500 px-2">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-sm text-gray-500 px-2">No activity found.</div>
          ) : (
            logs
              .map((log) => (
                <div
                  key={log._id}
                  className="w-full flex flex-col gap-2 py-2 px-3 border border-gray-300 rounded-md shadow hover:shadow-md bg-white hover:bg-orange-50 transition-all duration-300 cursor-pointer ease-in-out"
                >
                 <div className="w-full flex justify-between items-center gap-2 ">

                   {/* Timestamp */}
                  <p className="mb-2 text-[15px] font-medium text-green-500 mt-2 flex items-center gap-2">
                    <span className="w-[.8rem] h-[.8rem] rounded-full bg-green-500"></span>
                    {new Date(log.createdAt).toLocaleString()}
                  </p>

                  <strong className={`text-[14px] font-[600] text-white  p-1 rounded-md ${log.action === "created" ? "bg-green-600" : log.action === "updated" ? "bg-blue-600" : log.action === "replied" ? "bg-yellow-600" : "bg-gray-500"}`}>
                        {log.action === "created" ? "Created" : log.action === "updated" ? "Updated" : log.action === "replied" ? "Replied" : ""}
                    </strong>

                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {log.userId?.avatar ? (
                        <img
                          src={log.userId.avatar}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full text-white font-semibold flex items-center justify-center"
                          style={{
                            backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                          }}
                        >
                          {log.userId?.name?.[0] || "S"}
                        </div>
                      )}
                    </div>
                    
                    
                        <strong className="text-[16px] font-semibold text-black ">
                      {log.userId?.name || "System"}
                    </strong>

                    

                     
                  </div>

                  {/* Action */}
                  <strong className="text-[15px] font-semibold text-black">
                    Details:{" "}
                    <span className="text-[13px] text-gray-700 ml-1 font-normal whitespace-pre">
                       
                      {log.details || "No details provided."}
                    </span>
                  </strong>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogDrawer;
