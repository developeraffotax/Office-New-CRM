import React, { useState } from "react";
import { AiOutlineEdit, AiTwotoneDelete } from "react-icons/ai";
import { FiPlusSquare } from "react-icons/fi";
import { IoTicketOutline } from "react-icons/io5";
import { Popover, Typography } from "@mui/material";
import TicketsPopUp from "../../components/shared/TicketsPopUp";
 

const ActionsCell = ({
  row,
  setSubscriptionId,
  setShow,
  handleDeleteConfirmation,
  setClientCompanyName,
  setShowNewTicketModal,
}) => {
  const subId = row.original._id;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div className="flex items-center justify-center gap-3 w-full h-full">
      {/* Edit */}
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

      {/* Delete */}
      <span
        className="text-[1rem] cursor-pointer"
        title="Delete Task!"
        onClick={() => handleDeleteConfirmation(subId)}
      >
        <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600" />
      </span>

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
    </div>
  );
};

export default ActionsCell;
