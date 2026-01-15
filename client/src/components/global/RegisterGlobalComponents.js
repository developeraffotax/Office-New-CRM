import React from "react";
import { useSelector } from "react-redux";
import TicketModalGlobal from "./TicketModalGlobal";

const RegisterGlobalComponents = () => {
  const { isModalOpen } = useSelector((s) => s.ticketModal);

  return (
    <>
      {isModalOpen && <TicketModalGlobal />}
    </>
  );
};

export default RegisterGlobalComponents;
