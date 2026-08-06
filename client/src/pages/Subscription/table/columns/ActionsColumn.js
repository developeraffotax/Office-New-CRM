import React from "react";
import ActionsCell from "../../ActionsCell";

export const createActionsColumn = ({ auth, setSubscriptionId, setShow, handleDeleteConfirmation, setClientCompanyName, setShowNewTicketModal, handleMarkInProgress, handleMarkCompleted, handleCopySubscription }) => (
  
   {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ row }) => (
          <ActionsCell
            row={row}
            auth={auth}
            setSubscriptionId={setSubscriptionId}
            setShow={setShow}
            handleDeleteConfirmation={handleDeleteConfirmation}
            setClientCompanyName={setClientCompanyName}
            setShowNewTicketModal={setShowNewTicketModal}
            handleMarkInProgress={handleMarkInProgress}
            handleMarkCompleted={handleMarkCompleted}
            handleCopySubscription={handleCopySubscription}
          />
        ),
        size: 200,
      }
     
);

export default createActionsColumn;


