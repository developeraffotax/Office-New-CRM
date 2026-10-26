import React from "react";
import { useIsMobile } from "./hooks/useIsMobile";
import { useAllTasksController } from "./hooks/useAllTasksController";
import AllTasksDesktop from "./AllTasksDesktop";
import AllTasksMobile from "./AllTasksMobile";
import AllTasksModals from "./AllTasksModals";

const AllTasks = () => {
  const isMobile = useIsMobile(1024);
  const c = useAllTasksController();

  return (
    <>
      {isMobile ? <AllTasksMobile c={c} /> : <AllTasksDesktop c={c} />}
      <AllTasksModals c={c} isMobile={isMobile} />
    </>
  );
};

export default AllTasks;