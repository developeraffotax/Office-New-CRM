import { useState, useMemo, useEffect, useRef } from "react";
import clsx from "clsx";

export default function AssignUser({
  users = [],
  conversationId,
  currentUserId,
  updateConversation,
  buttonStyle = "",
  showLabel = false,
}) {
  const [updating, setUpdating] = useState(false);
  const [assignedUserId, setAssignedUserId] = useState(currentUserId);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setAssignedUserId(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentUser = useMemo(
    () => users.find((u) => u._id === assignedUserId),
    [users, assignedUserId]
  );

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const updateUser = async (userId) => {
    try {
      setUpdating(true);
      setAssignedUserId(userId || null);
      setOpen(false);
      await updateConversation(conversationId, { userId: userId || null });
    } catch (error) {
      console.error("Failed to update user", error);
      setAssignedUserId(currentUserId);
    } finally {
      setUpdating(false);
    }
  };

  const Avatar = ({ user, size = "sm" }) => {
    const dim = size === "sm" ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[9px]";
    return (
      <span
        className={clsx(
          "rounded-full overflow-hidden bg-orange-500 text-white flex items-center justify-center font-bold shrink-0",
          dim
        )}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          getInitials(user.name)
        )}
      </span>
    );
  };

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {showLabel && (
        <span className="text-sm text-gray-700 font-medium min-w-0 truncate">
          {currentUser?.name || "Unassigned"}
        </span>
      )}

      <div ref={ref} className={clsx("relative", buttonStyle)}>
        <button
          disabled={updating}
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            "h-6 w-full rounded-md border px-1.5 text-xs font-medium flex items-center gap-1.5",
            "outline-none transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            currentUser
              ? "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
              : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
          )}
        >
          {currentUser && <Avatar user={currentUser} size="sm" />}

          <span className="truncate flex-1 text-left">
            {currentUser ? currentUser.name : "Unassigned"}
          </span>

          <svg
            className="w-3 h-3 opacity-50 shrink-0"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 left-0 w-full rounded-md border border-gray-200 bg-white shadow-md py-1 min-w-[140px]">
            <button
              onClick={() => updateUser("")}
              className={clsx(
                "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-400 border-b",
                !assignedUserId && "font-semibold text-gray-600"
              )}
            >
              Unassigned
            </button>

            {users.map((user) => (
              <button
                key={user._id}
                onClick={() => updateUser(user._id)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-gray-100"

              >
                <Avatar user={user} size="md" />
                <span
                  className={clsx(
                    "truncate",
                    assignedUserId === user._id && "font-semibold text-gray-700"
                  )}
                >
                  {user.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


















































// export default function AssignUser({
//   users = [],
//   conversationId,
//   currentUserId,
//   updateConversation,
//   buttonStyle = "",
//   showLabel = false,
// }) {
//   const [updating, setUpdating] = useState(false);
//   const [assignedUserId, setAssignedUserId] = useState(currentUserId);

//   console.log({
//   assignedUserId,
//   currentUserId,
//   userIds: users.map(u => ({
//     id: u._id,
//     type: typeof u._id
//   }))
// });

// console.log(users)


//   useEffect(() => {
//     setAssignedUserId(currentUserId);
//   }, [currentUserId]);

//   const currentUser = useMemo(
//     () => users.find((u) => u._id === assignedUserId),
//     [users, assignedUserId]
//   );

//   const updateUser = async (userId) => {
//     try {
//       setUpdating(true);

//       setAssignedUserId(userId);

//       await updateConversation(conversationId, {
//         userId,
//       });
//     } catch (error) {
//       console.error("Failed to update user", error);

//       setAssignedUserId(currentUserId);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   return (
//     <div
//       className="flex items-center gap-2"
//       onClick={(e) => e.stopPropagation()}
//     >
//       {showLabel && (
//         <span className="text-sm text-gray-700 font-medium min-w-0 truncate">
//           {currentUser?.name || "Unassigned"}
//         </span>
//       )}

//       <select
//         value={assignedUserId}
//         disabled={updating}
//         onChange={(e) =>
//           updateUser(e.target.value || null)
//         }
//                className={clsx(
//          "h-6 rounded-md border border-gray-200 bg-transparent px-1.5 text-xs bg-white",
//          "hover:border-gray-300",
//          "outline-none",
//          "disabled:opacity-50 disabled:cursor-not-allowed",
//          buttonStyle
//        )}
//       >
//         <option value="">Unassigned</option>

//         {users.map((user) => (
//           <option
//             key={user._id}
//             value={user._id}
//           >
//             {user.name}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }