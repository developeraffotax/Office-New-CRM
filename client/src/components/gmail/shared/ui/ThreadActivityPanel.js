import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { IoCloseOutline, IoPersonOutline, IoPricetagOutline, IoSyncOutline } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";
import { HiOutlineFingerPrint } from "react-icons/hi2";

const getActivityConfig = (action) => {
  switch (action) {
    case "user_changed":
      return {
        icon: <IoPersonOutline className="text-blue-500" />,
        bgColor: "bg-blue-50",
      };
    case "category_changed":
      return {
        icon: <IoPricetagOutline className="text-purple-500" />,
        bgColor: "bg-purple-50",
      };
    case "status_changed":
      return {
        icon: <IoSyncOutline className="text-emerald-500" />,
        bgColor: "bg-emerald-50",
      };
    default:
      return {
        icon: <HiOutlineFingerPrint className="text-gray-500" />,
        bgColor: "bg-gray-50",
      };
  }
};

// Reusable Avatar Component
const UserAvatar = ({ user, size = "size-9" }) => {
  const name = user?.name || "System";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`relative shrink-0 ${size}`}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={name}
          className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
        />
      ) : (
        <div className="h-full w-full rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-white shadow-sm">
          {initial}
        </div>
      )}
    </div>
  );
};

function renderActivityText(act) {
  switch (act.action) {
    case "user_changed":
      return (
        <span className="text-gray-700">
          User changed from <span className="text-gray-400 line-through">{act.oldValue || "Unassigned"}</span> to <span className="font-semibold text-gray-900">{act.newValue || "Unassigned"}</span>
        </span>
      );
    case "category_changed":
      return (
        <span className="text-gray-700">
          Category changed from <span className="line-through text-gray-400">{act.oldValue || "Uncategorized"}</span> to <span className="font-semibold text-gray-900">{act.newValue || "Uncategorized"}</span>
        </span>
      );
    case "status_changed":
      return (
        <span className="text-gray-700">
          Status changed from <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase line-through text-gray-400`}>{act.oldValue}</span> to <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${act.newValue === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{act.newValue}</span>
        </span>
      );
    default:
      return act.field || "System Update";
  }
}

export default function ThreadActivityPanel({ threadId, onClose }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!threadId) return;
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/gmail/activity/${threadId}`
        );
        setActivities(data.data);
      } catch (err) {
        console.error("Activity fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [threadId]);

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[60] transition-opacity "
        onClick={onClose}
      />
      
      <div className="fixed right-0 top-0 h-full w-80 md:w-[400px] bg-white shadow-2xl z-[70] flex flex-col border-l border-gray-100 animate-slide-in-right duration-300">
        
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-inter">
              <h3 className="text-xl font-semibold text-gray-900 uppercase  ">
                Activity Log
              </h3>
              {!loading && activities.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600  text-[10px] font-bold">
                  {activities.length}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-medium uppercase ">
              Thread Activity
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="group p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100"
            aria-label="Close panel"
          >
            <IoCloseOutline className="size-5 text-gray-400 group-hover:text-gray-900 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar font-google">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <TbLoader2 className="size-6 animate-spin text-orange-500" />
              <span className="text-xs font-medium">Loading history...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
              <HiOutlineFingerPrint className="size-10 mb-2" />
              <span className="text-xs">No activity recorded yet</span>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical Line Adjusted for Avatar Alignment */}
              <div className="absolute left-[17px] top-2 bottom-2 w-[1.5px] bg-gray-100" />

              <div className="space-y-6 relative">
                {activities.map((act) => {
                  const config = getActivityConfig(act.action);
                  return (
                    <div key={act._id} className="flex gap-4 group">
                      
                      {/* Avatar with Action Icon Badge */}
                      <div className="relative">
                        <UserAvatar user={act.performedBy} />
                        <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${config.bgColor}`}>
                          {React.cloneElement(config.icon, { className: "size-2.5 " + config.icon.props.className })}
                        </div>
                      </div>

                      <div className="flex flex-col pt-0.5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-gray-900 leading-none">
                            {act.performedBy?.name || "System"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {moment(act.createdAt).fromNow()}
                          </span>
                        </div>
                        
                        <div className="text-[13px] leading-snug">
                          {renderActivityText(act)}
                        </div>

                        <div className="mt-1  transition-opacity text-[10px] text-gray-400 italic">
                          {moment(act.createdAt).format("MMM DD, hh:mm A")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}