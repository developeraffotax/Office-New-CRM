import { useMemo } from "react";
import { getTaskColumns } from "../table/columns";

export const useTaskColumns = ({
  status,
  actions,
}) => {
  return useMemo(() => {
    return getTaskColumns({
      status,
      ...actions,
    });
  }, [status, actions]);
};