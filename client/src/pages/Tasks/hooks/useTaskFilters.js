import { useMemo } from "react";

export const useTaskFilters = (columnFilters) => {
  const jobHolderFilter = useMemo(() => {
    return columnFilters.find((f) => f.id === "jobHolder")?.value || null;
  }, [columnFilters]);

  const departmentFilter = useMemo(() => {
    return columnFilters.find((f) => f.id === "departmentName")?.value || null;
  }, [columnFilters]);

  const taskStatusFilter = useMemo(() => {
    return columnFilters.find((f) => f.id === "taskStatus")?.value || null;
  }, [columnFilters]);

  const dueStatusFilter = useMemo(() => {
    return columnFilters.find((f) => f.id === "datestatus")?.value || null;
  }, [columnFilters]);

  return {
    jobHolderFilter,
    departmentFilter,
    taskStatusFilter,
    dueStatusFilter,
  };
};