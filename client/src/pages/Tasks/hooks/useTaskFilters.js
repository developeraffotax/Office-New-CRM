import { useEffect } from "react";
import { getStatus } from "../utils/getStatus";

const useTaskFilters = ({
  tasksData,
  filterId,
  searchValue,
  setFilterData,
  setStateData,
}) => {
  const getJobHolderCount = (user, project) => {
    return tasksData.filter((item) =>
      project === "All"
        ? item?.jobHolder === user
        : item?.jobHolder === user && item?.project?.projectName === project,
    )?.length;
  };

  const getDueAndOverdueCountByDepartment = (project) => {
    const filteredData = tasksData?.filter(
      (item) => item.project?.projectName === project || project === "All",
    );
    const dueCount = filteredData?.filter(
      (item) => getStatus(item.startDate, item.deadline) === "Due",
    )?.length;
    const overdueCount = filteredData?.filter(
      (item) => getStatus(item.startDate, item.deadline) === "Overdue",
    )?.length;
    return { due: dueCount, overdue: overdueCount };
  };

  const getStatusCount = (status, projectName) => {
    return tasksData?.filter((item) =>
      projectName === "All"
        ? item?.status === status
        : item?.status === status && item?.project?.projectName === projectName,
    )?.length;
  };

  const filterByDep = (value) => {
    setFilterData("");
    if (value !== "All") {
      const filteredData = tasksData?.filter(
        (item) =>
          item.project?.projectName === value ||
          item.status === value ||
          item.jobHolder === value ||
          item._id === value,
      );
      setFilterData([...filteredData]);
    }
  };

  const filterByProjStat = (value, proj) => {
    let filteredData = [];
    if (proj === "All") {
      filteredData = tasksData.filter(
        (item) =>
          item.status === value ||
          item.jobHolder === value ||
          getStatus(item.startDate, item.deadline) === value,
      );
    } else {
      filteredData = tasksData?.filter((item) => {
        const jobMatches = item.project?.projectName === proj;
        const statusMatches = item.status === value;
        const holderMatches = item.jobHolder === value;
        return (
          (holderMatches && jobMatches) ||
          (statusMatches && jobMatches) ||
          (jobMatches && getStatus(item.startDate, item.deadline) === value)
        );
      });
    }
    setFilterData([...filteredData]);
  };

  const filterByState = (state) => {
    if (!state) return;
    setStateData("");
    const filteredData = tasksData?.filter((item) => item.status === state);
    setStateData([...filteredData]);
  };

  useEffect(() => {
    if (tasksData && filterId) {
      filterByDep(filterId);
    }
  }, [tasksData, filterId]);

  useEffect(() => {
    if (searchValue) {
      const filteredData = tasksData.filter(
        (item) =>
          item?.task.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.jobHolder.toLowerCase().includes(searchValue.toLowerCase()),
      );
      setFilterData(filteredData);
    } else {
      setFilterData(tasksData);
    }
  }, [searchValue, tasksData]);

  return {
    getJobHolderCount,
    getDueAndOverdueCountByDepartment,
    getStatusCount,
    filterByDep,
    filterByProjStat,
    filterByState,
  };
};

export default useTaskFilters;
