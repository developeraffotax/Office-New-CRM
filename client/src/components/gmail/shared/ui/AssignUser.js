import { useState, useMemo, useEffect, useRef } from "react";
import clsx from "clsx";
import { FiUserPlus } from "react-icons/fi";
import { useClickOutside } from "../../../../utlis/useClickOutside";

export default function AssignUser({
  users = [],
  mongoThreadId,
  currentUserId,
  handleUpdateThread,
  buttonStyle = "",
  showLabel = false,
  onToggle = () => {}
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // ✅ Local state so UI updates immediately
  const [assignedUserId, setAssignedUserId] = useState(currentUserId);

    const ref = useRef();



  // keep sync if parent changes
  useEffect(() => {
    setAssignedUserId(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    onToggle(open)

  }, [open])

  const currentUser = useMemo(() => {
    return users.find((u) => u._id === assignedUserId);
  }, [users, assignedUserId]);

  const updateUser = async (userId) => {
    try {
      setUpdating(true);
      setOpen(false);
      

      // optimistic update
      setAssignedUserId(userId);

      await handleUpdateThread(mongoThreadId, { userId });
    } catch (error) {
      console.error("Failed to update user", error);

      // revert if API fails
      setAssignedUserId(currentUserId);
    } finally {
      setUpdating(false);
    }
  };



   useClickOutside(ref, () => {
        setOpen(false)
    })

  return (
    <div className="relative flex items-center gap-2"  ref={ref}>
      {/* Label */}
      {showLabel && (
        <span className="text-sm text-gray-600 font-medium">
          {currentUser ? currentUser.name : " "}
        </span>
      )}

      {/* Button */}
      <button
        title="Assign User"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={clsx(
          "p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm",
          buttonStyle
        )}
      >
        <FiUserPlus className="size-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 max-h-[480px] overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-xl z-50 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Assign to...
          </div>

          {users.map((user) => (
            <button
              key={user._id}
              disabled={updating}
              onClick={() => updateUser(user._id)}
              className={clsx(
                "w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b last:border-0",
                assignedUserId === user._id
                  ? "text-blue-600 font-semibold bg-blue-50/50"
                  : "text-gray-700"
              )}
            >
              {user.name}
            </button>
          ))}

          {/* Remove User */}
          <button
            disabled={updating || !assignedUserId}
            onClick={() => updateUser(null)}
            className={clsx(
              "w-full px-3 py-2 text-left text-sm transition-colors",
              assignedUserId
                ? "text-red-600 hover:bg-red-50"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            Remove user
          </button>
        </div>
      )}
    </div>
  );
}