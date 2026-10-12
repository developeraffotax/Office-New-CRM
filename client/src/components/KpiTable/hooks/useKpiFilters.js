import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const DEFAULT_LABEL = "This Year";
const makeDefaultRange = () => [dayjs().startOf("year"), dayjs().endOf("year")];

/**
 * Date / source / user filters + users & teams lists, shared by the KPI pages.
 * (KpiDashboard can switch to this later to drop its own copy of this state.)
 */
export default function useKpiFilters() {
  const [dateRange, setDateRange] = useState(makeDefaultRange);
  const [activeLabel, setActiveLabel] = useState(DEFAULT_LABEL);
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

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

  // user name -> team name (handles populated or raw-id `user.team`)
  const userTeamMap = useMemo(() => {
    const teamNameById = Object.fromEntries(teams.map((t) => [t._id, t.name]));
    const map = {};
    users.forEach((u) => {
      if (!u.team) return;
      const teamName = typeof u.team === "object" ? u.team.name : teamNameById[u.team];
      if (teamName) map[u.name] = teamName;
    });
    return map;
  }, [users, teams]);

  // compares by day, so it's only "active" when something really differs from the default
  const isFilterActive = useMemo(() => {
    const [defStart, defEnd] = makeDefaultRange();
    const sameRange =
      dateRange[0]?.isSame(defStart, "day") && dateRange[1]?.isSame(defEnd, "day");
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
    dateRange, setDateRange,
    activeLabel, setActiveLabel,
    selectedSource, setSelectedSource,
    selectedUsers, setSelectedUsers,
    users, teams, userTeamMap,
    isFilterActive,
    handleQuickFilterSelect,
    handleClearFilters,
  };
}