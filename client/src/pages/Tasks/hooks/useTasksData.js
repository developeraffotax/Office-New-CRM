import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { buildFilters } from "../utils";

export const useTasksData = ({
  pagination,
  status,
  searchValue,
  columnFilters,
}) => {
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const getTasks = useCallback(async () => {
    setLoading(true);

    try {
      const filters = buildFilters(columnFilters);

      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        status,
        search: searchValue || "",
        ...filters,
      };

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks`,
        { params }
      );

      if (data?.success) {
        setTasksData(data.tasks || []);
        setRowCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [pagination, status, searchValue, columnFilters]);

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  return {
    tasksData,
    setTasksData,
    loading,
    rowCount,
    refetchTasks: getTasks,
  };
};