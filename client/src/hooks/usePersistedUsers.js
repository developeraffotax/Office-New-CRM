import { useEffect, useState } from "react";

export function usePersistedUsers(storageKey, allUsers = []) {
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Load from localStorage (or fallback)
  useEffect(() => {
    if (!allUsers.length) return;

    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // keep only valid users
        const validUsers = parsed.filter((u) => allUsers.includes(u));

        setSelectedUsers(validUsers.length ? validUsers : allUsers);
      } catch {
        setSelectedUsers(allUsers);
      }
    } else {
      setSelectedUsers(allUsers);
    }
  }, [allUsers, storageKey]);

  // Persist whenever selection changes
  useEffect(() => {
    if (selectedUsers?.length) {
      localStorage.setItem(storageKey, JSON.stringify(selectedUsers));
    }
  }, [selectedUsers, storageKey]);

  // Helpers (optional but useful)
  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.includes(user)
        ? prev.filter((u) => u !== user)
        : [...prev, user]
    );
  };

  const resetUsers = () => setSelectedUsers(allUsers);

  return {
    selectedUsers,
    setSelectedUsers,
    toggleUser,
    resetUsers,
  };
}
