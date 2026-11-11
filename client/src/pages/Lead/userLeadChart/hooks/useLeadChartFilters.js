import { useCallback, useEffect, useMemo, useState } from "react";
import { DATE_FILTER, DEFAULTS } from "../constants";
import { getDateRange, getDefaultUsers } from "../utils";
import { extendRange, getCompareOptions, resolveCompare } from "../rangeHelpers";
import dayjs from "dayjs";

export default function useLeadChartFilters(auth) {
  const [selectedUsers, setSelectedUsers] = useState(() => getDefaultUsers(auth));
  const [dateFilter, setDateFilter] = useState(DEFAULTS.dateFilter);
  const [dateRange, setDateRange] = useState(() => getDateRange(DEFAULTS.dateFilter));
  const [dateBasis, setDateBasis] = useState(DEFAULTS.dateBasis);
  const [compare, setCompare] = useState("none");

  // Re-seed the user selection whenever auth changes
  useEffect(() => {
    setSelectedUsers(getDefaultUsers(auth));
  }, [auth]);

  /* ───────── Compare with ───────── */
  // options depend on the picked range (weeks / months / years)
  const compareOptions = useMemo(() => getCompareOptions(dateRange), [dateRange]);

  // null when the stored value no longer fits the range's unit
  const activeCompare = useMemo(
    () => resolveCompare(dateRange, compare),
    [dateRange, compare],
  );

  // clear a stale selection (e.g. "2 years" after switching to a month range)
  useEffect(() => {
    if (compare !== "none" && !activeCompare) setCompare("none");
  }, [compare, activeCompare]);

  // memoized on purpose: the data hook depends on it
  const effectiveRange = useMemo(
    () => extendRange(dateRange, activeCompare),
    [dateRange, activeCompare],
  );

  /* ───────── Range handlers ───────── */
  const selectQuickRange = useCallback((filter) => {
    setDateFilter(filter);
    setDateRange(getDateRange(filter));
  }, []);

  const changeDateFilter = useCallback((value) => {
    setDateFilter(value);
    setDateRange(value !== DATE_FILTER.CUSTOM ? getDateRange(value) : [null, null]);
  }, []);

  const applyFilters = useCallback(
    ({ dateFilter: df, dateRange: dr, users, dateBasis: db, compare: cmp }) => {
      if (df) setDateFilter(df);
      if (db) setDateBasis(db);
      setCompare(cmp ?? "none");
      setDateRange(
        df && df !== DATE_FILTER.CUSTOM
          ? getDateRange(df)
          : [dr?.start ? dayjs(dr.start) : null, dr?.end ? dayjs(dr.end) : null],
      );
      if (users?.length) setSelectedUsers(users);
    },
    [],
  );

  const reset = useCallback(() => {
    setDateBasis(DEFAULTS.dateBasis);
    setCompare("none");
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
    dateBasis,
    setDateBasis,
    selectQuickRange,
    changeDateFilter,
    applyFilters,
    reset,

    // compare
    compare: activeCompare?.value ?? "none",
    setCompare,
    compareOptions,
    activeCompare,
    effectiveRange,
    compareLabel: activeCompare ? `+${activeCompare.label} earlier` : null,
  };
}