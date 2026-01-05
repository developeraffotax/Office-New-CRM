import { Drawer } from "@mui/material";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import EmailDetailDrawer from "../../pages/Tickets/EmailDetailDrawer";
import ActivityLogDrawer from "../Modals/ActivityLogDrawer";
import DetailComments from "../../pages/Tasks/TaskDetailComments";
import toast from "react-hot-toast";

const API_URL = `${process.env.REACT_APP_API_URL}`;

const GET_USERS_URL = `${API_URL}/api/v1/user/get_all/users`;
const UPDATE_TICKET_URL = `${API_URL}/api/v1/tickets/update/ticket`;



// /api/v1/tickets/all/ticketsByClientName/:clientName
const TicketsPopUp = ({ clientName, email, handleClose, selectedTab }) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [ticketId, setTicketId] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [open, setOpen] = React.useState(false);

  const [users, setUsers] = useState([]);

  const toggleDrawer = (newOpen) => {
    setOpen(newOpen);
  };

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(`${GET_USERS_URL}`);
      setUsers(
        data?.users
          ?.filter((user) =>
            user.role?.access?.some((item) =>
              item?.permission?.includes("Tickets")
            )
          )
          .map((user) => user.name) || // <-- only take the name
          []
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);
   

  const updateJobHolder = async (ticketId, jobHolder) => {
    try {
      const { data } = await axios.put(`${UPDATE_TICKET_URL}/${ticketId}`, {
        jobHolder,
      });

      if (data) {
        // update UI instantly
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? { ...t, jobHolder } : t))
        );

        toast.success("Job holder updated successfully");
      }
    } catch (error) {
      console.error("Failed to update job holder", error);
    }
  };

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const isReplyModalOpenCb = (isOpen) => {
    setIsReplyModalOpen(isOpen);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key shortcut
      if (e.key === "Escape") {
        if (!isReplyModalOpen) {
          toggleDrawer(false);
          setTicketId("");
          setTicketSubject("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReplyModalOpen]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTicketsByName();
  }, []);

  const fetchTicketsByName = async () => {
    setIsLoading(true);

    let state = "progress";
    if (selectedTab) {
      state = selectedTab;
    }
    const url = email
      ? `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/ticketsByClientName?email=${email}&state=${state}`
      : `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/ticketsByClientName?clientName=${clientName}&state=${state}`;

    try {
      const { data } = await axios.get(url);

      if (data) {
        setTickets(data?.emails);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(() => {
    const arr = [
      {
        accessorKey: "companyName",
        minSize: 100,
        maxSize: 300,
        size: 200,
        grow: false,
        header: "Company Name",

        Cell: ({ cell, row }) => {
          const companyName = row.original.companyName;
          return (
            <div className="w-full px-1">
              <span>{companyName}</span>
            </div>
          );
        },
      },

      {
        accessorKey: "clientName",
        minSize: 100,
        maxSize: 200,
        size: 160,
        grow: false,
        header: "Client Name",

        Cell: ({ cell, row }) => {
          const clientName = row.original.clientName;
          return (
            <div className="w-full px-1">
              <span>{clientName}</span>
            </div>
          );
        },
      },

      

      {
        accessorKey: "subject",
        minSize: 200,
        maxSize: 400,
        size: 360,
        grow: false,
        header: "Subject",

        Cell: ({ cell, row }) => {
          const subject = row.original.subject;
          return (
            <div className="w-full px-1">
              <span
                onClick={() => {
                  toggleDrawer(true);
                  setTicketId(row.original._id);
                }}
                className="cursor-pointer text-blue-500 hover:text-blue-600 font-medium"
              >
                {subject}
              </span>
            </div>
          );
        },
      },

      {
        accessorKey: "received",
        minSize: 50,
        maxSize: 50,
        size: 50,
        grow: false,
        header: "Received",

        Cell: ({ cell, row }) => {
          const received = row.original.received;
          return (
            <div className="w-full px-1">
              <button
                onClick={() => {
                  toggleDrawer(true);
                  setTicketId(row.original._id);
                }}
                className="inline-flex items-center justify-center text-sm font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 transition rounded-full w-8 h-8 cursor-pointer shadow-sm"
                title="View Received Emails"
              >
                {received}
              </button>
            </div>
          );
        },
      },

      {
        accessorKey: "sent",
        minSize: 50,
        maxSize: 50,
        size: 50,
        grow: false,
        header: "Sent",

        Cell: ({ cell, row }) => {
          const sent = row.original.sent;
          return (
            <div className="w-full px-1">
              <button
                onClick={() => {
                  toggleDrawer(true);
                  setTicketId(row.original._id);
                }}
                className="inline-flex items-center justify-center text-sm font-semibold text-orange-600 bg-orange-100 hover:bg-orange-200 transition rounded-full w-8 h-8 cursor-pointer shadow-sm"
                title="View Sent Emails"
              >
                {sent}
              </button>
            </div>
          );
        },
      },


      {
        accessorKey: "jobHolder",
        header: "Job Holder",
        size: 140,

        Cell: ({ row }) => {
          const ticketId = row.original._id;
          const value = row.original.jobHolder || "";
           
          return (
            <select
              value={value}
              onChange={(e) => updateJobHolder(ticketId, e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value=""  >
                Select Job Holder
              </option>
              {users.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          );
        },
      },



    ];

    return arr;
  }, [users]);

  const table = useMaterialReactTable({
    columns: columns,

    data: tickets || [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    getRowId: (row) => row._id,
    enableRowNumbers: true,
    enableKeyboardShortcuts: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: false,

    state: {
      isLoading: isLoading,
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />

      {/* <Drawer open={open} onClose={() => {toggleDrawer(false); } } anchor="right"   sx={{zIndex: 1400, '& .MuiDrawer-paper': {
      width: 600, // Set your custom width here (px, %, etc.)
    },}}  >
              
                <div className="  " >

                  <EmailDetailDrawer id={ticketId} toggleDrawer={toggleDrawer} />
                </div>

            </Drawer> */}

      {open && (
        <div className="fixed inset-0 z-[499] flex items-center justify-center bg-black/30 backdrop-blur-sm  h-full     ">
          <div className="h-[95%] bg-gray-100 rounded-xl shadow-lg w-[95%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[70%] 3xl:w-[60%]    py-4 px-5   ">
            <div className="h-full w-full flex flex-col justify-start items-center relative">
              <div className="flex items-center justify-between border-b pb-2 mb-3 self-start w-full">
                <h3 className="text-lg font-semibold">
                  Ticket: {ticketSubject ? ticketSubject : "Loading..."}
                </h3>
                <button
                  className="p-1 rounded-2xl bg-gray-50 border hover:shadow-md hover:bg-gray-100"
                  onClick={() => {
                    toggleDrawer(false);
                    setTicketId("");
                    setTicketSubject("");
                  }}
                >
                  <IoClose className="h-5 w-5" />
                </button>
              </div>

              {ticketId ? (
                <div className=" w-full h-full flex justify-center items-center gap-8 px-8 py-4 overflow-hidden ">
                  <EmailDetailDrawer
                    id={ticketId}
                    setTicketSubject={setTicketSubject}
                    isReplyModalOpenCb={isReplyModalOpenCb}
                  />

                  <div className="w-full h-full flex flex-col justify-start items-start gap-5 ">
                    <div className="max-w-lg w-full h-[50%] px-3">
                      <ActivityLogDrawer ticketId={ticketId} />
                    </div>

                    <div className="max-w-lg w-full  h-[50%]">
                      <DetailComments
                        type={"ticket"}
                        jobId={ticketId}
                        getTasks1={() => {}}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">Loading ticket...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketsPopUp;
