import React from "react";
import ActionsCell from "../../ActionsCell";

export const createActionsColumn = ({ auth, setSubscriptionId, setShow, handleDeleteConfirmation, setClientCompanyName, setShowNewTicketModal }) => (
  auth?.user?.role?.name === "Admin"
    ? {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ row }) => (
          <ActionsCell
            row={row}
            setSubscriptionId={setSubscriptionId}
            setShow={setShow}
            handleDeleteConfirmation={handleDeleteConfirmation}
            setClientCompanyName={setClientCompanyName}
            setShowNewTicketModal={setShowNewTicketModal}
          />
        ),
        size: 160,
      }
    : null
);

export default createActionsColumn;


