import { useEffect, useMemo, useState } from "react";
import { getJuniorsList } from "../utlis/getJuniorsList";
 

export function usePersistedUsersNew({
  storage_key, users = [], current_user
}) {
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Narrow the full user list down to current_user's juniors first
  const juniors = useMemo(
    () => getJuniorsList(users, current_user),
    [users, current_user]
  );
  const juniorNames = useMemo(() => juniors.map((u) => u.name), [juniors]);

  // Load from localStorage (or fallback)
  useEffect(() => {
    if (!juniorNames.length) return;

    const saved = localStorage.getItem(storage_key);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // keep only names that are still valid juniors
        const validUsers = parsed.filter((name) => juniorNames.includes(name));

        setSelectedUsers(validUsers.length ? validUsers : juniorNames);
      } catch {
        setSelectedUsers(juniorNames);
      }
    } else {
      setSelectedUsers(juniorNames);
    }
  }, [juniorNames, storage_key]);

  // Persist whenever selection changes
  useEffect(() => {
    if (selectedUsers?.length) {
      localStorage.setItem(storage_key, JSON.stringify(selectedUsers));
    }
  }, [selectedUsers, storage_key]);

  // Helpers (optional but useful)
  const toggleUser = (name) => {
    setSelectedUsers((prev) =>
      prev.includes(name) ? prev.filter((u) => u !== name) : [...prev, name]
    );
  };

  const resetUsers = () => setSelectedUsers(juniorNames);

  return {
    selectedUsers,
    setSelectedUsers,
    toggleUser,
    resetUsers,
  };
}