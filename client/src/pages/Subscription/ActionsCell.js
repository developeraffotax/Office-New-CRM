import React, { useState } from "react";
import { AiOutlineEdit, AiTwotoneDelete } from "react-icons/ai";
import { FiPlusSquare } from "react-icons/fi";
import {
  IoTicketOutline,
  IoCheckmarkDoneOutline,
  IoPlayOutline,
  IoCopyOutline,
  IoArrowUndoCircle
} from "react-icons/io5";
import { Popover, Typography } from "@mui/material";
import TicketsPopUp from "../../components/shared/TicketsPopUp";
import { useMemo } from "react";
import { hasSubrole } from "../../utlis/checkPermission";
import { FaUndo } from "react-icons/fa";
import { FaRegCircleCheck } from "react-icons/fa6";

const ActionsCell = ({
  auth,
  row,
  setSubscriptionId,
  setShow,
  handleDeleteConfirmation,
  setClientCompanyName,
  setShowNewTicketModal,
  handleMarkInProgress,
  handleMarkCompleted,
  handleCopySubscription,
}) => {
  const subId = row.original._id;
  const progressStatus = row.original.progressStatus;
  const [anchorEl, setAnchorEl] = useState(null);

  const scope = useMemo(() => {
    return {
      copy: hasSubrole(auth?.user, "Subscription", "Copy") || false,
      edit: hasSubrole(auth?.user, "Subscription", "Edit") || false,
      delete: hasSubrole(auth?.user, "Subscription", "Delete") || false,
      markCompleted:
        hasSubrole(auth?.user, "Subscription", "Mark Completed") || false,
      markInProgress:
        hasSubrole(auth?.user, "Subscription", "Mark In-Progress") || false,
    };
  }, [auth]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div className="flex items-center justify-center gap-2 w-full h-full">
      {/* Copy Subscription */}
      {scope.copy && (
        <span
          className="text-[1rem] cursor-pointer"
          title="Copy Subscription"
          onClick={() => handleCopySubscription(subId)}
        >
          <IoCopyOutline className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </span>
      )}

      {/* Create New Ticket */}
      <span
        title="Create New Ticket"
        onClick={() => {
          setClientCompanyName(row?.original?.companyName);
          setShowNewTicketModal(true);
        }}
        className="text-xl text-orange-500 cursor-pointer"
      >
        <FiPlusSquare />
      </span>

      {/* Ticket Popover */}
      <div>
        <span
          title="Ticket"
          onClick={handleClick}
          id={id}
          className="text-2xl text-orange-500 cursor-pointer"
        >
          <IoTicketOutline />
        </span>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Typography
            sx={{
              p: 2,
              background: "#5F9EA0",
              width: "100%",
              textAlign: "center",
              fontFamily: "sans-serif",
              fontSize: "1.2rem",
              color: "whitesmoke",
            }}
          >
            Tickets for this Job
          </Typography>

          <div>
            <TicketsPopUp
              clientName={row?.original?.clientName}
              handleClose={handleClose}
            />
          </div>
        </Popover>
      </div>

      {/* Edit */}
      {scope.edit && (
        <span
          className="text-[1rem] cursor-pointer"
          title="Edit this column"
          onClick={() => {
            setSubscriptionId(subId);
            setShow(true);
          }}
        >
          <AiOutlineEdit className="h-5 w-5 text-cyan-600" />
        </span>
      )}

      {/* Delete */}
      {scope.delete && (
        <span
          className="text-[1rem] cursor-pointer"
          title="Delete Task!"
          onClick={() => handleDeleteConfirmation(subId)}
        >
          <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600" />
        </span>
      )}

      {scope.markInProgress && progressStatus === "completed" && (
        <span
          className="text-[1rem] cursor-pointer"
          title="Mark as In Progress"
          onClick={() => handleMarkInProgress(subId)}
        >
          <FaUndo className="h-4 w-4 text-gray-500 hover:text-gray-600" />
        </span>
      )}

      {scope.markCompleted && progressStatus === "in_progress" && (
        <span
          className="text-[1rem] cursor-pointer"
          title="Mark as Completed"
          onClick={() => handleMarkCompleted(subId)}
        >
          <FaRegCircleCheck className="h-5 w-5 text-green-600 hover:text-green-700" />
        </span>
      )}
    </div>
  );
};

export default ActionsCell;
