import React from "react";
import { useSelector } from "react-redux";
import {TicketModalGlobal} from "./TicketModalGlobal";
import { JobModalGlobal } from "./JobModalGlobal";
import { TaskModalGlobal } from "./TaskModalGlobal";
 

const RegisterGlobalComponents = () => {
  const { activeModal, modalData } = useSelector(
    (s) => s.globalModal
  );

  return (
    <>
      {activeModal === "ticket" && (
        <TicketModalGlobal ticketId={modalData?.ticketId} />
      )}

      {activeModal === "job" && (
        <JobModalGlobal clientId={modalData?.clientId} />
      )}

      {activeModal === "task" && (
        <TaskModalGlobal taskId={modalData?.taskId} />
      )}
    </>
  );
};

export default RegisterGlobalComponents;
