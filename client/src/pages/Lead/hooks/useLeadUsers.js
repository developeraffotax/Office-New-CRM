import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { usePersistedUsers } from "../../../hooks/usePersistedUsers";
import { STORAGE_KEYS } from "../constants/storageKeys";

const useLeadUsers = ({ users, leadData, selectedTab }) => {
  const userName = useMemo(() => users.map((u) => u.name), [users]);

  const { selectedUsers, setSelectedUsers } = usePersistedUsers(
    "leads:selected_users",
    userName,
  );

  const [ticketMap, setTicketMap] = useState({});

  useEffect(() => {
    const fetchTicketCounts = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/available-tickets?status=${selectedTab}`,
        );
        if (data) {
          setTicketMap(data.ticketMap || {});
        }
      } catch (err) {
        console.error("Error fetching ticket counts", err);
      }
    };
    fetchTicketCounts();
  }, [selectedTab]);

  const getJobHolderCount = (user, status) => {
    if (user === "All") {
      return leadData.filter((lead) => lead?.status === status)?.length;
    }
    return leadData.filter(
      (lead) => lead?.jobHolder === user && lead?.status === status,
    )?.length;
  };

  const user_leads_count_map = useMemo(
    () =>
      Object.fromEntries(
        userName.map((user) => [user, getJobHolderCount(user, selectedTab)]),
      ),
    // eslint-disable-next-line
    [userName, selectedTab, leadData],
  );

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleUserOnDragEnd = (result) => {
    const items = reorder(
      selectedUsers,
      result.source.index,
      result.destination.index,
    );
    localStorage.setItem(STORAGE_KEYS.USER_ORDER, JSON.stringify(items));
    setSelectedUsers(items);
  };

  return {
    userName,
    selectedUsers,
    setSelectedUsers,
    ticketMap,
    getJobHolderCount,
    user_leads_count_map,
    handleUserOnDragEnd,
  };
};

export default useLeadUsers;
