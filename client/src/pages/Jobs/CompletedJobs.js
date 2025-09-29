import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { MdInsertComment } from "react-icons/md";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
 
import Loader from "../../utlis/Loader";
import Swal from "sweetalert2";
import { IoRemoveCircle } from "react-icons/io5";
import { useSelector } from "react-redux";

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
 
     const auth = useSelector((state => state.auth.auth));
  const [labelData, setLabelData] = useState([]);
  const isInitialRender = useRef(true);

  // ---------------All Client_Job Status(Completed) ----------->
  const allClientJobs = async () => {
    if (isInitialRender.current) {
      setLoading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/jobs/status/complete`
      );
      if (data) {
        setTableData(data.clients);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    } finally {
      if (isInitialRender.current) {
        setLoading(false);
        isInitialRender.current = false;
      }
    }
  };

  useEffect(() => {
    allClientJobs();
    // eslint-disable-next-line
  }, []);

  //   Get All Labels
  const getlabel = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/get/labels`
      );
      if (data) {
        setLabelData(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getlabel();
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

  // Update Users (Prepared | Viewed | Filed)
  const handleUpdateUser = async (jobId, prepared, review, filed) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/job/users/${jobId}`,
        {
          prepared,
          review,
          filed,
        }
      );

      if (data) {
        allClientJobs();
        const updatedJob = data.clientJob;
        setTableData((prevData) =>
          prevData.map((job) => (job._id === jobId ? updatedJob : job))
        );

        toast.success("Job updated successfully.");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };
  // -----------Handle Custom date filter------
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1)?.toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  //  --------------Table Columns Data--------->
  const columns = useMemo(
    () => [
      {
        accessorKey: "companyName",
        minSize: 190,
        maxSize: 300,
        size: 230,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Company Name
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const companyName = cell.getValue();

          return (
            <div
              className="cursor-pointer text-[#0078c8] hover:text-[#0053c8] w-full h-full"
              onClick={() => {
                getSingleJobDetail(row.original._id);
                setCompanyName(companyName);
              }}
            >
              {companyName}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.startsWith(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "clientName",
        header: "Client",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Client
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.startsWith(filterValue.toLowerCase());
        },
        size: 120,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },

      {
        accessorKey: "job.jobHolder",
        Header: ({ column }) => {
          const user = auth?.user?.name;
            useEffect(() => {
              if(user) {
                  column.setFilterValue(user);
              }
                }, []);
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Job Holder
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {users?.map((jobhold, i) => (
                  <option key={i} value={jobhold}>
                    {jobhold}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = cell.getValue();

          return (
            <div className="w-full flex items-center justify-center">
              <select
                value={jobholder || ""}
                onChange={(e) =>
                  handleUpdateJobHolder(row.original._id, e.target.value)
                }
                className="w-full h-[2rem] rounded-md border-none outline-none"
              >
                <option value="empty"></option>
                {users.map((jobHold, i) => (
                  <option value={jobHold} key={i}>
                    {jobHold}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((jobhold) => jobhold),
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },
      {
        accessorKey: "job.jobName",
        header: "Departments",
        filterFn: "equals",
        Header: ({ column }) => {
          const deparments = [
            "Bookkeeping",
            "Payroll",
            "Vat Return",
            "Personal Tax",
            "Accounts",
            "Company Sec",
            "Address",
          ];
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Departments
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {deparments?.map((depart, i) => (
                  <option key={i} value={depart}>
                    {depart}
                  </option>
                ))}
              </select>
            </div>
          );
        },
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
        minSize: 100,
        maxSize: 140,
        grow: false,
      },
      {
        accessorKey: "totalHours",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px] w-[5.5rem] items-center justify-center pr-2 ">
              <span
                className="ml-1 w-full text-center cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Hrs
              </span>
              {/* <span className="font-medium w-full text-center  px-1 py-1 rounded-md bg-gray-300/30 text-black">
                {totalHours}
              </span> */}
              {/* <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              /> */}
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const hours = cell.getValue();
          return (
            <div className="w-full flex items-center justify-center">
              <span className="text-[15px] font-medium">{hours}</span>
            </div>
          );
        },
        filterFn: "equals",
        size: 90,
      },
      // End  year
      {
        accessorKey: "job.yearEnd",
        Header: ({ column }) => {
          const [filterValue, setFilterValue] = useState("");
          const [customDate, setCustomDate] = useState(getCurrentMonthYear());

          useEffect(() => {
            if (filterValue === "Custom date") {
              column.setFilterValue(customDate);
            }
            //eslint-disable-next-line
          }, [customDate, filterValue]);

          const handleFilterChange = (e) => {
            setFilterValue(e.target.value);
            column.setFilterValue(e.target.value);
          };

          const handleCustomDateChange = (e) => {
            setCustomDate(e.target.value);
            column.setFilterValue(e.target.value);
          };
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Year End
              </span>
              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal w-full cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal w-full cursor-pointer rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {column.columnDef.filterSelectOptions.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          const [showYearend, setShowYearend] = useState(false);

          const handleDateChange = (newDate) => {
            setDate(newDate);
            handleUpdateDates(row?.original?._id, newDate, "yearEnd");
            setShowYearend(false);
          };

          return (
            <div className="w-full ">
              {!showYearend ? (
                <p onDoubleClick={() => setShowYearend(true)}>
                  {format(new Date(date), "dd-MMM-yyyy")}
                </p>
              ) : (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={(e) => handleDateChange(e.target.value)}
                  className={`h-[2rem]  cursor-pointer w-full text-center rounded-md border border-gray-200 outline-none `}
                />
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          if (!cellValue) return false;

          const cellDate = new Date(cellValue);
          const today = new Date();

          const startOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          // Handle "Custom date" filter (if it includes a specific month-year)
          if (filterValue.includes("-")) {
            const [year, month] = filterValue.split("-");
            const cellYear = cellDate.getFullYear().toString();
            const cellMonth = (cellDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");

            return year === cellYear && month === cellMonth;
          }

          // Other filter cases
          switch (filterValue) {
            case "Expired":
              return cellDate < startOfToday;
            case "Today":
              return cellDate.toDateString() === today.toDateString();
            case "Yesterday":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() - 1);
              return cellDate.toDateString() === tomorrow.toDateString();
            case "Last 7 days":
              const last7Days = new Date(today);
              last7Days.setDate(today.getDate() - 7);
              return cellDate >= last7Days && cellDate < startOfToday;
            case "Last 15 days":
              const last15Days = new Date(today);
              last15Days.setDate(today.getDate() - 15);
              return cellDate >= last15Days && cellDate < startOfToday;
            case "Last 30 Days":
              const last30Days = new Date(today);
              last30Days.setDate(today.getDate() - 30);
              return cellDate >= last30Days && cellDate < startOfToday;
            case "Last 60 Days":
              const last60Days = new Date(today);
              last60Days.setDate(today.getDate() - 60);
              return cellDate >= last60Days && cellDate < startOfToday;
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Today",
          "Yesterday",
          "Last 7 days",
          "Last 15 days",
          "Last 30 Days",
          "Last 60 Days",
          "Custom date",
        ],
        filterVariant: "custom",
        size: 115,
        minSize: 80,
        maxSize: 140,
        grow: false,
      },
      // Job DeadLine
      {
        accessorKey: "job.jobDeadline",
        header: "Deadline",
        Header: ({ column }) => {
          const [filterValue, setFilterValue] = useState("");
          const [customDate, setCustomDate] = useState(getCurrentMonthYear());

          useEffect(() => {
            if (filterValue === "Custom date") {
              column.setFilterValue(customDate);
            }
            //eslint-disable-next-line
          }, [customDate, filterValue]);

          const handleFilterChange = (e) => {
            setFilterValue(e.target.value);
            column.setFilterValue(e.target.value);
          };

          const handleCustomDateChange = (e) => {
            setCustomDate(e.target.value);
            column.setFilterValue(e.target.value);
          };
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Deadline
              </span>
              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal w-full   cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal w-full  cursor-pointer rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {column.columnDef.filterSelectOptions.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          const [showDeadline, setShowDeadline] = useState(false);

          const handleDateChange = (newDate) => {
            setDate(newDate);
            handleUpdateDates(row.original._id, newDate, "jobDeadline");
            setShowDeadline(false);
          };

          const cellDate = new Date(date);
          const today = new Date();
          const isExpired = cellDate < today;

          return (
            <div className="w-full ">
              {!showDeadline ? (
                <p onDoubleClick={() => setShowDeadline(true)}>
                  {format(new Date(date), "dd-MMM-yyyy")}
                </p>
              ) : (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={(e) => handleDateChange(e.target.value)}
                  className={`h-[2rem] cursor-pointer w-full text-center rounded-md border border-gray-200 outline-none ${
                    isExpired ? "text-red-500" : ""
                  }`}
                />
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          if (!cellValue) return false;

          const cellDate = new Date(cellValue);
          const today = new Date();

          const startOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          // Handle "Custom date" filter (if it includes a specific month-year)
          if (filterValue.includes("-")) {
            const [year, month] = filterValue.split("-");
            const cellYear = cellDate.getFullYear().toString();
            const cellMonth = (cellDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");

            return year === cellYear && month === cellMonth;
          }

          // Other filter cases
          switch (filterValue) {
            case "Expired":
              return cellDate < startOfToday;
            case "Today":
              return cellDate.toDateString() === today.toDateString();
            case "Yesterday":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() - 1);
              return cellDate.toDateString() === tomorrow.toDateString();
            case "Last 7 days":
              const last7Days = new Date(today);
              last7Days.setDate(today.getDate() - 7);
              return cellDate >= last7Days && cellDate < startOfToday;
            case "Last 15 days":
              const last15Days = new Date(today);
              last15Days.setDate(today.getDate() - 15);
              return cellDate >= last15Days && cellDate < startOfToday;
            case "Last 30 Days":
              const last30Days = new Date(today);
              last30Days.setDate(today.getDate() - 30);
              return cellDate >= last30Days && cellDate < startOfToday;
            case "Last 60 Days":
              const last60Days = new Date(today);
              last60Days.setDate(today.getDate() - 60);
              return cellDate >= last60Days && cellDate < startOfToday;
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Today",
          "Yesterday",
          "Last 7 days",
          "Last 15 days",
          "Last 30 Days",
          "Last 60 Days",
          "Custom date",
        ],
        filterVariant: "custom",
        size: 115,
        minSize: 80,
        maxSize: 140,
        grow: false,
      },
      //  Current Date
      {
        accessorKey: "job.workDeadline",
        Header: ({ column }) => {
          const [filterValue, setFilterValue] = useState("");
          const [customDate, setCustomDate] = useState(getCurrentMonthYear());

          useEffect(() => {
            if (filterValue === "Custom date") {
              column.setFilterValue(customDate);
            }
            //eslint-disable-next-line
          }, [customDate, filterValue]);

          const handleFilterChange = (e) => {
            setFilterValue(e.target.value);
            column.setFilterValue(e.target.value);
          };

          const handleCustomDateChange = (e) => {
            setCustomDate(e.target.value);
            column.setFilterValue(e.target.value);
          };
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Job Date
              </span>
              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal w-full    cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal w-full  cursor-pointer rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {column.columnDef.filterSelectOptions.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          const [showCurrentDate, setShowCurrentDate] = useState(false);

          const handleDateChange = (newDate) => {
            setDate(newDate);
            handleUpdateDates(row.original._id, newDate, "workDeadline");
            setShowCurrentDate(false);
          };

          return (
            <div className="w-full ">
              {!showCurrentDate ? (
                <p onDoubleClick={() => setShowCurrentDate(true)}>
                  {format(new Date(date), "dd-MMM-yyyy")}
                </p>
              ) : (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={(e) => handleDateChange(e.target.value)}
                  className={`h-[2rem] w-full  cursor-pointer text-center rounded-md border border-gray-200 outline-none `}
                />
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          if (!cellValue) return false;

          const cellDate = new Date(cellValue);
          const today = new Date();

          const startOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          // Handle "Custom date" filter
          if (filterValue.includes("-")) {
            const [year, month] = filterValue.split("-");
            const cellYear = cellDate.getFullYear().toString();
            const cellMonth = (cellDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");

            return year === cellYear && month === cellMonth;
          }

          // Other filter cases
          switch (filterValue) {
            case "Expired":
              return cellDate < startOfToday;
            case "Today":
              return cellDate.toDateString() === today.toDateString();
            case "Yesterday":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() - 1);
              return cellDate.toDateString() === tomorrow.toDateString();
            case "Last 7 days":
              const last7Days = new Date(today);
              last7Days.setDate(today.getDate() - 7);
              return cellDate >= last7Days && cellDate < startOfToday;
            case "Last 15 days":
              const last15Days = new Date(today);
              last15Days.setDate(today.getDate() - 15);
              return cellDate >= last15Days && cellDate < startOfToday;
            case "Last 30 Days":
              const last30Days = new Date(today);
              last30Days.setDate(today.getDate() - 30);
              return cellDate >= last30Days && cellDate < startOfToday;
            case "Last 60 Days":
              const last60Days = new Date(today);
              last60Days.setDate(today.getDate() - 60);
              return cellDate >= last60Days && cellDate < startOfToday;
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Today",
          "Yesterday",
          "Last 7 days",
          "Last 15 days",
          "Last 30 Days",
          "Last 60 Days",
          "Custom date",
        ],
        filterVariant: "select",
        size: 115,
        minSize: 80,
        maxSize: 140,
        grow: false,
      },
      //  -----Due & Over Due Status----->
      {
        accessorKey: "status",
        Header: ({ column }) => {
          const dateStatus = ["Overdue", "Due"];
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Status
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal ml-1 h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {dateStatus?.map((status, i) => (
                  <option key={i} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ row }) => {
          const status = getStatus(
            row.original.job.jobDeadline,
            row.original.job.yearEnd
          );

          return (
            <div className="w-full ">
              <span
                className={`text-white   rounded-[2rem] ${
                  status === "Due"
                    ? "bg-green-500  py-[6px] px-4 "
                    : status === "Overdue"
                    ? "bg-red-500  py-[6px] px-3 "
                    : "bg-transparent"
                }`}
              >
                {status}
              </span>
            </div>
          );
        },
        filterFn: (row, id, filterValue) => {
          const status = getStatus(
            row.original.job.jobDeadline,
            row.original.job.yearEnd
          );
          if (status === undefined || status === null) return false;
          return status?.toString().toLowerCase() === filterValue.toLowerCase();
        },
        filterSelectOptions: ["Overdue", "Due"],
        filterVariant: "select",
        size: 100,
        minSize: 70,
        maxSize: 120,
        grow: false,
      },
      //
      {
        accessorKey: "job.jobStatus",
        Header: ({ column }) => {
          const jobStatus = [
            "Data",
            "Progress",
            "Queries",
            "Approval",
            "Submission",
            "Billing",
            "Feedback",
            "Inactive",
          ];
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Job Status
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] ml-1 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {jobStatus?.map((status, i) => (
                  <option key={i} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const statusValue = cell.getValue();

          return (
            <select
              value={statusValue}
              // onChange={(e) =>
              //   handleStatusChange(row.original._id, e.target.value)
              // }
              className="w-[6rem] h-[2rem] rounded-md border border-sky-300 outline-none"
            >
              <option value="empty"></option>
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
        // filterFn: "equals",
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          return (cellValue || "")?.toString() === filterValue?.toString();
        },
        filterSelectOptions: [
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
        grow: false,
      },
      {
        accessorKey: "job.lead",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="  cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Lead
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {users?.map((lead, i) => (
                  <option key={i} value={lead}>
                    {lead}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const leadValue = cell.getValue();
          const lead = row.original.job.lead;

          return (
            <div className="w-full">
              <span> {lead}</span>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((lead) => lead),
        filterVariant: "select",
        size: 100,
        minSize: 70,
        maxSize: 140,
        grow: false,
      },
      //
      {
        accessorKey: "totalTime",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]  ml w-[5rem]">
              <span className="w-full text-center ">Budget</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const statusValue = cell.getValue();
          return (
            <div className="flex items-center gap-1 w-full justify-center">
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
          const [readComments, setReadComments] = useState([]);

          useEffect(() => {
            const filterComments = comments.filter(
              (item) => item.status === "unread"
            );
            setReadComments(filterComments);
            // eslint-disable-next-line
          }, [comments]);

          return (
            <div
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
          );
        },
        size: 100,
      },
      // ------------Prepared|Review|Filed------>
      {
        accessorKey: "prepared",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Job Prepared
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {users?.map((jobhold, i) => (
                  <option key={i} value={jobhold}>
                    {jobhold}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const prepared = cell.getValue();

          return (
            <div className="w-full flex items-center justify-center">
              <select
                value={prepared || ""}
                onChange={(e) =>
                  handleUpdateUser(row.original._id, e.target.value, "", "")
                }
                className="w-full h-[2rem] rounded-md border-none outline-none"
              >
                <option value="empty"></option>
                {users.map((jobHold, i) => (
                  <option value={jobHold} key={i}>
                    {jobHold}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((jobhold) => jobhold),
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },
      //
      {
        accessorKey: "review",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Job Review
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {users?.map((jobhold, i) => (
                  <option key={i} value={jobhold}>
                    {jobhold}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const review = cell.getValue();

          return (
            <div className="w-full flex items-center justify-center">
              <select
                value={review || ""}
                onChange={(e) =>
                  handleUpdateUser(row.original._id, "", e.target.value, "")
                }
                className="w-full h-[2rem] rounded-md border-none outline-none"
              >
                <option value="empty"></option>
                {users.map((jobHold, i) => (
                  <option value={jobHold} key={i}>
                    {jobHold}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((jobhold) => jobhold),
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },
      //
      {
        accessorKey: "filed",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Job Filed
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {users?.map((jobhold, i) => (
                  <option key={i} value={jobhold}>
                    {jobhold}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const filed = cell.getValue();

          return (
            <div className="w-full flex items-center justify-center">
              <select
                value={filed || ""}
                onChange={(e) =>
                  handleUpdateUser(row.original._id, "", "", e.target.value)
                }
                className="w-full h-[2rem] rounded-md border-none outline-none"
              >
                <option value="empty"></option>
                {users.map((jobHold, i) => (
                  <option value={jobHold} key={i}>
                    {jobHold}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((jobhold) => jobhold),
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },
      // ------------Prepared|Review|Filed------>
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
    [users, auth, tableData]
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    getRowId: (originalRow) => originalRow.id,
    // enableRowSelection: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    columnFilterDisplayMode: "popover",
    muiTableContainerProps: { sx: { maxHeight: "850px" } },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
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
        fontSize: "14px",
        backgroundColor: "rgb(193, 183, 173, 0.8)",
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
        fontSize: "13px",
        border: "1px solid rgba(81, 81, 81, .5)",
        caption: {
          captionSide: "top",
        },
      },
    },
  });

  return (
    <div className="w-full h-full overflow-y-auto">
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
