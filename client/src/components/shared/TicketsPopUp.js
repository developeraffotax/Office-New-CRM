import { Drawer } from "@mui/material";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailDetailDrawer from "./EmailDetailDrawer";
 
 

// /api/v1/tickets/all/ticketsByClientName/:clientName
const TicketsPopUp = ({ clientName, email, handleClose }) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [ticketId, setTicketId] = useState("")

  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => {
     
    setOpen(newOpen);
  };




  const navigate = useNavigate();

  useEffect(() => {
    fetchTicketsByName();
  }, []);

  const fetchTicketsByName = async () => {
    setIsLoading(true);

    const url = email ? `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/ticketsByClientName?email=${email}` : `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/ticketsByClientName?clientName=${clientName}`

    try {
      const { data } = await axios.get(
        url
      );

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
            <div className="w-full px-1"  >
              <span >{clientName}</span>
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
                  setTicketId(row.original._id)
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

      



    ];

    return arr;
  }, []);

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
      
            <Drawer open={open} onClose={() => {toggleDrawer(false); } } anchor="right"   sx={{zIndex: 1400, '& .MuiDrawer-paper': {
      width: 600, // Set your custom width here (px, %, etc.)
    },}}  >
              
                <div className="  " >

                  <EmailDetailDrawer id={ticketId} toggleDrawer={toggleDrawer} />
                </div>

            </Drawer>

    </>
  );
};

export default TicketsPopUp;
