import { Popover, Typography, Box, Tooltip} from "@mui/material";
import { IoTicketOutline } from "react-icons/io5";
import TicketsPopUp from "../../components/shared/TicketsPopUp";
import { GrCopy } from "react-icons/gr";
import { RiProgress3Line } from "react-icons/ri";
import { FaTrophy } from "react-icons/fa";
import { GiBrokenHeart } from "react-icons/gi";
import { AiTwotoneDelete } from "react-icons/ai";
import { useState } from "react";
import { FiPlusSquare } from "react-icons/fi";


 
import { FiMoreHorizontal } from "react-icons/fi"; // modern icon

export const ActionsCell = ({ row, setClientCompanyName, setClientEmail, setShowNewTicketModal, handleCopyLead, handleLeadStatus, handleDeleteLeadConfirmation,  selectedTab, setClientName, setCompanyName  }) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div className="flex items-center justify-center gap-4 w-full h-full">
      <div>
        <span
          title="Create New Ticket"
          onClick={() => {
            setClientCompanyName(row?.original?.companyName);
            setClientEmail(row?.original?.email);
            setShowNewTicketModal(true);

            if(row?.original?.email) {
              setClientName(row?.original?.clientName);
              setCompanyName(row?.original?.companyName)
            }
          }}
          className="text-xl text-orange-500 cursor-pointer"
        >
          {" "}
          <FiPlusSquare />
        </span>
      </div>
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
          // transformOrigin={{
          //   vertical: 'bottom',
          //   horizontal: 'left',
          // }}
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
            Tickets for this Lead
          </Typography>

          <div>
            <TicketsPopUp
              clientName={row?.original?.clientName}
              email={row?.original?.email}
              handleClose={handleClose}
            />
          </div>
        </Popover>
      </div>

      <span
        className="text-[1rem] cursor-pointer"
        onClick={() => {
          handleCopyLead({
            jobHolder: row.original.jobHolder,
            department: row.original.department,
            source: row.original.source,
            brand: row.original.brand,
            lead_Source: row.original.lead_Source,
            followUpDate: row.original.followUpDate,
            JobDate: row.original.JobDate,
            stage: row.original.stage,
          });
        }}
        title="Copy Lead"
      >
        <GrCopy className="h-5 w-5 text-cyan-500 hover:text-cyan-600 " />
      </span>
      {selectedTab === "won" ? (
        <span
          className=""
          title="Progress Lead"
          onClick={() => {
            handleLeadStatus(row.original._id, "progress");
          }}
        >
          <RiProgress3Line className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
        </span>
      ) : (
        <span
          className=""
          title="Won Lead"
          onClick={() => {
            handleLeadStatus(row.original._id, "won");
          }}
        >
          <FaTrophy className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
        </span>
      )}
      {selectedTab === "lost" ? (
        <div className="flex items-center gap-2">
          <span
            className=""
            title="Progress Lead"
            onClick={() => {
              handleLeadStatus(row.original._id, "progress");
            }}
          >
            <RiProgress3Line className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
          </span>
        </div>
      ) : (
        <span
          className=""
          title="Lost Lead"
          onClick={() => {
            handleLeadStatus(row.original._id, "lost");
          }}
        >
          <GiBrokenHeart className="h-6 w-6 cursor-pointer text-red-500 hover:text-red-600" />
        </span>
      )}

      <span
        className="text-[1rem] cursor-pointer"
        onClick={() => handleDeleteLeadConfirmation(row.original._id)}
        title="Delete Lead!"
      >
        <AiTwotoneDelete className="h-5 w-5 text-pink-500 hover:text-pink-600 " />
      </span>
    </div>
  );
};





 