import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { style } from "../../utlis/CommonStyle";
import NewJobModal from "../../components/Modals/NewJobModal";
import { CgClose } from "react-icons/cg";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { format } from "date-fns";
import { MdInsertComment } from "react-icons/md";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import Loader from "../../utlis/Loader";
import { IoClose } from "react-icons/io5";
import { useLocation } from "react-router-dom";

import socketIO from "socket.io-client";
import JobCommentModal from "../../pages/Jobs/JobCommentModal";
import JobDetail from "../../pages/Jobs/JobDetail";
import CompletedJobs from "../../pages/Jobs/CompletedJobs";
import { Timer } from "../../utlis/Timer";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const Jobs = forwardRef(({ tableData, setTableData }, ref) => {
  const { auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [play, setPlay] = useState(false);
  const [filterData, setFilterData] = useState([]);

  const [showDetail, setShowDetail] = useState(false);
  const [clientId, setClientId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isComment, setIsComment] = useState(false);
  const [jobId, setJobId] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [note, setNote] = useState("");
  const [active1, setActive1] = useState("");
  const timerRef = useRef();
  const location = useLocation();
  const [showCompleted, setShowCompleted] = useState(false);
  const [totalHours, setTotalHours] = useState("0");
  const commentStatusRef = useRef(null);
  const [labelData, setLabelData] = useState([]);
  const [dataLable, setDataLabel] = useState([]);
  const [totalFee, setTotalFee] = useState(0);
  const [activity, setActivity] = useState("Chargeable");
  const [access, setAccess] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  // const [userData, setUserData] = useState([]);

  console.log("filterData:", filterData);

  // Extract the current path
  const currentPath = location.pathname;

  // Get Auth Access

  useEffect(() => {
    if (auth.user) {
      const filterAccess = auth.user.role.access
        .filter((role) => role.permission === "Jobs")
        .flatMap((jobRole) => jobRole.subRoles);

      setAccess(filterAccess);
    }
  }, [auth]);

  // -----------Total Hours-------->

  useEffect(() => {
    const calculateTotalHours = (data) => {
      return data.reduce((sum, client) => sum + Number(client.totalHours), 0);
    };

    setTotalHours(
      calculateTotalHours(
        filterData.length > 0 ? filterData : tableData
      ).toFixed(0)
    );
  }, [tableData, filterData]);

  // ------------Total Fee-------->
  useEffect(() => {
    const calculateTotalFee = (data) => {
      return data.reduce((sum, client) => sum + Number(client.fee), 0);
    };

    setTotalFee(
      calculateTotalFee(filterData.length > 0 ? filterData : tableData).toFixed(
        0
      )
    );
  }, [tableData, filterData]);

  // -----------Get Client without Showing Loading-------->
  const allClientData = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/all/client/job`
      );
      if (data) {
        setTableData(data?.clients);

        if (active !== "All") {
          setFilterData((prevData) => {
            if (Array.isArray(prevData)) {
              return [...prevData, data.clients];
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  //   Get All Labels
  const getlabel = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/get/labels`
      );
      if (data.success) {
        setLabelData(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getlabel();
  }, []);

  //   Get All Data Labels
  const getDatalable = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/data/labels`
      );
      if (data.success) {
        setDataLabel(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDatalable();
  }, []);

  // -----------Handle Custom date filter------
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  // ---------Stop Timer ----------->
  const handleStopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );

      setUsers(
        data?.users
          ?.filter((user) =>
            user?.role?.access?.some((item) =>
              item?.permission?.includes("Jobs")
            )
          )
          .map((user) => user.name) || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();

    // eslint-disable-next-line
  }, []);

  // ---------------Handle Status Change---------->
  const handleStatusChange = async (rowId, newStatus) => {
    if (!rowId) {
      return toast.error("Job id is required!");
    }
    try {
      const { data } = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/status/${rowId}`,
        {
          status: newStatus,
        }
      );
      if (data) {
        if (active) {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item._id === rowId
                ? { ...item, job: { ...item.job, jobStatus: newStatus } }
                : item
            )
          );
        }
        setTableData((prevData) =>
          prevData?.map((item) =>
            item._id === rowId
              ? { ...item, job: { ...item.job, jobStatus: newStatus } }
              : item
          )
        );
        toast.success("Job status updated!");
        allClientData();
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  // ---------------Handle Update Lead ---------->
  const handleUpdateLead = async (rowId, lead) => {
    if (!rowId) {
      return toast.error("Job id is required!");
    }
    try {
      const { data } = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/lead/${rowId}`,
        {
          lead: lead,
        }
      );
      if (data) {
        if (active) {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item._id === rowId
                ? { ...item, job: { ...item.job, lead: lead } }
                : item
            )
          );
        }
        setTableData((prevData) =>
          prevData?.map((item) =>
            item._id === rowId
              ? { ...item, job: { ...item.job, lead: lead } }
              : item
          )
        );
        toast.success("Job lead updated!");
        allClientData();
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  // ---------------Handle Update Job Holder ---------->
  const handleUpdateJobHolder = async (rowId, jobHolder) => {
    if (!rowId) {
      return toast.error("Job id is required!");
    }
    try {
      const { data } = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/jobholder/${rowId}`,
        {
          jobHolder: jobHolder,
        }
      );
      if (data) {
        if (active) {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item._id === rowId
                ? { ...item, job: { ...item.job, jobHolder: jobHolder } }
                : item
            )
          );
        }
        setTableData((prevData) =>
          prevData?.map((item) =>
            item._id === rowId
              ? { ...item, job: { ...item.job, jobHolder: jobHolder } }
              : item
          )
        );

        toast.success("Job holder updated!");
        // Socket
        allClientData();
        // Send Socket Notification
        socketId.emit("notification", {
          title: "New Job Assigned",
          redirectLink: "/job-planning",
          description: data?.notification?.description,
          taskId: data?.notification?.taskId,
          userId: data?.notification?.userId,
          status: "unread",
        });
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  // <-----------Job Status------------->

  const getStatus = (jobDeadline, yearEnd) => {
    const deadline = new Date(jobDeadline);
    const yearEndDate = new Date(yearEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadline.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
      return "Overdue";
    } else if (
      yearEndDate.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0) &&
      !(deadline.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0))
    ) {
      return "Due";
    } else if (deadline.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      return "Due";
    } else {
      return "";
    }
  };

  // -------------------Open Detail Modal------->
  const getSingleJobDetail = (id) => {
    setClientId(id);
    setShowDetail(true);
  };

  // ---------Handle Delete Job-------------
  const handleDeleteJob = async (id) => {
    const filterData = tableData.filter((item) => item._id !== id);
    setTableData(filterData);

    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/client/delete/job/${id}`
      );
      if (data) {
        setShowDetail(false);
        toast.success("Client job deleted successfully!");
        allClientData();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // ---------------Handle Update Dates-------->
  const handleUpdateDates = async (jobId, date, type) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/dates/${jobId}`,
        type === "yearEnd"
          ? { yearEnd: date }
          : type === "jobDeadline"
          ? { jobDeadline: date }
          : { currentDate: date }
      );
      if (data) {
        const clientJob = data.clientJob;
        // Socket
        allClientData();
        toast.success("Date updated successfully!");
        setTableData((prevData) =>
          prevData?.map((item) =>
            item._id === clientJob._id ? clientJob : item
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // Close Comment Box to click anywhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        commentStatusRef.current &&
        !commentStatusRef.current.contains(event.target)
      ) {
        setIsComment(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add label in Jobs
  const addJoblabel = async (id, name, color) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/add/job/labe/${id}`,
        { name, color }
      );
      if (data) {
        if (active) {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item._id === id ? { ...item, label: { name, color } } : item
            )
          );
        }
        setTableData((prevData) =>
          prevData?.map((item) =>
            item._id === id ? { ...item, label: { name, color } } : item
          )
        );

        if (name) {
          toast.success("label added!");
        } else {
          toast.success("label updated!");
        }

        allClientData();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while add label");
    }
  };

  // Add Data
  const addDatalabel1 = async (id, labelId) => {
    console.log("Data:", id, labelId);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/add/job/data/${id}`,
        { labelId }
      );
      if (data) {
        if (active) {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item._id === id ? { ...item, data: data?.job?.data } : item
            )
          );
        }
        setTableData((prevData) =>
          prevData?.map((item) =>
            item._id === id ? { ...item, data: data?.job?.data } : item
          )
        );
        allClientData();

        toast.success("New Data label added!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while add label");
    }
  };

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);

    table.setGlobalFilter("");
  };

  useImperativeHandle(ref, () => ({
    handleClearFilters,
  }));

  //  --------------Table Columns Data--------->
  const columns = useMemo(
    () => [
      {
        accessorKey: "companyName",
        minSize: 190,
        maxSize: 300,
        size: 210,
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
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
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

          return cellValue.includes(filterValue.toLowerCase());
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
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
              />
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.includes(filterValue.toLowerCase());
        },
        size: 120,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },

      {
        accessorKey: "job.jobHolder",
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
                Assign
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
            <div className=" flex flex-col gap-[2px] w-full rounded-md items-center justify-center pr-2 ">
              <span
                className="ml-1 w-full text-center cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Hrs
              </span>
              <span className="font-medium w-[5rem] ml-2 text-center  px-1 py-1 rounded-md bg-gray-50 text-black">
                {totalHours}
              </span>
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
        size: 60,
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
            const date = new Date(newDate);
            // Check if the date is valid
            if (isNaN(date.getTime())) {
              toast.error("Please enter a valid date.");
              return;
            }
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

          if (filterValue.includes("-")) {
            const [year, month] = filterValue.split("-");
            const cellYear = cellDate.getFullYear().toString();
            const cellMonth = (cellDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");

            return year === cellYear && month === cellMonth;
          }

          // Other filter cases
          const today = new Date();
          const startOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          switch (filterValue) {
            case "Expired":
              return cellDate < startOfToday;
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
            case "30 Days":
              const in30Days = new Date(today);
              in30Days.setDate(today.getDate() + 30);
              return cellDate <= in30Days && cellDate > today;
            case "60 Days":
              const in60Days = new Date(today);
              in60Days.setDate(today.getDate() + 60);
              return cellDate <= in60Days && cellDate > today;
            case "Last 12 months":
              const lastYear = new Date(today);
              lastYear.setFullYear(today.getFullYear() - 1);
              return cellDate >= lastYear && cellDate <= today;
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Select",
          "Expired",
          "Today",
          "Tomorrow",
          "In 7 days",
          "In 15 days",
          "30 Days",
          "60 Days",
          // "Last 12 months",
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
            const date = new Date(newDate);
            // Check if the date is valid
            if (isNaN(date.getTime())) {
              toast.error("Please enter a valid date.");
              return;
            }
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

          if (filterValue.includes("-")) {
            const [year, month] = filterValue.split("-");
            const cellYear = cellDate.getFullYear().toString();
            const cellMonth = (cellDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");

            return year === cellYear && month === cellMonth;
          }

          // Other filter cases
          const today = new Date();
          const startOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          switch (filterValue) {
            case "Expired":
              return cellDate < startOfToday;
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
            case "30 Days":
              const in30Days = new Date(today);
              in30Days.setDate(today.getDate() + 30);
              return cellDate <= in30Days && cellDate > today;
            case "60 Days":
              const in60Days = new Date(today);
              in60Days.setDate(today.getDate() + 60);
              return cellDate <= in60Days && cellDate > today;
            case "Last 12 months":
              const lastYear = new Date(today);
              lastYear.setFullYear(today.getFullYear() - 1);
              return cellDate >= lastYear && cellDate <= today;
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
          "30 Days",
          "60 Days",
          // "Last 12 months",
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
        accessorKey: "currentDate",
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
            const date = new Date(newDate);
            // Check if the date is valid
            if (isNaN(date.getTime())) {
              toast.error("Please enter a valid date.");
              return;
            }

            setDate(newDate);
            handleUpdateDates(row.original._id, newDate, "currentDate");
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

          switch (filterValue) {
            case "Expired":
              return cellDate < startOfToday;
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
            case "30 Days":
              const in30Days = new Date(today);
              in30Days.setDate(today.getDate() + 30);
              return cellDate <= in30Days && cellDate > today;
            case "60 Days":
              const in60Days = new Date(today);
              in60Days.setDate(today.getDate() + 60);
              return cellDate <= in60Days && cellDate > today;
            case "Last 12 months":
              const lastYear = new Date(today);
              lastYear.setFullYear(today.getFullYear() - 1);
              return cellDate >= lastYear && cellDate <= today;
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
          "30 Days",
          "60 Days",
          // "Last 12 months",
          "Custom Date",
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
          return status.toString().toLowerCase() === filterValue.toLowerCase();
        },
        filterSelectOptions: ["Overdue", "Due"],
        filterVariant: "select",
        size: 95,
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
          ];

          useEffect(() => {
            column.setFilterValue("Progress");

            // eslint-disable-next-line
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
              onChange={(e) =>
                handleStatusChange(row.original._id, e.target.value)
              }
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
          return (cellValue || "").toString() === filterValue.toString();
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
                Owner
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

          return (
            <div className="w-full">
              <select
                value={leadValue || ""}
                onChange={(e) =>
                  handleUpdateLead(row.original._id, e.target.value)
                }
                className="w-full h-[2rem] rounded-md border-none bg-transparent outline-none"
              >
                <option value="empty"></option>
                {users.map((lead, i) => (
                  <option value={lead} key={i}>
                    {lead}
                  </option>
                ))}
              </select>
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
          const currentVal = row.original.totalTime;
          // const statusValue = cell.getValue();
          const [show, setShow] = useState(false);
          const [totalTime, setTotalTime] = useState(currentVal);
          const [load, setLoad] = useState(false);

          const updateTimer = async (e) => {
            e.preventDefault();
            setLoad(true);
            try {
              const { data } = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/v1/client/update/timer/${row.original._id}`,
                { totalTime }
              );
              if (data) {
                setShow(false);
                setLoad(true);
                toast.success("Budget updated!");
              }
            } catch (error) {
              setLoad(false);
              console.log(error);
            }
          };

          return (
            <div className="flex items-center gap-1 w-full ">
              {!show ? (
                <div
                  onDoubleClick={
                    auth?.user?.role?.name === "Admin"
                      ? () => setShow(true)
                      : null
                  }
                  className="w-full flex items-center gap-1 justify-center cursor-pointer"
                >
                  <span className="text-[1rem]">⏳</span>
                  <span>{totalTime}</span>
                </div>
              ) : (
                <div className="w-full">
                  <form onSubmit={updateTimer}>
                    <input
                      type="text"
                      disabled={load}
                      className="w-full h-[2rem] rounded-md border border-gray-500 px-1 outline-none "
                      value={totalTime}
                      onChange={(e) => setTotalTime(e.target.value)}
                    />
                  </form>
                </div>
              )}
            </div>
          );
        },
        size: 80,
      },
      {
        accessorKey: "timertracker",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]  ml w-[5rem]">
              <span className="w-full text-center ">Timer</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          // const statusValue = cell.getValue();
          // console.log("row", row.original, row.original.job.jobName);

          return (
            <div
              className="flex items-center justify-center gap-1 w-full h-full "
              onClick={() => setPlay(!play)}
            >
              <span className="text-[1rem] cursor-pointer  ">
                <Timer
                  ref={timerRef}
                  clientId={auth.user.id}
                  jobId={row.original._id}
                  setIsShow={setIsShow}
                  note={note}
                  taskLink={currentPath}
                  pageName={"Jobs"}
                  taskName={row.original.companyName}
                  setNote={setNote}
                  department={row.original.job.jobName}
                  clientName={row.original.clientName}
                  JobHolderName={row.original.job.jobHolder}
                  projectName={""}
                  task={""}
                  companyName={row.original.companyName}
                  activity={activity}
                  setActivity={setActivity}
                />
              </span>
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
        size: 80,
      },
      // Label
      {
        accessorKey: "label",

        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Labels
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {labelData?.map((label, i) => (
                  <option key={i} value={label?.name}>
                    {label?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const [show, setShow] = useState(false);
          const jobLabel = row.original.label || {};
          const { name, color } = jobLabel;

          const handleLabelChange = (labelName) => {
            const selectedLabel = labelData.find(
              (label) => label.name === labelName
            );
            if (selectedLabel) {
              addJoblabel(row.original._id, labelName, selectedLabel.color);
            } else {
              addJoblabel(row.original._id, "", "");
            }
            setShow(false);
          };

          return (
            <div className="w-full flex items-center justify-center">
              {show ? (
                <select
                  value={name || ""}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full h-[2rem] rounded-md border-none outline-none"
                >
                  <option value="empty">Select Label</option>
                  {labelData?.map((label, i) => (
                    <option value={label?.name} key={i}>
                      {label?.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="cursor-pointer h-full min-w-full "
                  onDoubleClick={() => setShow(true)}
                >
                  {name ? (
                    <span
                      className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                      style={{ background: `${color}` }}
                    >
                      {name}
                    </span>
                  ) : (
                    <span
                      className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                      // style={{ background: `${color}` }}
                    >
                      .
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const labelName = row.original?.label?.name || "";
          return labelName === filterValue;
        },

        filterVariant: "select",
        filterSelectOptions: labelData.map((label) => label.name),
        size: 120,
        minSize: 100,
        maxSize: 210,
        grow: false,
      },
      // Source
      // || auth?.user?.role.access.some((item)=>)
      ...(auth?.user?.role?.name === "Admin" || access.includes("Fee")
        ? [
            {
              accessorKey: "fee",
              Header: ({ column }) => {
                return (
                  <div className=" flex flex-col gap-[2px] w-full items-center justify-center  ">
                    <span
                      className="ml-1 w-full text-center cursor-pointer pr-6"
                      title="Clear Filter"
                      onClick={() => {
                        column.setFilterValue("");
                      }}
                    >
                      Fee
                    </span>
                    <span
                      title={totalFee}
                      className="font-medium w-full cursor-pointer text-center text-[12px] px-1 py-1 rounded-md bg-gray-50 text-black"
                    >
                      {totalFee}
                    </span>
                  </div>
                );
              },
              Cell: ({ cell, row }) => {
                const fee = row.original.fee;
                return (
                  <div className="w-full flex items-center justify-center">
                    <span className="text-[15px] font-medium">
                      {fee && fee}
                    </span>
                  </div>
                );
              },
              filterFn: "equals",
              size: 60,
            },
          ]
        : []),
      ...(auth?.user?.role?.name === "Admin" || access.includes("Source")
        ? [
            {
              accessorKey: "source",
              Header: ({ column }) => {
                const sources = [
                  "FIV",
                  "UPW",
                  "PPH",
                  "Website",
                  "Referal",
                  "Partner",
                ];
                return (
                  <div className=" flex flex-col gap-[2px] w-[5.5rem] items-center justify-center  ">
                    <span
                      className="ml-1 w-full text-center cursor-pointer pr-6"
                      title="Clear Filter"
                      onClick={() => {
                        column.setFilterValue("");
                      }}
                    >
                      Source
                    </span>

                    <select
                      value={column.getFilterValue() || ""}
                      onChange={(e) => column.setFilterValue(e.target.value)}
                      className="font-normal w-full max-w-[5rem] h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                    >
                      <option value="">Select</option>
                      {sources?.map((sour, i) => (
                        <option key={i} value={sour}>
                          {sour}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              },
              Cell: ({ cell, row }) => {
                const source = row.original.source;
                return (
                  <div className="w-full flex items-start justify-start">
                    <span className="text-[15px] font-medium">
                      {source && source}
                    </span>
                  </div>
                );
              },
              filterFn: "equals",
              size: 90,
            },
          ]
        : []),
      // ---------------------------->
      ...(auth?.user?.role?.name === "Admin" || access.includes("Data")
        ? [
            // Data Label
            {
              accessorKey: "data",

              Header: ({ column }) => {
                return (
                  <div className="flex flex-col gap-[2px]">
                    <span
                      className="ml-1 cursor-pointer"
                      title="Clear Filter"
                      onClick={() => {
                        column.setFilterValue("");
                      }}
                    >
                      Data
                    </span>
                    <select
                      value={column.getFilterValue() || ""}
                      onChange={(e) => column.setFilterValue(e.target.value)}
                      className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                    >
                      <option value="">Select</option>
                      {dataLable?.map((label, i) => (
                        <option key={i} value={label?.name}>
                          {label?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              },

              Cell: ({ cell, row }) => {
                const [show, setShow] = useState(false);
                const jobLabel = row.original.data || {};
                const { name, color, _id } = jobLabel;

                const handleLabelChange = (labelName) => {
                  const selectedLabel = dataLable.find(
                    (label) => label._id === labelName
                  );
                  console.log("selectedLabel:", selectedLabel);
                  if (selectedLabel) {
                    addDatalabel1(
                      row.original._id,
                      labelName,
                      selectedLabel.color
                    );
                  } else {
                    addDatalabel1(row.original._id, "", "");
                  }
                  setShow(false);
                };

                return (
                  <div className="w-full flex items-start ">
                    {show ? (
                      <select
                        value={_id || ""}
                        onChange={(e) => handleLabelChange(e.target.value)}
                        className="w-full h-[2rem] rounded-md border-none outline-none"
                      >
                        <option value="empty">Select Data</option>
                        {dataLable?.map((label, i) => (
                          <option value={label?._id} key={i}>
                            {label?.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div
                        className="cursor-pointer h-full min-w-full "
                        onDoubleClick={() => setShow(true)}
                      >
                        {name ? (
                          <span
                            className={`label relative  rounded-md hover:shadow  cursor-pointer text-black ${
                              color === "#fff"
                                ? "text-gray-950 py-[4px] px-0"
                                : "text-white py-[4px] px-2"
                            }`}
                            style={{ background: `${color}` }}
                          >
                            {name}
                          </span>
                        ) : (
                          <span
                            className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                            // style={{ background: `${color}` }}
                          >
                            .
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              },

              filterFn: (row, columnId, filterValue) => {
                const labelName = row.original?.data?.name || "";
                return labelName === filterValue;
              },

              filterVariant: "select",
              filterSelectOptions: dataLable.map((label) => label.name),
              size: 110,
              minSize: 100,
              maxSize: 210,
              grow: false,
            },
          ]
        : []),
    ],
    // eslint-disable-next-line
    [
      users,
      play,
      auth,
      note,
      totalHours,
      labelData,
      dataLable,
      filterData,
      tableData,
    ]
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    getRowId: (row) => row._id,
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
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },

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
        background: "#FB923C",
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

  useMemo(() => {
    const filteredRows = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    setFilterData(filteredRows);

    // eslint-disable-next-line
  }, [table.getFilteredRowModel().rows]);

  return (
    <>
      <div className="w-full h-[100%]  overflow-y-auto ">
        {/* ---------------------Data Table---------------- */}
        {!showCompleted ? (
          <>
            {loading ? (
              <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                <Loader />
              </div>
            ) : (
              <div className="w-full min-h-[20vh] relative border-t border-gray-300">
                <div className="h-full hidden1 overflow-y-scroll relative">
                  <MaterialReactTable table={table} />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full min-h-screen  relative">
            <CompletedJobs
              getSingleJobDetail={getSingleJobDetail}
              setCompanyName={setCompanyName}
              users={users}
              handleUpdateJobHolder={handleUpdateJobHolder}
              handleUpdateDates={handleUpdateDates}
              getStatus={getStatus}
              setJobId={setJobId}
              setIsComment={setIsComment}
              allClientJobData={allClientData}
            />
          </div>
        )}
      </div>

      {/* ------------Add Client_Job Modal -------------*/}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full min-h-screen overflow-y-auto z-[999] bg-gray-100 flex items-center justify-center py-6  px-4">
          <span
            className="absolute  top-[4px] right-[.8rem]  cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-gray-300/70 transition-all duration-150 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <CgClose className="h-5 w-5 text-black" />
          </span>
          <NewJobModal setIsOpen={setIsOpen} allClientJobData={allClientData} />
        </div>
      )}

      {/*---------------Job Details---------------*/}

      {showDetail && (
        <div className="fixed right-0 top-[3.8rem] z-[999] bg-gray-100 w-[37%] 2xl:w-[28%] h-[calc(103vh-0rem)] py-3 px-3 ">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{companyName}</h3>
            <span
              className="p-1 rounded-md bg-gray-50 border  hover:shadow-md hover:bg-gray-100"
              onClick={() => setShowDetail(false)}
            >
              <IoClose className="h-5 w-5 cursor-pointer" />
            </span>
          </div>
          <JobDetail
            clientId={clientId}
            handleStatus={handleStatusChange}
            allClientJobData={allClientData}
            handleDeleteJob={handleDeleteJob}
            users={users}
            allClientData={allClientData}
          />
        </div>
      )}
      {/* ------------Comment Modal---------*/}

      {isComment && (
        <div
          ref={commentStatusRef}
          className="fixed bottom-4 right-4 w-[30rem] max-h-screen z-[999]  flex items-center justify-center"
        >
          <JobCommentModal
            setIsComment={setIsComment}
            jobId={jobId}
            setJobId={setJobId}
            users={users}
            type={"Jobs"}
            getTasks1={allClientData}
            page={"job"}
          />
        </div>
      )}

      {/* -------------Stop Timer Btn-----------*/}
      {isShow && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
          <div className="w-[35rem] rounded-md bg-white shadow-md">
            <div className="flex  flex-col gap-3 ">
              <div className=" w-full flex items-center justify-between py-2 mt-1 px-4">
                <h3 className="text-[19px] font-semibold text-gray-800">
                  Enter End Note
                </h3>
                <span
                  onClick={() => {
                    setIsShow(false);
                  }}
                >
                  <IoClose className="text-black cursor-pointer h-6 w-6 " />
                </span>
              </div>
              <hr className="w-full h-[1px] bg-gray-500 " />
              <div className="flex items-start px-4 py-2 ">
                {activity === "Chargeable" ? (
                  <button
                    className={`px-4 h-[2.6rem] min-w-[5rem] flex items-center justify-center  rounded-md cursor-pointer shadow-md  text-white border-none outline-none bg-green-500 hover:bg-green-600`}
                    onClick={() => setActivity("Non-Chargeable")}
                    style={{ width: "8rem", fontSize: "14px" }}
                  >
                    Chargeable
                  </button>
                ) : (
                  <button
                    className={`px-4 h-[2.6rem] min-w-[5rem] flex items-center justify-center  rounded-md cursor-pointer shadow-md  text-white border-none outline-none bg-red-500 hover:bg-red-600`}
                    onClick={() => setActivity("Chargeable")}
                    style={{ width: "9rem", fontSize: "14px" }}
                  >
                    Non-Chargeable
                  </button>
                )}
              </div>
              <div className=" w-full px-4 py-2 flex-col gap-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note here..."
                  className="w-full h-[6rem] rounded-md resize-none py-1 px-2 border-2 border-gray-700"
                />
                <div className="flex items-center justify-end mt-4">
                  <button className={`${style.btn}`} onClick={handleStopTimer}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Jobs;
