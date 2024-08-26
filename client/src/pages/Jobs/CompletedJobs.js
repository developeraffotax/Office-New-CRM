import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { MdInsertComment } from "react-icons/md";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useAuth } from "../../context/authContext";
import Loader from "../../utlis/Loader";
import Swal from "sweetalert2";
import { IoRemoveCircle } from "react-icons/io5";

export default function CompletedJobs({
  getSingleJobDetail,
  setCompanyName,
  users,
  handleUpdateJobHolder,
  handleUpdateDates,
  getStatus,
  setJobId,
  setIsComment,
  allClientJobData,
}) {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const { auth } = useAuth();

  // ---------------All Client_Job Status(Completed) ----------->
  const allClientJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/jobs/status/complete`
      );
      if (data) {
        setTableData(data.clients);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  useEffect(() => {
    allClientJobs();
    // eslint-disable-next-line
  }, []);

  //   ---------Update Client Status-------

  const handleUpdateClientStatus = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to undo this job!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateClientStatus(id);
        Swal.fire("Updated!", "Your job status successfully!.", "success");
      }
    });
  };
  const updateClientStatus = async (id) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/client/status/${id}`
      );
      if (data) {
        allClientJobData();
        setTableData((prevTableData) =>
          prevTableData.filter((item) => item._id !== id)
        );
        toast.success("Status updated!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  //  --------------Table Columns Data--------->
  const columns = useMemo(
    () => [
      {
        accessorKey: "companyName",
        header: "Company Name",
        size: 170,
        Cell: ({ cell, row }) => {
          const companyName = cell.getValue();

          return (
            <div
              className="cursor-pointer text-sky-500 hover:text-sky-600 w-full h-full"
              onClick={() => {
                getSingleJobDetail(row.original._id);
                setCompanyName(companyName);
              }}
            >
              {companyName}
            </div>
          );
        },
      },
      {
        accessorKey: "clientName",
        header: "Client",
        size: 110,
        minSize: 80,
        maxSize: 150,
        grow: true,
      },
      {
        accessorKey: "job.jobHolder",
        header: "Job Holder",
        Cell: ({ cell, row }) => {
          const jobholder = cell.getValue();

          return (
            <select
              value={jobholder || ""}
              onChange={(e) =>
                handleUpdateJobHolder(row.original._id, e.target.value)
              }
              className="w-[6rem] h-[2rem] rounded-md border border-orange-300 outline-none"
            >
              <option value="">Select</option>
              {users.map((jobHold, i) => (
                <option value={jobHold} key={i}>
                  {jobHold}
                </option>
              ))}
            </select>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((jobhold) => jobhold),
        filterVariant: "select",
        size: 120,
        minSize: 80,
        maxSize: 140,
        grow: true,
      },
      {
        accessorKey: "job.jobName",
        header: "Departments",
        filterFn: "equals",
        filterSelectOptions: [
          "Bookkeeping",
          "Payroll",
          "Vat Return",
          "Personal Tax",
          "Accounts",
          "Company Sec",
          "Address",
        ],
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 140,
        grow: true,
      },
      {
        accessorKey: "totalHours",
        header: "Hours",
        filterFn: "equals",
        size: 50,
      },
      // End  year
      {
        accessorKey: "job.yearEnd",
        header: "Year End",

        Cell: ({ cell, row }) => {
          const [date, setDate] = useState(
            format(new Date(cell.getValue()), "dd-MMM-yyyy")
          );

          const handleDateChange = (newDate) => {
            setDate(newDate);
            handleUpdateDates(row.original._id, newDate, "yearEnd");
          };

          return (
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onBlur={(e) => handleDateChange(e.target.value)}
              className="h-[2rem] w-[6rem] cursor-pointer rounded-md border border-gray-200 outline-none"
            />
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          if (!cellValue) return false;

          const cellDate = new Date(cellValue);
          const today = new Date();

          switch (filterValue) {
            case "Expired":
              return cellDate < today;
            case "Today":
              return cellDate.toDateString() === today.toDateString();
            case "Tomorrow":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              return cellDate.toDateString() === tomorrow.toDateString();
            case "In 7 days":
              const in7Days = new Date(today);
              in7Days.setDate(today.getDate() + 7);
              return cellDate <= in7Days && cellDate > today;
            case "In 15 days":
              const in15Days = new Date(today);
              in15Days.setDate(today.getDate() + 15);
              return cellDate <= in15Days && cellDate > today;
            case "Month Wise":
              return (
                cellDate.getFullYear() === today.getFullYear() &&
                cellDate.getMonth() === today.getMonth()
              );
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Expired",
          "Today",
          "Tomorrow",
          "In 7 days",
          "In 15 days",
          "Month Wise",
        ],
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 140,
        grow: true,
      },
      // Job DeadLine
      {
        accessorKey: "job.jobDeadline",
        header: "Deadline",
        Cell: ({ cell, row }) => {
          const [date, setDate] = useState(
            format(new Date(cell.getValue()), "dd-MMM-yyyy")
          );

          const handleDateChange = (newDate) => {
            setDate(newDate);
            handleUpdateDates(row.original._id, newDate, "jobDeadline");
          };

          return (
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onBlur={(e) => handleDateChange(e.target.value)}
              className=" h-[2rem] w-[6rem]
               cursor-pointer rounded-md border border-gray-200  outline-none"
            />
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          if (!cellValue) return false;

          const cellDate = new Date(cellValue);
          const today = new Date();

          switch (filterValue) {
            case "Expired":
              return cellDate < today;
            case "Today":
              return cellDate.toDateString() === today.toDateString();
            case "Tomorrow":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              return cellDate.toDateString() === tomorrow.toDateString();
            case "In 7 days":
              const in7Days = new Date(today);
              in7Days.setDate(today.getDate() + 7);
              return cellDate <= in7Days && cellDate > today;
            case "In 15 days":
              const in15Days = new Date(today);
              in15Days.setDate(today.getDate() + 15);
              return cellDate <= in15Days && cellDate > today;
            case "Month Wise":
              return (
                cellDate.getFullYear() === today.getFullYear() &&
                cellDate.getMonth() === today.getMonth()
              );
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Expired",
          "Today",
          "Tomorrow",
          "In 7 days",
          "In 15 days",
          "Month Wise",
        ],
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 140,
        grow: true,
      },
      //  Current Date
      {
        accessorKey: "currentDate",
        header: "Job Date",
        Cell: ({ cell, row }) => {
          const [date, setDate] = useState(
            format(new Date(cell.getValue()), "dd-MMM-yyyy")
          );

          const handleDateChange = (newDate) => {
            setDate(newDate);
            handleUpdateDates(row.original._id, newDate, "currentDate");
          };

          return (
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onBlur={(e) => handleDateChange(e.target.value)}
              className=" h-[2rem] w-[6rem]
               cursor-pointer rounded-md border border-gray-200  outline-none"
            />
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          if (!cellValue) return false;

          const cellDate = new Date(cellValue);
          const today = new Date();

          switch (filterValue) {
            case "Expired":
              return cellDate < today;
            case "Today":
              return cellDate.toDateString() === today.toDateString();
            case "Tomorrow":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              return cellDate.toDateString() === tomorrow.toDateString();
            case "In 7 days":
              const in7Days = new Date(today);
              in7Days.setDate(today.getDate() + 7);
              return cellDate <= in7Days && cellDate > today;
            case "In 15 days":
              const in15Days = new Date(today);
              in15Days.setDate(today.getDate() + 15);
              return cellDate <= in15Days && cellDate > today;
            case "Month Wise":
              return (
                cellDate.getFullYear() === today.getFullYear() &&
                cellDate.getMonth() === today.getMonth()
              );
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Expired",
          "Today",
          "Tomorrow",
          "In 7 days",
          "In 15 days",
          "Month Wise",
        ],
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 140,
        grow: true,
      },
      //  -----Due & Over Due Status----->
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ row }) => {
          const status = getStatus(
            row.original.job.jobDeadline,
            row.original.job.yearEnd
          );

          return (
            <span
              className={`text-white px-4  rounded-[2rem] ${
                status === "Due"
                  ? "bg-green-500  py-[6px] "
                  : status === "Overdue"
                  ? "bg-red-500  py-[6px] "
                  : "bg-transparent"
              }`}
            >
              {status}
            </span>
          );
        },
        filterFn: (row, id, filterValue) => {
          const status = getStatus(
            row.original.job.jobDeadline,
            row.original.job.yearEnd
          );
          if (status === undefined || status === null) return false;
          return status.toString().toLowerCase() === filterValue.toLowerCase();
        },
        filterSelectOptions: ["Overdue", "Due"],
        filterVariant: "select",
        size: 100,
        minSize: 100,
        maxSize: 120,
        grow: true,
      },
      //
      {
        accessorKey: "job.jobStatus",
        header: "Job Status",
        Cell: ({ cell, row }) => {
          const statusValue = cell.getValue();

          return (
            <select
              value={statusValue}
              //   onChange={(e) =>
              //     handleStatusChange(row.original._id, e.target.value)
              //   }
              className="w-[6rem] h-[2rem] rounded-md border border-sky-300 outline-none"
            >
              <option value="">Select</option>
              <option value="Data">Data</option>
              <option value="Progress">Progress</option>
              <option value="Queries">Queries</option>
              <option value="Approval">Approval</option>
              <option value="Submission">Submission</option>
              <option value="Billing">Billing</option>
              <option value="Feedback">Feedback</option>
            </select>
          );
        },
        filterFn: "equals",
        filterSelectOptions: [
          "Select",
          "Data",
          "Progress",
          "Queries",
          "Approval",
          "Submission",
          "Billing",
          "Feedback",
        ],
        filterVariant: "select",
        size: 110,
      },
      {
        accessorKey: "job.lead",
        header: "Lead",
        Cell: ({ cell, row }) => {
          const leadValue = cell.getValue(); // Get the current lead value for the row

          return (
            <select
              value={leadValue || ""}
              //   onChange={(e) =>
              //     handleUpdateLead(row.original._id, e.target.value)
              //   }
              className="w-[6rem] h-[2rem] rounded-md border-none bg-transparent outline-none"
            >
              <option value="">Select</option>
              {users.map((lead, i) => (
                <option value={lead} key={i}>
                  {lead}
                </option>
              ))}
            </select>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((lead) => lead),
        filterVariant: "select",
        size: 110,
        minSize: 100,
        maxSize: 140,
        grow: true,
      },
      {
        accessorKey: "totalTime",
        header: "Est. Time",
        Cell: ({ cell, row }) => {
          const statusValue = cell.getValue();
          return (
            <div className="flex items-center gap-1">
              <span className="text-[1rem]">⏳</span>
              <span>{statusValue}</span>
            </div>
          );
        },
        size: 90,
      },

      {
        accessorKey: "comments",
        header: "Comments",
        Cell: ({ cell, row }) => {
          const comments = cell.getValue();

          return (
            <div
              className="flex items-center justify-center gap-1 w-full h-full"
              onClick={() => {
                setJobId(row.original._id);
                setIsComment(true);
              }}
            >
              <span className="text-[1rem] cursor-pointer">
                <MdInsertComment className="h-5 w-5 text-orange-600 " />
              </span>
              <span>({comments?.length})</span>
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "complete",
        header: "Actions",
        Cell: ({ cell, row }) => {
          return (
            <div
              className="flex items-center justify-center gap-1 w-full h-full"
              onClick={() => {
                handleUpdateClientStatus(row.original._id);
              }}
            >
              <span className="text-[1rem] cursor-pointer">
                <IoRemoveCircle className="h-5 w-5 text-red-500 hover:text-red-600" />
              </span>
            </div>
          );
        },
        size: 100,
      },
    ],
    // eslint-disable-next-line
    [users, auth]
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    // enableRowSelection: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    columnFilterDisplayMode: "popover",
    muiTableContainerProps: { sx: { maxHeight: "700px" } },
    enableColumnActions: false,
    enableColumnFilters: true,
    enableSorting: true,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    // enableEditing: true,
    // state: { isLoading: loading },

    enablePagination: true,
    initialState: {
      pagination: { pageSize: 20 },
      pageSize: 20,
      density: "compact",
    },

    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "15px",
        backgroundColor: "#f0f0f0",
        color: "#000",
        padding: ".7rem 0.3rem",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        border: "1px solid rgba(203, 201, 201, 0.5)",
      },
    },
    muiTableProps: {
      sx: {
        "& .MuiTableHead-root": {
          backgroundColor: "#f0f0f0",
        },
        tableLayout: "auto",
        fontSize: "14px",
        border: "1px solid rgba(81, 81, 81, .5)",
        caption: {
          captionSide: "top",
        },
      },
    },
  });

  return (
    <div className="w-full min-h-screen overflow-hidden">
      {loading ? (
        <Loader />
      ) : (
        <div className="h-full hidden1 overflow-y-scroll relative ">
          <MaterialReactTable table={table} />
        </div>
      )}
    </div>
  );
}
