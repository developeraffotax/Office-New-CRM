import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { isAdmin } from "../../../../utlis/isAdmin"; // adjust if your folder depth differs

// Fetches the won-leads series for the current users / date range / view.
export default function useWonLeadsData({
  auth,
  selectedUsers,
  dateRange,
  view,
  dateBasis,
}) {
  // One state object so labels + series + the key they belong to update together
  const [result, setResult] = useState({
    categories: [],
    rawSeries: [],
    key: null, // the request key this data was loaded for
  });
  const requestId = useRef(0);

  const [start, end] = dateRange;
  const startISO = start ? start.toISOString() : null;
  const endISO = end ? end.toISOString() : null;

  const enabled = isAdmin(auth) || selectedUsers.length > 0;

  // Changes the moment any input changes (same render), not one effect later
  const requestKey = useMemo(
    () => JSON.stringify([selectedUsers, startISO, endISO, view, dateBasis]),
    [selectedUsers, startISO, endISO, view, dateBasis],
  );

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    const id = ++requestId.current;
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/userchart/won`,
        {
          params: {
            users: selectedUsers.length ? selectedUsers.join(",") : "All",
            startDate: startISO,
            endDate: endISO,
            view,
            dateBasis,
          },
        },
      );

      // a newer request has started; drop this (stale) response
      if (id !== requestId.current) return;

      setResult({
        categories: data.labels,
        rawSeries: data.series || [],
        key: requestKey,
      });
    } catch (err) {
      console.error(err);
      // stop the skeleton on error, keep whatever data we had
      if (id === requestId.current) {
        setResult((prev) => ({ ...prev, key: requestKey }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    categories: result.categories,
    rawSeries: result.rawSeries,
    hasLoadedOnce: result.key !== null,
    isLoading: enabled && result.key !== requestKey,
  };
}