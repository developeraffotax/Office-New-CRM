import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { isAdmin } from "../../../../utlis/isAdmin"; // adjust if your folder depth differs

// Fetches the won-leads series for the current users / date range / view.
export default function useWonLeadsData({
  auth,
  selectedUsers,
  dateRange,
  view,
}) {
  const [categories, setCategories] = useState([]);
  // [{ user, counts, values, targetCounts, targetValues }]
  const [rawSeries, setRawSeries] = useState([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isAdmin(auth) && !selectedUsers.length) return;
    try {
      const [start, end] = dateRange;
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/userchart/won`,
        {
          params: {
            users: selectedUsers.length ? selectedUsers.join(",") : "All",
            startDate: start ? start.toISOString() : null,
            endDate: end ? end.toISOString() : null,
            view,
          },
        },
      );

      setCategories(data.labels);
      setRawSeries(data.series || []);
      setHasLoadedOnce(true);
    } catch (err) {
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUsers, dateRange, view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { categories, rawSeries, hasLoadedOnce };
}