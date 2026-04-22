import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { buildFilters } from "../utils";

export const useTaskStats = ({ status, columnFilters }) => {
  const [taskStats, setTaskStats] = useState(null);

  
    const getuserTaskCounts = (userName) => {
       
      return (
        taskStats?.userStats?.find((u) => u.userId === userName)?.totalTasks || 0
      );
    };
  
    const getdepartmentTaskCounts = (departId) => {
      
      return (
        taskStats?.departmentStats?.find((u) => u.departmentId === departId)
          ?.totalTasks || 0
      );
    };
  
    const getTaskStatusTaskCounts = (taskStatus) => {
      return (
        taskStats?.statusStats?.find((u) => u._id === taskStatus)?.totalTasks || 0
      );
    };
  
    const getdueStatusCounts = (dueStatus) => {
      return (
        taskStats?.dueStats?.find((u) => u._id === dueStatus)?.totalTasks || 0
      );
    };



  const getStats = useCallback(async () => {
    try {
      const filters = buildFilters(columnFilters);

      const params = {
        status,
        jobName: filters?.jobName,
      };

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/stats`,
        { params }
      );

      if (data?.success) {
        setTaskStats(data.stats);
      }
    } catch (err) {
      console.log(err);
    }
  }, [status, columnFilters]);

  useEffect(() => {
    getStats();
  }, [getStats]);

  return {
    taskStats,
    refetchStats: getStats,

    getuserTaskCounts,
    getdepartmentTaskCounts,
    getTaskStatusTaskCounts,
    getdueStatusCounts,

  };
};