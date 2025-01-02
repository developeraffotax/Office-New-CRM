import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
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
import { TbCalendarDue, TbLoader2 } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import JobDetail from "./JobDetail";
import { IoBriefcaseOutline } from "react-icons/io5";
import { Timer } from "../../utlis/Timer";
import JobCommentModal from "./JobCommentModal";
import { MdAutoGraph } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { TbLoader } from "react-icons/tb";
import { Box, Button } from "@mui/material";
import { MdOutlineModeEdit } from "react-icons/md";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { IoMdDownload } from "react-icons/io";
import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Select from "react-select";

import CompletedJobs from "./CompletedJobs";
import socketIO from "socket.io-client";
import { GrUpdate } from "react-icons/gr";
import AddLabel from "../../components/Modals/AddLabel";
import { LuImport } from "react-icons/lu";
import AddDataLabel from "../../components/Modals/AddDataLabel";
import InactiveClients from "./InactiveClients";
import Swal from "sweetalert2";
import HandleQualityModal from "../../components/Modals/HandleQualityModal";
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
  const {
    auth,
    filterId,
    setFilterId,
    searchValue,
    setSearchValue,
    jid,
    anyTimerRunning,
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersData, setUsersData] = useState([]);
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
  const commentStatusRef = useRef(null);
  const [showlabel, setShowlabel] = useState(false);
  const [labelData, setLabelData] = useState([]);
  const [showDataLable, setShowDataLable] = useState(false);
  const [dataLable, setDataLabel] = useState([]);
  const [totalFee, setTotalFee] = useState(0);
  const [activity, setActivity] = useState("Chargeable");
  const [access, setAccess] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  // -------Update Multiple------>
  const [showEdit, setShowEdit] = useState(false);
  const [jobHolder, setJobHolder] = useState("");
  const [lead, setLead] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [jobDeadline, setJobDeadline] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [jobState, setJobState] = useState("");
  const [label, setLabel] = useState("");
  const [dataLabelId, setDataLabelId] = useState("");
  const [isUpload, setIsUpdate] = useState(false);
  const [source, setSource] = useState("");
  const [fee, setFee] = useState("");
  const [hours, setHours] = useState("");
  const [activeClient, setActiveClient] = useState("");
  const [qualities, setQualities] = useState([]);
  const sources = ["FIV", "UPW", "PPH", "Website", "Direct", "Partner"];
  const [timerId, setTimerId] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isLoad, setIsLoad] = useState(false);
  const [showcolumn, setShowColumn] = useState(false);
  const [showQuickList, setShowQuickList] = useState(false);
  const [qualityData, setQualityData] = useState([]);
  const columnData = [
    "companyName",
    "clientName",
    "Assign",
    "Departments",
    "Hrs",
    "Year_End",
    "Deadline",
    "Job_Date",
    "Status",
    "Job_Status",
    "Owner",
    "Budget",
    "Timer",
    "Comments",
    "Labels",
    "Fee",
    "Source",
    "CC_Person",
    "AC",
    "SignUp_Date",
  ];
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const savedVisibility = JSON.parse(
      localStorage.getItem("columnVisibility")
    );
    return (
      savedVisibility ||
      columnData.reduce((acc, col) => {
        acc[col] = true;
        return acc;
      }, {})
    );
  });

  const toggleColumnVisibility = (column) => {
    const updatedVisibility = {
      ...columnVisibility,
      [column]: !columnVisibility[column],
    };
    setColumnVisibility(updatedVisibility);
    localStorage.setItem("columnVisibility", JSON.stringify(updatedVisibility));
  };

  console.log("qualityData:", qualityData);

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
    "Inactive",
  ];

  // Get Auth Access
  useEffect(() => {
    if (auth.user) {
      const filterAccess = auth.user.role.access
        .filter((role) => role.permission === "Jobs")
        .flatMap((jobRole) => jobRole.subRoles);

      setAccess(filterAccess);
    }
  }, [auth]);

  // Get Timer ID
  useEffect(() => {
    const timeId = localStorage.getItem("jobId");
    setTimerId(JSON.parse(timeId));
  }, [anyTimerRunning]);

  // -----------Total Hours-------->

  useEffect(() => {
    const calculateTotalHours = (data) => {
      return data.reduce((sum, client) => sum + Number(client.totalHours), 0);
    };

    if (active === "All" && !active1) {
      setTotalHours(calculateTotalHours(tableData).toFixed(0));
    } else if (filterData) {
      setTotalHours(calculateTotalHours(filterData).toFixed(0));
    }
  }, [tableData, filterData, active, active1]);

  // ------------Total Fee-------->
  useEffect(() => {
    const calculateTotalFee = (data) => {
      return data.reduce((sum, client) => sum + Number(client.fee), 0);
    };

    if (active === "All") {
      setTotalFee(calculateTotalFee(tableData).toFixed(0));
    } else if (filterData) {
      setTotalFee(calculateTotalFee(filterData).toFixed(0));
    }
  }, [tableData, filterData, active, active1]);

  // ---------------All Client_Job Data----------->
  const allClientJobData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/all/client/job`
      );
      if (data) {
        setTableData(data?.clients);
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

  // -----------Get Client without Showing Loading-------->
  const allClientData = async () => {
    setIsLoad(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/all/client/job`
      );
      if (data) {
        if (active !== "All") {
          setFilterData((prevData) => {
            if (Array.isArray(prevData)) {
              return [...prevData, data.clients];
            }
          });
        }
        setTableData(data?.clients);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    } finally {
      setIsLoad(false);
    }
  };

  // Socket
  useEffect(() => {
    socketId.on("newJob", () => {
      allClientData();
    });

    return () => {
      socketId.off("newJob", allClientData);
    };
    // eslint-disable-next-line
  }, [socketId]);

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
        item.job?.jobStatus === value ||
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

  // Filter by Header Search
  useEffect(() => {
    if (searchValue) {
      const filteredData = tableData.filter(
        (item) =>
          item?.clientName.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.companyName.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilterData(filteredData);
      console.log("SearchData:", filteredData);
    } else {
      setFilterData(tableData);
    }
  }, [searchValue, tableData]);

  // -------------- Filter Data By Department || Status || Jobholder ----------->

  const filterByDepStat = (value, dep) => {
    let filteredData = [];

    if (dep === "All") {
      filteredData = tableData.filter(
        (item) =>
          item.job?.jobStatus === value ||
          item.job.jobHolder === value ||
          getStatus(item.job.jobDeadline, item.job.yearEnd) === value ||
          getStatus(item.job.jobDeadline, item.job.yearEnd) === value
      );
    } else {
      filteredData = tableData.filter((item) => {
        const jobMatches = item.job.jobName === dep;
        const statusMatches = item.job?.jobStatus === value;
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

      setUsers(
        data?.users
          ?.filter((user) =>
            user?.role?.access?.some((item) =>
              item?.permission?.includes("Jobs")
            )
          )
          .map((user) => user.name) || []
      );
      setUsersData(
        data?.users?.filter((user) =>
          user?.role?.access?.some((item) => item?.permission?.includes("Jobs"))
        ) || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();

    // eslint-disable-next-line
  }, []);

  // ------------Update Status Confirmtion------------>
  const handleUpdateTicketStatusConfirmation = (rowId, newStatus) => {
    if (newStatus === "Inactive") {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, mark as Inactive!",
      }).then((result) => {
        if (result.isConfirmed) {
          handleStatusChange(rowId, newStatus);
          Swal.fire(
            "Inactive!",
            "Client status set to inactive successfully!",
            "success"
          );
        }
      });
    } else {
      handleStatusChange(rowId, newStatus);
    }
  };

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
        // Socket
        // socketId.emit("addJob", {
        //   note: "New Task Added",
        // });
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
        // Socket
        // socketId.emit("addJob", {
        //   note: "New Task Added",
        // });
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
        // socketId.emit("addJob", {
        //   note: "New Task Added",
        // });
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
        // Socket
        socketId.emit("addJob", {
          note: "New Task Added",
        });
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
          : type === "currentDate"
          ? { currentDate: date }
          : { workDeadline: date }
      );
      if (data) {
        const clientJob = data.clientJob;
        // Socket
        // socketId.emit("addJob", {
        //   note: "New Task Added",
        // });
        if (filterId || active || active1) {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item._id === jobId ? { ...item, ...clientJob } : item
            )
          );
        }
        setTableData((prevData) =>
          prevData?.map((item) =>
            item._id === jobId ? { ...item, ...clientJob } : item
          )
        );
        toast.success("Date updated successfully!");
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
      clientName: row.clientName || " ",
      companyName: row.companyName || "",
      jobHolder: row.job?.jobHolder || "",
      jobName: row.job?.jobName || "",
      totalHours: row.totalHours || "",
      currentDate: format(new Date(row.currentDate), "dd-MMM-yyyy") || "",
      yearEnd: format(new Date(row.job?.yearEnd), "dd-MMM-yyyy") || "",
      jobDeadline: format(new Date(row.job?.jobDeadline), "dd-MMM-yyyy") || "",
      workDeadline:
        format(new Date(row.job?.workDeadline), "dd-MMM-yyyy") || "",
      jobStatus: row.job?.jobStatus || "",
      lead: row.job?.lead || "",
      label: row.label?.name || "",
      partner: row?.partner || "",
      data: row.data?.name || "",
    }));
  };

  const handleExportData = () => {
    const csvData = flattenData(filterData ? filterData : tableData);
    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
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
        const clientJob = data.job;
        if (filterId || active || active1) {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item._id === id ? { ...item, ...clientJob } : item
            )
          );
        }
        setTableData((prevData) =>
          prevData?.map((item) =>
            item._id === id ? { ...item, ...clientJob } : item
          )
        );

        if (name) {
          toast.success("label added!");
        } else {
          toast.success("label updated!");
        }

        // Socket
        // socketId.emit("addJob", {
        //   note: "New Task Added",
        // });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while add label");
    }
  };

  // Add Data
  const addDatalabel1 = async (id, labelId) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/add/job/data/${id}`,
        { labelId }
      );
      if (data) {
        const clientJob = data.job;
        console.log("ClientJob:", clientJob);

        if (filterId || active || active1) {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item._id === clientJob._id ? { ...item, ...clientJob } : item
            )
          );
        }

        setTableData((prevData) =>
          prevData?.map((item) =>
            item._id === clientJob._id ? { ...item, ...clientJob } : item
          )
        );

        toast.success("Data label Updated!");

        // Socket
        socketId.emit("addJob", {
          note: "New Task Added",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while add label");
    }
  };

  //  --------------Table Columns Data--------->
  const columns = useMemo(
    () => {
      const allColumns = [
        {
          id: "companyName",
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
                className="cursor-pointer flex items-center justify-start text-[#0078c8] hover:text-[#0053c8] w-full h-full"
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
          id: "clientName",
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
          Cell: ({ cell, row }) => {
            const clientName = row.original.clientName;
            const regNo = row.original.regNumber || "";
            // console.log("regNo:", row.original);

            return (
              <Link
                to={
                  regNo
                    ? `https://find-and-update.company-information.service.gov.uk/company/${regNo}`
                    : "#"
                }
                target="_black"
                className={`cursor-pointer flex items-center justify-start ${
                  regNo && "text-[#0078c8] hover:text-[#0053c8]"
                }   w-full h-full`}
              >
                {clientName}
              </Link>
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
          id: "Assign",
          accessorKey: "job.jobHolder",
          Header: ({ column }) => {
            const user = auth?.user?.name;
            useEffect(() => {
              column.setFilterValue(user);

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
          id: "Departments",
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
          id: "Hrs",
          accessorKey: "totalHours",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px] w-full items-center justify-center pr-2 ">
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
          id: "Year_End",
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
          id: "Deadline",
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
          id: "Job_Date",
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
              const date = new Date(newDate);
              // Check if the date is valid
              if (isNaN(date.getTime())) {
                toast.error("Please enter a valid date.");
                return;
              }

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
          id: "Status",
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
            return (
              status.toString().toLowerCase() === filterValue.toLowerCase()
            );
          },
          filterSelectOptions: ["Overdue", "Due"],
          filterVariant: "select",
          size: 95,
          minSize: 70,
          maxSize: 120,
          grow: false,
        },

        // ----------Job Status----->

        {
          id: "Job_Status",
          accessorKey: "jobStatus",
          accessorFn: (row) => row.job?.jobStatus || "",
          Header: ({ column }) => {
            const jobStatusOptions = [
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
            }, []);

            return (
              <div className="flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => column.setFilterValue("")}
                >
                  Job Status
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] ml-1 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {jobStatusOptions.map((status, i) => (
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
                  handleUpdateTicketStatusConfirmation(
                    row.original._id,
                    e.target.value
                  )
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
                <option value="Inactive">Inactive</option>
              </select>
            );
          },
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
            "Inactive",
          ],
          filterVariant: "select",
          size: 110,
          grow: false,
        },

        //
        {
          id: "Owner",
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
          id: "Budget",
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
          id: "Timer",
          accessorKey: "timertracker",
          Header: ({ column }) => {
            const [isRunning, setIsRunning] = useState(false);

            const handleCheckboxChange = () => {
              const newIsRunning = !isRunning;
              setIsRunning(newIsRunning);

              if (newIsRunning) {
                column.setFilterValue(timerId || jid);
              } else {
                column.setFilterValue(undefined);
              }
            };
            return (
              <div className=" flex flex-col gap-[2px]  ml w-[5rem]">
                <span className="w-full text-center ">Timer</span>
                <div className="w-full flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="cursor-pointer h-5 w-5 ml-3 accent-orange-600"
                    checked={isRunning}
                    onChange={handleCheckboxChange}
                  />
                  <label className="ml-2 text-sm cursor-pointer"></label>
                </div>
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
          filterFn: (row, columnId, filterValue) => {
            const cellValue = row.original._id;
            console.log("T_ID:", filterValue, cellValue);
            return cellValue === filterValue;
          },
          filterVariant: "select",
          size: 90,
        },
        {
          id: "Comments",
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
          id: "Labels",
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
          size: 140,
          minSize: 100,
          maxSize: 210,
          grow: false,
        },

        // Source
        // || auth?.user?.role.access.some((item)=>)
        ...(auth?.user?.role?.name === "Admin" || access.includes("Fee")
          ? [
              {
                id: "Fee",
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
                id: "Source",
                accessorKey: "source",
                Header: ({ column }) => {
                  const sources = [
                    "FIV",
                    "UPW",
                    "PPH",
                    "Website",
                    "Direct",
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
                id: "CC_Person",
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
                        CC Person
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

        // ----Client Type showcolumn ---->
        ...(auth?.user?.role?.name === "Admin"
          ? [
              {
                id: "AC",
                accessorKey: "activeClient",
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
                        AC
                      </span>
                      <select
                        value={column.getFilterValue() || ""}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                      >
                        <option value="">Select</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  );
                },

                Cell: ({ cell, row }) => {
                  const active = row.original.activeClient || "";

                  return (
                    <div className="w-full flex items-start capitalize">
                      {active ? active : ""}
                    </div>
                  );
                },

                filterFn: (row, columnId, filterValue) => {
                  const labelName = row.original?.activeClient || "";
                  return labelName === filterValue;
                },

                filterVariant: "select",
                size: 50,
                minSize: 70,
                maxSize: 120,
                grow: false,
              },
              //  Current Date
              {
                id: "SignUp_Date",
                accessorKey: "currentDate",
                Header: ({ column }) => {
                  const [filterValue, setFilterValue] = useState("");
                  const [customDate, setCustomDate] = useState(
                    getCurrentMonthYear()
                  );

                  useEffect(() => {
                    if (filterValue === "Custom Date") {
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
                        SignUp Date
                      </span>
                      {filterValue === "Custom Date" ? (
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
                          {column.columnDef.filterSelectOptions.map(
                            (option, idx) => (
                              <option key={idx} value={option}>
                                {option}
                              </option>
                            )
                          )}
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

                  const [showInput, setShowInput] = useState(false);

                  const handleDateChange = (newDate) => {
                    const parsedDate = new Date(newDate);
                    if (isNaN(parsedDate.getTime())) {
                      toast.error("Please enter a valid date.");
                      return;
                    }
                    setDate(newDate);
                    handleUpdateDates(row.original._id, newDate, "currentDate");
                    setShowInput(false);
                  };

                  return (
                    <div className="w-full">
                      {!showInput ? (
                        <p onDoubleClick={() => setShowInput(true)}>
                          {format(new Date(date), "dd-MMM-yyyy")}
                        </p>
                      ) : (
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          onBlur={(e) => handleDateChange(e.target.value)}
                          className="h-[2rem] w-full cursor-pointer text-center rounded-md border border-gray-200 outline-none"
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

                  const today = new Date();

                  switch (filterValue) {
                    case "Today":
                      return cellDate.toDateString() === today.toDateString();
                    case "Tomorrow":
                      const tomorrow = new Date(today);
                      tomorrow.setDate(today.getDate() + 1);
                      return (
                        cellDate.toDateString() === tomorrow.toDateString()
                      );
                    case "Last 7 days":
                      const last7Days = new Date(today);
                      last7Days.setDate(today.getDate() - 7);
                      return cellDate >= last7Days && cellDate <= today;
                    case "Last 15 days":
                      const last15Days = new Date(today);
                      last15Days.setDate(today.getDate() - 15);
                      return cellDate >= last15Days && cellDate <= today;
                    case "Last 30 Days":
                      const last30Days = new Date(today);
                      last30Days.setDate(today.getDate() - 30);
                      return cellDate >= last30Days && cellDate <= today;
                    case "Last 12 months":
                      const lastYear = new Date(today);
                      lastYear.setFullYear(today.getFullYear() - 1);
                      return cellDate >= lastYear && cellDate <= today;
                    // case "Custom Date":
                    //   const [year, month] = filterValue.split("-");
                    //   return (
                    //     cellDate.getFullYear() === parseInt(year) &&
                    //     cellDate.getMonth() === parseInt(month) - 1
                    //   );
                    default:
                      return false;
                  }
                },
                filterSelectOptions: [
                  "Today",
                  "Tomorrow",
                  "Last 7 days",
                  "Last 15 days",
                  "Last 30 Days",
                  "Last 12 months",
                  "Custom Date",
                ],
                filterVariant: "select",
                size: 115,
                minSize: 80,
                maxSize: 140,
                grow: false,
              },
            ]
          : []),
      ];
      return allColumns.filter((col) => columnVisibility[col.id]);
    },
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
      isLoad,
      showcolumn,
      columnVisibility,
    ]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
  };

  const table = useMaterialReactTable({
    columns,
    data:
      active === "All" && !active1 && !filterId && !searchValue
        ? tableData
        : filterData,
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
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    // enableEditing: true,
    // state: { isLoading: loading },

    enablePagination: true,
    initialState: {
      pagination: { pageSize: 30 },
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
        // border: "1px solid rgba(81, 81, 81, .5)",
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

  // -------Update Bulk Jobs------------->

  const updateBulkJob = async (e) => {
    e.preventDefault();
    setIsUpdate(true);

    const filteredTasks = qualityData.filter(
      (item) => item.type === qualities.label
    );

    // Map to extract labels
    const qualityLabels = filteredTasks.map((item) => item.task);

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/bulk/job`,
        {
          rowSelection: Object.keys(rowSelection).filter(
            (id) => rowSelection[id] === true
          ),
          jobHolder,
          lead,
          yearEnd,
          jobDeadline,
          currentDate,
          jobState,
          label,
          dataLabelId,
          source,
          fee,
          totalHours: hours,
          activeClient,
          qualities: qualityLabels,
        }
      );

      if (data) {
        allClientJobData();
        setIsUpdate(false);
        setShowEdit(false);
        setRowSelection({});
        setJobHolder("");
        setLead("");
        setYearEnd("");
        setCurrentDate("");
        setJobDeadline("");
        setJobState("");
        setLabel("");
        setDataLabelId("");
        setSource("");
        setFee("");
        setHours("");
        setActiveClient("");
        setQualities([]);
      }
    } catch (error) {
      setIsUpdate(false);
      console.log(error?.response?.data?.message);
      toast.error("Something went wrong!");
    } finally {
      setIsUpdate(false);
    }
  };

  const renderColumnControls = () => (
    <div className="flex flex-wrap gap-3 bg-white rounded-md  border p-4">
      {Object.keys(columnVisibility)?.map((column) => (
        <div key={column} className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={columnVisibility[column]}
              onChange={() => toggleColumnVisibility(column)}
              className="mr-2 accent-orange-600 h-4 w-4"
            />
            {column}
          </label>
        </div>
      ))}
    </div>
  );

  //  -----------Handle drag end---------
  const handleUserOnDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) return;

    const newTodos = Array.from(usersData);
    const [movedTodo] = newTodos.splice(source.index, 1);
    newTodos.splice(destination.index, 0, movedTodo);

    setUsersData(newTodos);

    handleReorderingUsers(newTodos);
  };
  // Handle Reordering
  const handleReorderingUsers = async (newTodos) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/user/reordering`,
        { usersData: newTodos }
      );
      if (data) {
        toast.success("Reordering successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // Get All Quality Check
  const getQuickList = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/quicklist/get/all`
      );
      if (data) {
        setQualityData(data.qualityChecks);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getQuickList();

    // eslint-disable-next-line
  }, []);
  const groupedData = qualityData?.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const qualityOptions = Object.entries(groupedData).map(([type, items]) => ({
    value: type,
    label: type,
  }));

  return (
    <Layout>
      <div className="w-full h-[100%] py-4 px-2 sm:px-4 overflow-y-auto ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              {showCompleted && activeBtn === "completed"
                ? "Completed Job's"
                : showInactive && activeBtn === "inactive"
                ? "Inactive Jobs"
                : "Jobs"}
            </h1>

            <span
              className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
              onClick={() => {
                setActive("All");
                // setActiveBtn("");
                // setShowStatus(false);
                // setShowJobHolder(false);
                // setShowDue(false);
                // setActive1("");
                setFilterId("");
                handleClearFilters();
                setSearchValue("");
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6 text-white" />
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
                } !bg-gray-100 !shadow-none text-black hover:bg-orange-500 text-[15px] ${
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
              className={`px-4 h-[2.2rem] flex items-center justify-center gap-1 rounded-md hover:shadow-md text-gray-800 bg-sky-100 hover:text-white hover:bg-sky-600 text-[15px] `}
              onClick={handleExportData}
              title="Export Date"
            >
              <LuImport className="h-6 w-6 " /> Export
            </button>
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowQuickList(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Quality List
            </button>
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowDataLable(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Data
            </button>
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowlabel(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Label
            </button>
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
        <div className="flex items-center flex-wrap gap-2 mt-6">
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
                  setShowInactive(false);
                  setActive1("");
                  setFilterId("");
                  active === "All" && allClientData();
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
          <div
            className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
              activeBtn === "inactive" &&
              showInactive &&
              " border-2 border-b-0 text-orange-600 border-gray-300"
            }`}
            onClick={() => {
              setActiveBtn("inactive");
              setShowInactive(true);
              setActive("");
            }}
          >
            Inactive
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
          {/* Edit Multiple Job */}
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
              showEdit && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setShowEdit(!showEdit);
            }}
            title="Edit Multiple Jobs"
          >
            <MdOutlineModeEdit className="h-6 w-6  cursor-pointer" />
          </span>
          {/* Hide & Show */}
          <div className="relative">
            <div
              className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
                showcolumn && "bg-orange-500 text-white"
              }`}
              onClick={() => setShowColumn(!showcolumn)}
            >
              {showcolumn ? (
                <GoEyeClosed className="text-[22px]" />
              ) : (
                <GoEye className="text-[22px]" />
              )}
            </div>
            {showcolumn && (
              <div className="absolute top-10 right-8 z-50">
                {renderColumnControls()}
              </div>
            )}
          </div>
          {/* Refresh */}
          <span
            className={` p-[6px] rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
            onClick={() => {
              allClientData();
              // setActive("All");
              // setActiveBtn("");
              // setShowStatus(false);
              // setShowJobHolder(false);
              // setShowDue(false);
              // setActive1("");
              setFilterId("");
            }}
            title="Refresh Data"
          >
            <GrUpdate
              className={`h-5 w-5  cursor-pointer ${
                isLoad && "animate-spin text-sky-500"
              }`}
            />
          </span>
        </div>
        {/*  */}
        <hr className="mb-1 bg-gray-200 w-full h-[1px]" />

        {/* Update Bulk Jobs */}
        {showEdit && (
          <div className="w-full  py-2">
            <form
              onSubmit={updateBulkJob}
              className="w-full flex items-center flex-wrap gap-2 "
            >
              <div className="">
                <select
                  value={jobHolder}
                  onChange={(e) => setJobHolder(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "7rem" }}
                >
                  <option value="empty">Assign</option>
                  {users.map((jobHold, i) => (
                    <option value={jobHold} key={i}>
                      {jobHold}
                    </option>
                  ))}
                </select>
              </div>
              <div className="">
                <select
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "7rem" }}
                >
                  <option value="empty">Owner</option>
                  {users.map((jobHold, i) => (
                    <option value={jobHold} key={i}>
                      {jobHold}
                    </option>
                  ))}
                </select>
              </div>
              <div className="inputBox" style={{ width: "8.5rem" }}>
                <input
                  type="date"
                  value={yearEnd}
                  onChange={(e) => setYearEnd(e.target.value)}
                  className={`${style.input} w-full `}
                />
                <span>Year End</span>
              </div>
              <div className="inputBox" style={{ width: "8.5rem" }}>
                <input
                  type="date"
                  value={jobDeadline}
                  onChange={(e) => setJobDeadline(e.target.value)}
                  className={`${style.input} w-full `}
                />
                <span>Job Deadline</span>
              </div>
              <div className="inputBox" style={{ width: "8.5rem" }}>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className={`${style.input} w-full `}
                />
                <span>Job Date</span>
              </div>
              {/*  */}
              <div className="">
                <select
                  value={jobState}
                  onChange={(e) => setJobState(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "6.5rem" }}
                >
                  <option value="empty">Status</option>
                  {status.map((stat, i) => (
                    <option value={stat} key={i}>
                      {stat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="">
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "9rem" }}
                >
                  <option value="empty">Select Label</option>
                  {labelData?.map((label, i) => (
                    <option value={label._id} key={i}>
                      {label?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="">
                <select
                  value={dataLabelId}
                  onChange={(e) => setDataLabelId(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "9rem" }}
                >
                  <option value="empty">Select Data</option>
                  {dataLable?.map((data, i) => (
                    <option value={data?._id} key={i}>
                      {data?.name}
                    </option>
                  ))}
                </select>
              </div>
              {(auth?.user?.role?.name === "Admin" ||
                access.includes("Fee")) && (
                <div className="inputBox" style={{ width: "6rem" }}>
                  <input
                    type="text"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className={`${style.input} w-full `}
                  />
                  <span>Fee</span>
                </div>
              )}
              {auth?.user?.role?.name === "Admin" && (
                <div className="inputBox" style={{ width: "6rem" }}>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className={`${style.input} w-full `}
                  />
                  <span>Hours</span>
                </div>
              )}

              {(auth?.user?.role?.name === "Admin" ||
                access.includes("Source")) && (
                <div className="">
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className={`${style.input} w-full`}
                    style={{ width: "8rem" }}
                  >
                    <option value="">Source</option>
                    {sources.map((sou, i) => (
                      <option value={sou} key={i}>
                        {sou}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="">
                <select
                  value={activeClient}
                  onChange={(e) => setActiveClient(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "6rem" }}
                >
                  <option value="empty">Select Client</option>

                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className=" z-[999]">
                <Select
                  options={qualityOptions}
                  value={qualities}
                  onChange={setQualities}
                  // isMulti
                  placeholder="Quality Check"
                  className="min-w-[8rem]"
                />
              </div>

              <div className="flex items-center justify-end pl-4">
                <button
                  className={`${style.button1} text-[15px] `}
                  type="submit"
                  disabled={isUpload}
                  style={{ padding: ".5rem 1rem" }}
                >
                  {isUpload ? (
                    <TbLoader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </form>
            <hr className="mb-1 bg-gray-300 w-full h-[1px] mt-4" />
          </div>
        )}

        {/* ----------Job_Holder Summery Filters---------- */}
        {showJobHolder && activeBtn === "jobHolder" && (
          <>
            {/* <div className="w-full  py-2 ">
              <div className="flex items-center flex-wrap gap-4">
                {users
                  ?.filter((user) => getJobHolderCount(user, active) > 0)
                  .map((user, i) => (
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
            </div> */}
            <div className="w-full  py-2 ">
              <div className="flex items-center flex-wrap gap-4">
                <DragDropContext onDragEnd={handleUserOnDragEnd}>
                  <Droppable droppableId="users" direction="horizontal">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex items-center gap-2 flex-wrap"
                      >
                        {usersData
                          ?.filter(
                            (user) => getJobHolderCount(user.name, active) > 0
                          )
                          ?.map((user, index) => (
                            <Draggable
                              key={user._id}
                              draggableId={user._id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                                    active1 === user?.name &&
                                    "  border-b-2 text-orange-600 border-orange-600"
                                  }`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => {
                                    setActive1(user?.name);
                                    filterByDepStat(user?.name, active);
                                  }}
                                >
                                  {user?.name} (
                                  {getJobHolderCount(user?.name, active)})
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
          </>
        )}

        {/* ----------Date Status Summery Filters---------- */}
        {showDue && activeBtn === "due" && (
          <>
            <div className="w-full py-2">
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

        {showCompleted && activeBtn === "completed" ? (
          <div className="w-full min-h-screen relative">
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
        ) : showInactive && activeBtn === "inactive" ? (
          <div className="w-full min-h-screen relative">
            <InactiveClients
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
        ) : (
          <>
            {loading ? (
              <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                <Loader />
              </div>
            ) : (
              <div className="w-full min-h-[20vh] relative ">
                <div className="h-full overflow-y-auto relative">
                  <MaterialReactTable table={table} />
                </div>
              </div>
            )}
          </>
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
          <NewJobModal
            setIsOpen={setIsOpen}
            allClientJobData={allClientJobData}
          />
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
            allClientJobData={allClientJobData}
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

      {/* ---------------Add label------------- */}
      {showlabel && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
          <AddLabel
            setShowlabel={setShowlabel}
            type={"job"}
            getLabels={getlabel}
          />
        </div>
      )}

      {/* ---------------Add Data label------------- */}
      {showDataLable && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
          <AddDataLabel
            setShowDataLable={setShowDataLable}
            getDatalable={getDatalable}
          />
        </div>
      )}

      {/* ---------------Add Quick List------------- */}
      {showQuickList && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
          <HandleQualityModal
            setShowQuickList={setShowQuickList}
            getQuickList={getQuickList}
          />
        </div>
      )}
    </Layout>
  );
}
