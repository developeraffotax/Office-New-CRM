import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { isAdmin } from "../../../../utlis/isAdmin";

// Fetches the jobs prepared/reviewed/filed series.
export default function useJobsData({
  auth,
  selectedUsers,
  dateRange,
  view,
  metric,
  dateBasis,
}) {
  const [categories, setCategories] = useState([]);
  // [{ user, counts, targetCounts }]
  const [rawSeries, setRawSeries] = useState([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const requestId = useRef(0);

  const fetchData = useCallback(async () => {
    if (!isAdmin(auth) && !selectedUsers.length) return;
    const myRequest = ++requestId.current;
    try {
      const [start, end] = dateRange;
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/userchart/jobs`, // adjust prefix
        {
          params: {
            users: selectedUsers.length ? selectedUsers.join(",") : "All",
            startDate: start ? start.toISOString() : null,
            endDate: end ? end.toISOString() : null,
            view,
            metric,
            dateBasis,
          },
        },
      );

      // ignore stale responses when metric/filters change quickly
      if (myRequest !== requestId.current) return;

      setCategories(data.labels);
      setRawSeries(data.series || []);
      setHasLoadedOnce(true);
    } catch (err) {
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUsers, dateRange, view, metric, dateBasis]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { categories, rawSeries, hasLoadedOnce };
}