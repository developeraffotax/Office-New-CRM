
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const DEFAULT_LABEL = "This Year";
const STORAGE_KEY = "kpi_table_selected_users";

const makeDefaultRange = () => [
  dayjs().startOf("year"),
  dayjs().endOf("year"),
];

const getSavedUsers = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Date / source / user filters + users & teams lists.
 * Remembers the last selected users locally for the KPI table.
 */
export default function useKpiFilters() {
  const [dateRange, setDateRange] = useState(makeDefaultRange);
  const [activeLabel, setActiveLabel] = useState(DEFAULT_LABEL);
  const [selectedSource, setSelectedSource] = useState("");

  // Restore the last selected users on the first mount.
  const [selectedUsers, setSelectedUsers] = useState(getSavedUsers);

  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  // Save the selected users whenever the selection changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(selectedUsers),
      );
    } catch (error) {
      console.error("Failed to save KPI table users:", error);
    }
  }, [selectedUsers]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/user/get/users-list`,
        );
        setUsers(data?.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/team/get_all`,
        );
        setTeams(data?.teams || []);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    })();
  }, []);

  // User name -> team name (handles populated or raw-ID user.team).
  const userTeamMap = useMemo(() => {
    const teamNameById = Object.fromEntries(
      teams.map((t) => [t._id, t.name]),
    );

    const map = {};

    users.forEach((u) => {
      if (!u.team) return;

      const teamName =
        typeof u.team === "object"
          ? u.team.name
          : teamNameById[u.team];

      if (teamName) map[u.name] = teamName;
    });

    return map;
  }, [users, teams]);

  // Compare by day to determine whether filters differ from defaults.
  const isFilterActive = useMemo(() => {
    const [defStart, defEnd] = makeDefaultRange();

    const sameRange =
      dateRange[0]?.isSame(defStart, "day") &&
      dateRange[1]?.isSame(defEnd, "day");

    return (
      !sameRange ||
      activeLabel !== DEFAULT_LABEL ||
      selectedSource !== "" ||
      selectedUsers.length > 0
    );
  }, [dateRange, activeLabel, selectedSource, selectedUsers]);

  const handleQuickFilterSelect = (label, range) => {
    setActiveLabel(label);
    setDateRange(range);
  };

  const handleClearFilters = () => {
    setDateRange(makeDefaultRange());
    setActiveLabel(DEFAULT_LABEL);
    setSelectedSource("");
    setSelectedUsers([]);
  };

  return {
    dateRange,
    setDateRange,
    activeLabel,
    setActiveLabel,
    selectedSource,
    setSelectedSource,
    selectedUsers,
    setSelectedUsers,
    users,
    teams,
    userTeamMap,
    isFilterActive,
    handleQuickFilterSelect,
    handleClearFilters,
  };
}
