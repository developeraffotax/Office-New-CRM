import { useState, useMemo, useEffect } from "react";
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

  console.log({
  assignedUserId,
  currentUserId,
  userIds: users.map(u => ({
    id: u._id,
    type: typeof u._id
  }))
});

console.log(users)


  useEffect(() => {
    setAssignedUserId(currentUserId);
  }, [currentUserId]);

  const currentUser = useMemo(
    () => users.find((u) => u._id === assignedUserId),
    [users, assignedUserId]
  );

  const updateUser = async (userId) => {
    try {
      setUpdating(true);

      setAssignedUserId(userId);

      await updateConversation(conversationId, {
        userId,
      });
    } catch (error) {
      console.error("Failed to update user", error);

      setAssignedUserId(currentUserId);
    } finally {
      setUpdating(false);
    }
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

      <select
        value={assignedUserId}
        disabled={updating}
        onChange={(e) =>
          updateUser(e.target.value || null)
        }
               className={clsx(
         "h-6 rounded-md border border-gray-200 bg-transparent px-1.5 text-xs bg-white",
         "hover:border-gray-300",
         "outline-none",
         "disabled:opacity-50 disabled:cursor-not-allowed",
         buttonStyle
       )}
      >
        <option value="">Unassigned</option>

        {users.map((user) => (
          <option
            key={user._id}
            value={user._id}
          >
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}