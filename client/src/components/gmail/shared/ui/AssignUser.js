import { useState, useMemo, useEffect, useRef } from "react";
import clsx from "clsx";
import { FiUserPlus } from "react-icons/fi";
import { useClickOutside } from "../../../../utlis/useClickOutside";
import { useEscapeKey } from "../../../../utlis/useEscapeKey";

export default function AssignUser({
  users = [],
  mongoThreadId,
  currentUserId,
  handleUpdateThread,
  buttonStyle = "",
  showLabel = false,
  onToggle = () => {},
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [assignedUserId, setAssignedUserId] = useState(currentUserId);

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const [searchBuffer, setSearchBuffer] = useState("");
  const searchTimeoutRef = useRef(null);
  const lastBufferRef = useRef("");
  const cycleIndexRef = useRef(0);

  const ref = useRef();
  const listRef = useRef();

  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));

  useEffect(() => setAssignedUserId(currentUserId), [currentUserId]);
  useEffect(() => onToggle(open), [open]);

  useEffect(() => {
    if (open) {
      const index = users.findIndex((u) => u._id === assignedUserId);
      setHighlightedIndex(index >= 0 ? index : 0);
    }
  }, [open, users, assignedUserId]);

  const currentUser = useMemo(
    () => users.find((u) => u._id === assignedUserId),
    [users, assignedUserId],
  );

  const updateUser = async (userId) => {
    try {
      setUpdating(true);
      setOpen(false);
      setAssignedUserId(userId);
      await handleUpdateThread(mongoThreadId, { userId });
    } catch (error) {
      console.error("Failed to update user", error);
      setAssignedUserId(currentUserId);
    } finally {
      setUpdating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!open) return;

    const key = e.key.toLowerCase();

    if (key === "enter") {
      e.preventDefault();
      const selectedUser = users[highlightedIndex];
      if (selectedUser) updateUser(selectedUser._id);
      return;
    }

    if (key === "arrowdown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < users.length - 1 ? prev + 1 : prev,
      );
      return;
    }

    if (key === "arrowup") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      return;
    }

    if (/^[a-z0-9]$/.test(key)) {
      e.preventDefault();

      const newBuffer = searchBuffer + key;
      setSearchBuffer(newBuffer);

      if (searchTimeoutRef.current)
        clearTimeout(searchTimeoutRef.current);

      searchTimeoutRef.current = setTimeout(
        () => setSearchBuffer(""),
        300,
      );

      const matches = users
        .map((u, i) => ({ index: i, name: u.name.toLowerCase() }))
        .filter((u) => u.name.startsWith(newBuffer));

      if (!matches.length) return;

      if (lastBufferRef.current === newBuffer) {
        cycleIndexRef.current =
          (cycleIndexRef.current + 1) % matches.length;
      } else {
        lastBufferRef.current = newBuffer;
        cycleIndexRef.current = 0;
      }

      const newIndex = matches[cycleIndexRef.current].index;
      setHighlightedIndex(newIndex);
    }
  };

  useEffect(() => {
    const el = listRef.current?.children[highlightedIndex];
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  return (
    <div
      className="relative flex items-center gap-2 "
      ref={ref}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Label */}
      {showLabel && (
        <span className="text-sm text-gray-700 font-medium">
          {currentUser ? currentUser.name : " "}
        </span>
      )}

      {/* Assign button */}
      <button
        title="Assign User"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={clsx(
          "p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition-all shadow-sm outline-none0",
          buttonStyle,
        )}
      >
        <FiUserPlus className="size-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-60 max-h-[500px] border border-gray-200 rounded-lg bg-white shadow-xl z-50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3 py-2 text-[11px] font-semibold text-gray-500 border-b bg-gray-50 uppercase tracking-wide">
            Assign to
          </div>

          {/* Users */}
          <div
            ref={listRef}
            className="max-h-[420px] overflow-y-auto"
          >
            {users.map((user, index) => {
              const isHighlighted =
                index === highlightedIndex;

              const isSelected =
                assignedUserId === user._id;

              return (
                <button
                  key={user._id}
                  disabled={updating}
                  onClick={() => updateUser(user._id)}
                  className={clsx(
                    "relative w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-all duration-100 border-b border-gray-100 last:border-none",

                    // Default
                    "text-gray-700",

                    // Hover
                    !isSelected &&
                      "hover:bg-gray-100",

                    // Highlighted
                    isHighlighted &&
                      !isSelected &&
                      "bg-blue-100",

                    // Selected
                    isSelected &&
                      "bg-blue-600 text-white font-medium",
                  )}
                >
                  <span className="truncate">
                    {user.name}
                  </span>

                  {isSelected && (
                    <span className="ml-2 text-white text-xs font-semibold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Remove */}
          <button
            disabled={updating || !assignedUserId}
            onClick={() => updateUser(null)}
            className={clsx(
              "w-full px-3 py-2.5 text-left text-sm transition-colors border-t border-gray-200",

              assignedUserId
                ? "text-red-600 hover:bg-red-50"
                : "text-gray-300 cursor-not-allowed",
            )}
          >
            Remove user
          </button>
        </div>
      )}
    </div>
  );
}