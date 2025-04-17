import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// /api/v1/tickets/all/ticketsByClientName/:clientName
const Tickets = ({ clientName }) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTicketsByName();
  }, []);

  const fetchTicketsByName = async () => {
    setIsLoading(true);

    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/ticketsByClientName/${clientName}`
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
            <div className="w-full px-1">
              <span>{clientName}</span>
            </div>
          );
        },
      },

      {
        accessorKey: "subject",
        minSize: 200,
        maxSize: 500,
        size: 460,
        grow: false,
        header: "Subject",

        Cell: ({ cell, row }) => {
          const subject = row.original.subject;
          return (
            <div className="w-full px-1">
              <span
                onClick={(event) => {
                  if (event.ctrlKey || event.metaKey) {
                    window.open(`/ticket/detail/${row.original._id}`, "_blank");
                  } else {
                    navigate(`/ticket/detail/${row.original._id}`);
                  }
                }}
                className="cursor-pointer text-blue-500 hover:text-blue-600 font-medium"
              >
                {subject}
              </span>
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
    </>
  );
};

export default Tickets;
