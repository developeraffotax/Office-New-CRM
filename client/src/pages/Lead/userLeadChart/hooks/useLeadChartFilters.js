import { useCallback, useEffect, useState } from "react";
import { DATE_FILTER, DEFAULTS } from "../constants";
import { getDateRange, getDefaultUsers } from "../utils";

export default function useLeadChartFilters(auth) {
  const [selectedUsers, setSelectedUsers] = useState(() => getDefaultUsers(auth));
  const [dateFilter, setDateFilter] = useState(DEFAULTS.dateFilter);
  const [dateRange, setDateRange] = useState(() => getDateRange(DEFAULTS.dateFilter));

  // Re-seed the user selection whenever auth changes
  useEffect(() => {
    setSelectedUsers(getDefaultUsers(auth));
  }, [auth]);

  const selectQuickRange = useCallback((filter) => {
    setDateFilter(filter);
    setDateRange(getDateRange(filter));
  }, []);

  const changeDateFilter = useCallback((value) => {
    setDateFilter(value);
    setDateRange(value !== DATE_FILTER.CUSTOM ? getDateRange(value) : [null, null]);
  }, []);

  const reset = useCallback(() => {
    setDateFilter(DEFAULTS.dateFilter);
    setDateRange(getDateRange(DEFAULTS.dateFilter));
    setSelectedUsers(getDefaultUsers(auth));
  }, [auth]);

  return {
    selectedUsers,
    setSelectedUsers,
    dateFilter,
    dateRange,
    setDateRange,
    selectQuickRange,
    changeDateFilter,
    reset,
  };
}