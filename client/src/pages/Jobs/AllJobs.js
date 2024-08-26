import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { style } from "../../utlis/CommonStyle";
import NewJobModal from "../../components/Modals/NewJobModal";
import { CgClose } from "react-icons/cg";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoIosArrowDropup } from "react-icons/io";
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
import { TbCalendarDue } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import JobDetail from "./JobDetail";
import { IoBriefcaseOutline } from "react-icons/io5";
import { Timer } from "../../utlis/Timer";
import JobCommentModal from "./JobCommentModal";
import { MdAutoGraph } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { TbLoader } from "react-icons/tb";
import { Box, Button } from "@mui/material";
// import {
//   FileDownload as FileDownloadIcon,
//   Clear as ClearIcon,
// } from "@mui/icons-material";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { IoMdDownload } from "react-icons/io";

import socketIO from "socket.io-client";
import CompletedJobs from "./CompletedJobs";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

// CSV Configuration
const csvConfig = mkConfig({
  filename: "full_table_data",
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  showTitle: true,
  title: "Exported Jobs Table Data",
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
});

export default function AllJobs() {
  const { auth, filterId, setFilterId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [play, setPlay] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [activeBtn, setActiveBtn] = useState("");
  const [showJobHolder, setShowJobHolder] = useState(false);
  const [showDue, setShowDue] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [clientId, setClientId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isComment, setIsComment] = useState(false);
  const [jobId, setJobId] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [note, setNote] = useState("");
  const [active1, setActive1] = useState("");
  const timerRef = useRef();
  const [showStatus, setShowStatus] = useState(false);
  const location = useLocation();
  const [showCompleted, setShowCompleted] = useState(false);
  const [totalHours, setTotalHours] = useState("0");
  const [fLoading, setFLoading] = useState(false);

  // Extract the current path
  const currentPath = location.pathname;

  const departments = [
    "All",
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ];

  const dateStatus = ["Due", "Overdue"];

  const status = [
    "Data",
    "Progress",
    "Queries",
    "Approval",
    "Submission",
    "Billing",
    "Feedback",
  ];

  // -----------Date-------->
  useEffect(() => {
    if (active === "All" && !active1) {
      if (filterData) {
        const totalHours = tableData.reduce(
          (sum, client) => sum + Number(client.totalHours),
          0
        );
        setTotalHours(totalHours.toFixed(0));
      }
    } else {
      if (filterData) {
        const totalHours = filterData.reduce(
          (sum, client) => sum + Number(client.totalHours),
          0
        );
        setTotalHours(totalHours.toFixed(0));
      }
    }
  }, [filterData, tableData, active, active1]);

  // ---------------All Client_Job Data----------->
  const allClientJobData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/all/client/job`
      );
      if (data) {
        setTableData(data?.clients);
        // const totalHours = data.clients.reduce(
        //   (sum, client) => sum + Number(client.totalHours),
        //   0
        // );
        // setTotalHours(totalHours.toFixed(0));
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  useEffect(() => {
    allClientJobData();
    // eslint-disable-next-line
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

  // -------------- Department Lenght--------->
  const getDepartmentCount = (department) => {
    if (department === "All") {
      return tableData?.length;
    }
    return tableData.filter((item) => item?.job?.jobName === department)
      ?.length;
  };

  // -------Due & Overdue count------->
  const getDueAndOverdueCountByDepartment = (department) => {
    const filteredData = tableData.filter(
      (item) => item.job.jobName === department || department === "All"
    );

    const dueCount = filteredData.filter(
      (item) => getStatus(item.job.jobDeadline, item.job.yearEnd) === "Due"
    ).length;
    const overdueCount = filteredData.filter(
      (item) => getStatus(item.job.jobDeadline, item.job.yearEnd) === "Overdue"
    ).length;

    return { due: dueCount, overdue: overdueCount };
  };
  // --------------Status Length---------->
  const getStatusCount = (status, department) => {
    return tableData.filter((item) =>
      department === "All"
        ? item?.job?.jobStatus === status
        : item?.job?.jobStatus === status && item?.job?.jobName === department
    )?.length;
  };
  // --------------Job_Holder Length---------->

  const getJobHolderCount = (user, department) => {
    return tableData.filter((item) =>
      department === "All"
        ? item?.job?.jobHolder === user
        : item?.job?.jobHolder === user && item?.job?.jobName === department
    )?.length;
  };

  // --------------Filter Data By Department ----------->

  const filterByDep = (value) => {
    const filteredData = tableData.filter(
      (item) =>
        item.job.jobName === value ||
        item.job.jobStatus === value ||
        item.job.jobHolder === value ||
        item._id === value
    );

    // console.log("FilterData", filteredData);

    setFilterData([...filteredData]);
  };

  useEffect(() => {
    if (tableData && filterId) {
      filterByDep(filterId);
    }
    // eslint-disable-next-line
  }, [tableData, filterId]);

  // -------------- Filter Data By Department || Status || Placeholder ----------->

  const filterByDepStat = (value, dep) => {
    let filteredData = [];

    if (dep === "All") {
      filteredData = tableData.filter(
        (item) =>
          item.job.jobStatus === value ||
          item.job.jobHolder === value ||
          getStatus(item.job.jobDeadline, item.job.yearEnd) === value ||
          getStatus(item.job.jobDeadline, item.job.yearEnd) === value
      );
    } else {
      filteredData = tableData.filter((item) => {
        const jobMatches = item.job.jobName === dep;
        const statusMatches = item.job.jobStatus === value;
        const holderMatches = item.job.jobHolder === value;

        return (
          (holderMatches && jobMatches) ||
          (statusMatches && jobMatches) ||
          (jobMatches &&
            getStatus(item.job.jobDeadline, item.job.yearEnd) === value) ||
          (jobMatches &&
            getStatus(item.job.jobDeadline, item.job.yearEnd) === value)
        );
      });
    }

    setFilterData([...filteredData]);
  };

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(data?.users.map((user) => user.name));
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
        if (filterId || active || active1) {
          setFilterData((prevData) =>
            prevData.map((item) =>
              item._id === rowId
                ? { ...item, job: { ...item.job, jobStatus: newStatus } }
                : item
            )
          );
        }
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === rowId
              ? { ...item, job: { ...item.job, jobStatus: newStatus } }
              : item
          )
        );
        toast.success("Job status updated!");
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
        if (filterId || active || active1) {
          setFilterData((prevData) =>
            prevData.map((item) =>
              item._id === rowId
                ? { ...item, job: { ...item.job, lead: lead } }
                : item
            )
          );
        }
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === rowId
              ? { ...item, job: { ...item.job, lead: lead } }
              : item
          )
        );
        toast.success("Job lead updated!");
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
        if (filterId || active || active1) {
          setFilterData((prevData) =>
            prevData.map((item) =>
              item._id === rowId
                ? { ...item, job: { ...item.job, jobHolder: jobHolder } }
                : item
            )
          );
        }
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === rowId
              ? { ...item, job: { ...item.job, jobHolder: jobHolder } }
              : item
          )
        );

        toast.success("Job holder updated!");
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
  // const getStatus = (jobDeadline, yearEnd) => {
  //   const deadline = new Date(jobDeadline);
  //   const yearEndDate = new Date(yearEnd);
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   const deadlineDate = new Date(deadline);
  //   deadlineDate.setHours(0, 0, 0, 0);

  //   const yearEndDateOnly = new Date(yearEndDate);
  //   yearEndDateOnly.setHours(0, 0, 0, 0);

  //   if (deadlineDate < today || yearEndDateOnly < today) {
  //     return "Overdue";
  //   } else if (
  //     deadlineDate.getTime() === today.getTime() ||
  //     yearEndDateOnly.getTime() === today.getTime()
  //   ) {
  //     return "Due";
  //   }
  //   return "";
  // };
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
        toast.success("Date updated successfully!");
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === clientJob._id ? clientJob : item
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // --------------Import Job data------------>
  const importJobData = async (file) => {
    setFLoading(true);
    if (!file) {
      toast.error("File is required!");
      setFLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/client/import/data`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (data) {
        allClientJobData();
        toast.success("Job Data imported successfully!");
      }
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error(
        error?.response?.data?.message || "Failed to import job data"
      );
    } finally {
      setFLoading(false);
    }
  };

  const flattenData = (data) => {
    return data.map((row) => ({
      clientName: row.clientName,
      companyName: row.companyName,
      // email: row.email,
      currentDate: row.currentDate,
      totalHours: row.totalHours,
      totalTime: row.totalTime,
      jobName: row.job?.jobName || "",
      yearEnd: row.job?.yearEnd || "",
      jobDeadline: row.job?.jobDeadline || "",
      workDeadline: row.job?.workDeadline || "",
      jobStatus: row.job?.jobStatus || "",
      lead: row.job?.lead || "",
      jobHolder: row.job?.jobHolder || "",
    }));
  };

  const handleExportData = () => {
    const csvData = flattenData(tableData);
    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
  };

  //  --------------Table Columns Data--------->
  const columns = useMemo(
    () => [
      {
        accessorKey: "companyName",
        header: "Company Name",
        minSize: 170,
        maxSize: 220,
        size: 210,
        grow: true,
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
        size: 130,
        minSize: 80,
        maxSize: 150,
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
        size: 120,
        minSize: 100,
        maxSize: 140,
        grow: true,
      },
      {
        accessorKey: "totalHours",
        header: "Hrs",
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
        header: "Year End",
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
            <div className="w-full flex items-center justify-center">
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
                  className={`h-[2rem] w-[6rem] cursor-pointer text-center rounded-md border border-gray-200 outline-none `}
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

            // Log for debugging
            // console.log(
            //   "Filter Value:",
            //   filterValue,
            //   "Cell Year:",
            //   cellYear,
            //   "Cell Month:",
            //   cellMonth
            // );

            return year === cellYear && month === cellMonth;
          }

          // Other filter cases
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
        size: 110,
        minSize: 80,
        maxSize: 140,
        grow: true,
        Filter: ({ column }) => {
          const [filterValue, setFilterValue] = useState("Select");
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

          return filterValue === "Custom date" ? (
            <input
              type="month"
              value={customDate}
              onChange={handleCustomDateChange}
              className="h-[2rem] w-[9rem] cursor-pointer text-center rounded-md border border-gray-200 outline-none"
            />
          ) : (
            <select
              value={filterValue}
              onChange={handleFilterChange}
              className="h-[2rem] w-[9rem] cursor-pointer text-center rounded-md border border-gray-200 outline-none"
            >
              {column.columnDef.filterSelectOptions.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        },
      },

      // Job DeadLine
      {
        accessorKey: "job.jobDeadline",
        header: "Deadline",
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
            <div className="w-full flex items-center justify-center">
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
                  className={`h-[2rem] w-[6rem] cursor-pointer text-center rounded-md border border-gray-200 outline-none ${
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
        size: 110,
        minSize: 80,
        maxSize: 140,
        grow: true,
        Filter: ({ column }) => {
          const [filterValue, setFilterValue] = useState("Select");
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

          return filterValue === "Custom date" ? (
            <input
              type="month"
              value={customDate}
              onChange={handleCustomDateChange}
              className="h-[2rem] w-[9rem] cursor-pointer text-center rounded-md border border-gray-200 outline-none"
            />
          ) : (
            <select
              value={filterValue}
              onChange={handleFilterChange}
              className="h-[2rem] w-[9rem] cursor-pointer text-center rounded-md border border-gray-200 outline-none"
            >
              {column.columnDef.filterSelectOptions.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        },
      },

      //  Current Date
      {
        accessorKey: "currentDate",
        header: "Job Date",
        Cell: ({ cell, row }) => {
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          const [showCurrentDate, setShowCurrentDate] = useState(false);

          const handleDateChange = (newDate) => {
            setDate(newDate);
            handleUpdateDates(row.original._id, newDate, "currentDate");
            setShowCurrentDate(false);
          };

          return (
            <div className="w-full flex items-center justify-center">
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
                  className={`h-[2rem] w-[6rem] cursor-pointer text-center rounded-md border border-gray-200 outline-none `}
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
          "Last 12 months",
          // "Custom Date",
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
              onChange={(e) =>
                handleStatusChange(row.original._id, e.target.value)
              }
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
              onChange={(e) =>
                handleUpdateLead(row.original._id, e.target.value)
              }
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
        accessorKey: "timertracker",
        header: "Timer",
        Cell: ({ cell, row }) => {
          // const statusValue = cell.getValue();
          // console.log("row", row.original.job.jobName);

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
                />
              </span>
            </div>
          );
        },
        size: 110,
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
              {comments?.length > 0 && <span>({comments?.length})</span>}
            </div>
          );
        },
        size: 100,
      },
    ],
    // eslint-disable-next-line
    [users, play, auth, note]
  );

  const table = useMaterialReactTable({
    columns,
    data: active === "All" && !active1 && !filterId ? tableData : filterData,
    getRowId: (originalRow) => originalRow.id,
    // enableRowSelection: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    columnFilterDisplayMode: "popover",
    muiTableContainerProps: { sx: { maxHeight: "720px" } },
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
        fontSize: "14px",
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

    renderTopToolbarCustomActions: ({ table }) => {
      const handleClearFilters = () => {
        table.setColumnFilters([]);
        table.setGlobalFilter("");
      };

      return (
        <Box
          sx={{
            display: "flex",
            gap: "7px",
            padding: "2px",
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={handleExportData}
            // startIcon={<FileDownloadIcon />}
            className="w-[2rem] rounded-full"
          >
            <IoMdDownload className="h-5 w-5 text-gray-700" />
          </Button>
          <Button
            onClick={handleClearFilters}
            // startIcon={<ClearIcon />}
            className="w-[2rem] rounded-full"
          >
            <IoClose className="h-5 w-5 text-gray-700" />
          </Button>
        </Box>
      );
    },
  });

  return (
    <Layout>
      <div className="w-full min-h-screen py-4 px-2 sm:px-4 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-semibold ">Job</h1>
            <span className="" onClick={() => setShow(!show)}>
              {show ? (
                <IoIosArrowDropup className="h-5 w-5 cursor-pointer" />
              ) : (
                <IoIosArrowDropdown className="h-5 w-5 cursor-pointer" />
              )}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <form>
              <input
                type="file"
                name="file"
                onChange={(e) => importJobData(e.target.files[0])}
                accept=".csv, .xlsx"
                id="importJobs"
                className="hidden"
              />
              <label
                htmlFor="importJobs"
                className={`${
                  style.button1
                } !bg-gray-50 !shadow-none text-black hover:bg-orange-500 text-[15px] ${
                  fLoading ? "cursor-not-allowed opacity-90" : ""
                }`}
                style={{ padding: ".4rem 1.1rem", color: "#000" }}
                title={"Import csv or excel file!"}
                onClick={(e) => fLoading && e.preventDefault()}
              >
                {fLoading ? (
                  <TbLoader className="h-6 w-6 animate-spin text-black" />
                ) : (
                  "Import"
                )}
              </label>
            </form>
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setIsOpen(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Client
            </button>
          </div>
        </div>
        {/*  */}

        {/* -----------Filters By Deparment--------- */}
        <div className="flex items-center flex-wrap gap-2 mt-3">
          {departments?.map((dep, i) => {
            getDueAndOverdueCountByDepartment(dep);
            return (
              <div
                className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                  active === dep &&
                  " border-2 border-b-0 text-orange-600 border-gray-300"
                }`}
                key={i}
                onClick={() => {
                  setActive(dep);
                  filterByDep(dep);
                  setShowCompleted(false);
                  setActive1("");
                  setFilterId("");
                }}
              >
                {dep} ({getDepartmentCount(dep)})
              </div>
            );
          })}
          <div
            className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
              activeBtn === "completed" &&
              showCompleted &&
              " border-2 border-b-0 text-orange-600 border-gray-300"
            }`}
            onClick={() => {
              setActiveBtn("completed");
              setShowCompleted(true);
              setActive("");
            }}
          >
            Completed
          </div>
          {/*  */}
          {/* -------------Filter Open Buttons-------- */}
          <span
            className={` p-1 rounded-md hover:shadow-md bg-gray-50 mb-1  cursor-pointer border  ${
              activeBtn === "jobHolder" && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setActiveBtn("jobHolder");
              setShowJobHolder(!showJobHolder);
            }}
            title="Filter by Job Holder"
          >
            <IoBriefcaseOutline className="h-6 w-6  cursor-pointer " />
          </span>
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
              activeBtn === "due" && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setActiveBtn("due");
              setShowDue(!showDue);
            }}
            title="Filter by Status"
          >
            <TbCalendarDue className="h-6 w-6  cursor-pointer" />
          </span>
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
              activeBtn === "status" && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setActiveBtn("status");
              setShowStatus(!showStatus);
            }}
            title="Filter by Job Status"
          >
            <MdAutoGraph className="h-6 w-6  cursor-pointer" />
          </span>
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
            onClick={() => {
              setActive("All");
              setActiveBtn("");
              setShowStatus(false);
              setShowJobHolder(false);
              setShowDue(false);
              setActive1("");
              setFilterId("");
            }}
            title="Clear filters"
          >
            <IoClose className="h-6 w-6  cursor-pointer" />
          </span>
        </div>
        {/*  */}
        <hr className="mb-1 bg-gray-300 w-full h-[1px]" />

        {/* ----------Job_Holder Summery Filters---------- */}
        {showJobHolder && activeBtn === "jobHolder" && (
          <>
            <div className="w-full  py-2 ">
              <h3 className="text-[19px] font-semibold text-black">
                Job Holder Summary
              </h3>
              <div className="flex items-center flex-wrap gap-4">
                {users?.map((user, i) => (
                  <div
                    className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                      active1 === user &&
                      "  border-b-2 text-orange-600 border-orange-600"
                    }`}
                    key={i}
                    onClick={() => {
                      setActive1(user);
                      filterByDepStat(user, active);
                    }}
                  >
                    {user} ({getJobHolderCount(user, active)})
                  </div>
                ))}
              </div>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
          </>
        )}

        {/* ----------Date Status Summery Filters---------- */}
        {showDue && activeBtn === "due" && (
          <>
            <div className="w-full py-2">
              <h3 className="text-[19px] font-semibold text-black">
                Date Status Summary
              </h3>
              <div className="flex items-center flex-wrap gap-4">
                {dateStatus?.map((stat, i) => {
                  const { due, overdue } =
                    getDueAndOverdueCountByDepartment(active);
                  return (
                    <div
                      className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                        active1 === stat &&
                        " border-b-2 text-orange-600 border-orange-600"
                      }`}
                      key={i}
                      onClick={() => {
                        setActive1(stat);
                        filterByDepStat(stat, active);
                      }}
                    >
                      {stat === "Due" ? (
                        <span>Due {due}</span>
                      ) : (
                        <span>Overdue {overdue}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
          </>
        )}

        {/* ----------Status Summery Filters---------- */}
        {showStatus && activeBtn === "status" && (
          <>
            <div className="w-full  py-2 ">
              <h3 className="text-[19px] font-semibold text-black">
                Status Summary
              </h3>
              <div className="flex items-center flex-wrap gap-4">
                {status?.map((stat, i) => (
                  <div
                    className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                      active1 === stat &&
                      "  border-b-2 text-orange-600 border-orange-600"
                    }`}
                    key={i}
                    onClick={() => {
                      setActive1(stat);
                      filterByDepStat(stat, active);
                    }}
                  >
                    {stat} ({getStatusCount(stat, active)})
                  </div>
                ))}
              </div>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
          </>
        )}

        {/* ---------------------Data Table---------------- */}
        {!showCompleted ? (
          <>
            {loading ? (
              <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                <Loader />
              </div>
            ) : (
              <div className="w-full min-h-[20vh] relative -mt-[6px] border-t border-gray-300">
                <div className="h-full hidden1 overflow-y-scroll relative">
                  <MaterialReactTable table={table} />
                </div>
                <span className="absolute bottom-4 left-[34.5%] z-10 font-semibold text-[15px] text-gray-900">
                  Total Hrs: {totalHours}
                </span>
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
              allClientJobData={allClientJobData}
            />
          </div>
        )}
      </div>

      {/* ------------Add Client_Job Modal -------------*/}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100 flex items-center justify-center py-6  px-4">
          <span
            className="absolute  top-[4px] right-[.8rem]  cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-gray-300/70 transition-all duration-150 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <CgClose className="h-5 w-5 text-black" />
          </span>
          <NewJobModal
            setIsOpen={setIsOpen}
            allClientJobData={allClientJobData}
          />
        </div>
      )}

      {/*---------------Job Details---------------*/}

      {showDetail && (
        <div className="fixed right-0 top-[3.8rem] z-[999] bg-gray-100 w-[35%] h-[calc(100vh-3.8rem)] py-3 px-3 ">
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
            allClientJobData={allClientJobData}
            handleDeleteJob={handleDeleteJob}
          />
        </div>
      )}
      {/* ------------Comment Modal---------*/}

      {isComment && (
        <div className="fixed bottom-4 right-4 w-[30rem] max-h-screen z-[999]  flex items-center justify-center">
          <JobCommentModal
            setIsComment={setIsComment}
            jobId={jobId}
            setJobId={setJobId}
            users={users}
            type={"Jobs"}
          />
        </div>
      )}

      {/* -------------Stop Timer Btn-----------*/}
      {isShow && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
          <div className="w-[32rem] rounded-md bg-white shadow-md">
            <div className="flex  flex-col gap-3 ">
              <div className=" w-full flex items-center justify-between py-2 mt-1 px-4">
                <h3 className="text-[19px] font-semibold text-gray-800">
                  Enter your note here
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
              <div className=" w-full px-4 py-2 flex-col gap-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note here..."
                  className="w-full h-[6rem] rounded-md resize-none py-1 px-2 shadow border-2 border-gray-700"
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
    </Layout>
  );
}
