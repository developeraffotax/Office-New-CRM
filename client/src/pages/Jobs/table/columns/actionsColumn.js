import { Popover, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { FiPlusSquare } from "react-icons/fi";
import { IoTicketOutline } from "react-icons/io5";
import { MdDriveFileMoveOutline } from "react-icons/md";
import { MdInsertComment } from "react-icons/md";
import TicketsPopUp from "../../../../components/shared/TicketsPopUp";
import axios from "axios";
import { MdOutlineFolder } from "react-icons/md";
import toast from "react-hot-toast";
import { PiSpinnerGap } from "react-icons/pi";

export const actionsColumn = ({
  setJobId,
  setIsComment,
  setClientCompanyName,
  setShowNewTicketModal,
  moveJobToLead,
}) => {


  








  
  return {
    id: "Actions",
    accessorKey: "actions",
    header: "Actions",

    Cell: ({ cell, row }) => {
      // related to comments
      //const comments = cell.getValue();

      const [isLoading, setIsLoading] = useState(false)


      const comments = row.original?.comments;
      const [readComments, setReadComments] = useState([]);

      useEffect(() => {
        const filterComments = comments.filter(
          (item) => item.status === "unread"
        );
        setReadComments(filterComments);
        // eslint-disable-next-line
      }, [comments]);

      const [anchorEl, setAnchorEl] = useState(null);

      const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
      };

      const handleClose = () => {
        setAnchorEl(null);
      };

      const open = Boolean(anchorEl);
      const id = open ? "simple-popover" : undefined;



        const openFolder = async (clientName) => {
          setIsLoading(true)
          try {
            const { data } = await axios(
              `${
                process.env.REACT_APP_API_URL
              }/api/v1/onedrive/folder/${encodeURIComponent(clientName)}`
            );

            if (data.url) {
              window.open(data.url, "_blank");
            } else {
              toast.error("No folder found for this client.");
            }
          } catch (err) {
            console.error(err);

            toast.error(err?.response?.data?.message || "Error fetching folder.");
          } finally {
            setIsLoading(false)
          }
        };



      return (
        <div className="flex items-center justify-center gap-3 w-full h-full ">
          <div>
            <span
              title="Open OneDrive Folder"
              onClick={() => {
                openFolder(row?.original?.clientName);
              }}
              className="text-xl text-orange-500 cursor-pointer"
            > 

            {
              isLoading ? <PiSpinnerGap className="animate-spin h-5 w-5 text-orange-600 "  /> :  <MdOutlineFolder className="h-5 w-5 text-orange-600 " />
            }
            
              
            </span>
          </div>

          <div
            title="Comments"
            className="flex items-center justify-center gap-1 w-full h-full"
            onClick={() => {
              setJobId(row.original._id);
              setIsComment(true);
            }}
          >
            <div className="relative">
              <span className="text-[1rem] cursor-pointer relative">
                <MdInsertComment className="h-5 w-5 text-orange-600 " />
              </span>
              {/* {readComments?.length > 0 && (
                  <span className="absolute -top-3 -right-3 bg-green-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
                    {readComments?.length}
                  </span>
                )} */}
            </div>
          </div>

          <div>
            <span
              title="Create New Ticket"
              onClick={() => {
                setClientCompanyName(row?.original?.companyName);
                setShowNewTicketModal(true);
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

          <div
            className="relative"
            title="Move to Lead"
            onClick={() => {
              moveJobToLead(row.original);
            }}
          >
            <span className="text-[1rem] cursor-pointer relative">
              <MdDriveFileMoveOutline className="h-6 w-6 text-orange-600 " />
            </span>
          </div>
        </div>
      );
    },
    size: 180,
  };
};
