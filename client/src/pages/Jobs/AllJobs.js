import React, { useEffect, useMemo, useRef, useState } from "react";
 
import { style } from "../../utlis/CommonStyle";
import NewJobModal from "../../components/Modals/NewJobModal";
 
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {  format, formatISO } from "date-fns";
import {  MdInsertComment } from "react-icons/md";
import toast from "react-hot-toast";
 
import Loader from "../../utlis/Loader";
import {   TbLoader2 } from "react-icons/tb";
import { IoClose, IoTicketOutline } from "react-icons/io5";
import JobDetail from "./JobDetail";
import { IoBriefcaseOutline } from "react-icons/io5";
import { MdDriveFileMoveOutline } from "react-icons/md";
import { Timer } from "../../utlis/Timer";
import JobCommentModal from "./JobCommentModal";
import { MdAutoGraph } from "react-icons/md";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { TbLoader } from "react-icons/tb";
import { Box, Button, LinearProgress,   Popover, Typography } from "@mui/material";
import { MdOutlineModeEdit } from "react-icons/md";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { IoIosCheckmarkCircleOutline, IoMdDownload } from "react-icons/io";
import { GoCheckCircleFill, GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
 
import CompletedJobs from "./CompletedJobs";
 
import { GrUpdate } from "react-icons/gr";
import AddLabel from "../../components/Modals/AddLabel";
import { LuImport } from "react-icons/lu";
import AddDataLabel from "../../components/Modals/AddDataLabel";
import InactiveClients from "./InactiveClients";
import Swal from "sweetalert2";
import HandleQualityModal from "../../components/Modals/HandleQualityModal";
import TicketsPopUp from "../../components/shared/TicketsPopUp";
 
import { BsPersonCheckFill } from "react-icons/bs";
import QuickAccess from "../../utlis/QuickAccess";
import { filterByRowId } from "../../utlis/filterByRowId";
import CompanyInfo from "../../utlis/CompanyInfo";
import { FiPlusSquare } from "react-icons/fi";
import NewTicketModal from "../../utlis/NewTicketModal";
import DateRangePopover from "../../utlis/DateRangePopover";
import { DateFilterFn } from "../../utlis/DateFilterFn";
import { useDispatch, useSelector } from "react-redux";
 
import { setFilterId, setSearchValue } from "../../redux/slices/authSlice";
import { useSocket } from "../../context/socketProvider";
import { getJobsColumns } from "./table/columns";
import OverviewForPages from "../../utlis/overview/OverviewForPages";
import { isAdmin } from "../../utlis/isAdmin";
import { SubtaskListManager } from "./SubtaskListManager";
import OutsideFilter from "./utils/OutsideFilter";
import { usePersistedUsers } from "../../hooks/usePersistedUsers";
import SelectedUsers from "../../components/SelectedUsers";
 
 
 



 

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
 
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.auth);
  const filterId = useSelector((state) => state.auth.filterId);
  const searchValue = useSelector((state) => state.auth.searchValue);
  const jid = useSelector((state) => state.auth.jid);
  const anyTimerRunning = useSelector((state) => state.auth.anyTimerRunning);

   
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

    const [isSubmitting, setIsSubmitting] = useState(false);


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
  const [showSubtaskList, setShowSubtaskList] = useState(false);
  const [dataLable, setDataLabel] = useState([]);
  const [totalFee, setTotalFee] = useState(0);
  const [totalClientPaidFee, setTotalClientPaidFee] = useState(0);
  const [activity, setActivity] = useState("Chargeable");
  const [isNonChargeable, setIsNonChargeable] = useState(false);
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
  const [clientType, setClientType] = useState("");
  const [fee, setFee] = useState("");
  const [hours, setHours] = useState("");
  const [activeClient, setActiveClient] = useState("");
  const [qualities, setQualities] = useState([]);
  const sources = ["FIV", "UPW", "PPH", "Website", "Direct", "Partner"];
  const ctypes = ["Limited", "LLP", "Individual", "Non UK"];
  const [timerId, setTimerId] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [showUniqueClients, setShowUniqueClients] = useState(false);
  const [isLoad, setIsLoad] = useState(false);





  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

   const [clientCompanyName, setClientCompanyName] = useState("");
 
 











  const [showcolumn, setShowColumn] = useState(false);
    const boxRef = useRef(null);
  const [showQuickList, setShowQuickList] = useState(false);
  const [qualityData, setQualityData] = useState([]);
  const columnData = [
    "jobRef",
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
    // "Comments",
    "Labels",
    "Fee",
    "Source",
    "ClientType",
    "POC",
    "AC",
    "SignUp_Date",
    "Actions",
    "Partner"
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

 
      const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 30, // ✅ default page size
      });


    const [searchParams] = useSearchParams();
    const comment_taskId = searchParams.get('comment_taskId');
      const show_completed = searchParams.get("completed");
      const navigate = useNavigate();



      const { selectedUsers, setSelectedUsers, toggleUser, resetUsers, } = usePersistedUsers("jobs:selected_users", users);











      
          const socket  = useSocket();
      
      
            useEffect(() => {
      
      
              if (!socket) return;
              console.log("Socket reg ⛔🆘🆘🅾🅾🅾🆑🆑🆎🆎🆎🅱🅱🅰🅰🅰🅰🈲🈵🈵🈴🈴㊗㊗㊗㊙㊙🉐🉐🉐💮💮🉑")
              socket.on('job_updated', () => {
                console.log("Job UPDATED ⛔🆘🆘🅾🅾🅾🆑🆑🆎🆎🆎🅱🅱🅰🅰🅰🅰🈲🈵🈵🈴🈴㊗㊗㊗㊙㊙🉐🉐🉐💮💮🉑")
      
                allClientData()
              })
            }, [socket])




  
    // useEffect(() => {
    //   if (comment_taskId) {
    //     setJobId(comment_taskId);
    //     setIsComment(true);

    //     setRowSelection(prev => {
    //     return {
    //       ...prev,
    //       [comment_taskId]:true
    //     }
    //   })

      
    // searchParams.delete("comment_taskId");
    // navigate({ search: searchParams.toString() }, { replace: true });

    //   }
  
    // }, [comment_taskId, searchParams, navigate]);





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

  const dateStatus = ["Due", "Overdue", "Upcoming"];

  const status = [
    "Quote",
    "Data",
    "Progress",
    "Queries",
    "Approval",
    "Submission",
    "Billing",
    "Feedback",
    "Inactive",
    
  ];


 
 
  const [isMoving, setIsMoving] = useState(false)

  // Move to Job Handler
  const moveJobToLead = async (client) => {
    

    // Get today's date
    const today = new Date();

    // Add one month to today's date
    // const nextMonthDate = addMonths(today, 1);

    // Format the new date to ISO format (including the time and timezone)
    const followUpDate = formatISO(today);

    try {
      setIsMoving(true)
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/create/lead`,
        { 
          companyName: client.companyName,
          clientName: client.clientName,
          jobHolder: client.job?.jobHolder,
          department: client.job?.jobName,
          source: client.source || "",
          brand: "Affotax",
          lead_Source: "CRM",
          followUpDate: followUpDate,
          JobDate: client.job.workDeadline,   // it is actually a job date 
          Note: '',
          stage: "",
          value: "",
          number: "",

          yearEnd: client.job.yearEnd,
          jobDeadline: client.job.jobDeadline


        }
      );


      if (data) {
        
        toast.success("Job Moved to Lead Successfully!💚");

        const result = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/client/jobActivity/${client._id}`, { activityText : "moved this job to Leads!", });


        // Options for formatting
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, };
        const date = new Date();
        const formattedDate = date.toLocaleString('en-US', options);

        const result2 = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/activies/create`, {

          activityText : "moved this job to Leads!",
          entity: "Jobs",
          details: `Job Details:
          - Company Name: ${client.companyName}
          - Job Client: ${client.clientName || "No client provided"}
          - Created At: ${formattedDate}`

        });















          // const res = await axios.delete(
          //   `${process.env.REACT_APP_API_URL}/api/v1/client/delete/job/${client._id}`
          // );
          // if (res.data) {
          //   const filterData = tableData.filter((item) => item._id !== client._id);
          //   setTableData(filterData);
          // }
        
 


      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsMoving(false)
    }



  }












  

  useEffect(() => {
  const handleKeyDown = (e) => {

    if (e.key === "Escape") {
      
      setShowDetail(false)
      
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);







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

  // useEffect(() => {
  //   const calculateTotalHours = (data) => {
  //     return data.reduce((sum, client) => sum + Number(client.totalHours), 0);
  //   };

  //   if (active === "All" && !active1) {
  //     setTotalHours(calculateTotalHours(tableData).toFixed(0));
  //   } else if (filterData) {
  //     setTotalHours(calculateTotalHours(filterData).toFixed(0));
  //   }
  // }, [tableData, filterData, active, active1]);

  // ------------Total Fee-------->
  // useEffect(() => {
  //   const calculateTotalFee = (data) => {
  //     return data.reduce((sum, client) => sum + Number(client.fee), 0);
  //   };

  //   console.log("USE EFFECT RUN FOR THE FEE CALCULATE< ", filterData)
  //   if (active === "All") {
  //     setTotalFee(calculateTotalFee(tableData).toFixed(0));
  //   } else if (filterData) {
  //     setTotalFee(calculateTotalFee(filterData).toFixed(0));
  //   }
  // }, [tableData, filterData, active, active1]);




  const getUniqueClients = (clients) => {

    
      const uniqueClientsMap = new Map();

      clients.forEach(client => {
        // Use   companyName as a unique identifier
        const key = `${client.companyName.trim().toLowerCase()}`;
        if (!uniqueClientsMap.has(key)) {


          uniqueClientsMap.set(key, client);
        }
      });

      const uniqueClients = Array.from(uniqueClientsMap.values());

      console.log("UNIQUE CLIENTS:",uniqueClients);


      // setTableData(uniqueClients);
      return uniqueClients;



  }



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

    if(showUniqueClients) {
      setTableData(prev => {
        return getUniqueClients(prev)
      })
      
    } else {
      console.log("THE FIRST USEEFFECT MOUNT💛💛💛🧡🧡")
      allClientJobData();
    }


  }, [showUniqueClients])



  // useEffect(() => {
  //   allClientJobData();
  //   // eslint-disable-next-line
  // }, []);

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
  // useEffect(() => {
  //   socketId.on("newJob", () => {
  //     allClientData();
  //   });

  //   return () => {
  //     socketId.off("newJob", allClientData);
  //   };
     
  // }, [socketId]);

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

  console.log("THE TABLE DATA IS>>>>>>>🧡🧡🧡🧡🧡🧡🧡🧡🧡❤", tableData)

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
    const upcomingCount = filteredData.filter(
      (item) => getStatus(item.job.jobDeadline, item.job.yearEnd) === "Upcoming"
    ).length;

    return { due: dueCount, overdue: overdueCount, upcoming: upcomingCount };
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
      // console.log("SearchData:", filteredData);
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

  // Update Filter
  // useEffect(() => {
  //   filterByDepStat(active1, active);

  //   // eslint-disable-next-line
  // }, [tableData, filterData, active1, active]);

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





















  
  // ---------------Handle Update Fee ---------->
  const updateActiveClient = async (rowId, newValue) => {


    if (!rowId) {
      return toast.error("Job id is required!");
    }
    try {
      const { data } = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/activeClient/${rowId}`,
        {
          activeClient: newValue,
        }
      );

       
      if (data) {
        if (filterId || active || active1) {
          setFilterData((prevData) => {
             

            return  prevData?.map((item) =>
              item._id === rowId
                ? { ...item, activeClient: newValue }
                : item
            )
          }
            
           
          );
        }
        setTableData((prevData) => {

           
          return prevData?.map((item) =>
            item._id === rowId
              ? { ...item, activeClient: newValue }
              : item
          )
        }
          
        );
        toast.success(`Client updated to ${newValue}`);
        
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
  };




  // ---------------Handle Update Fee ---------->
  const handleUpdateFee = async (rowId, fee) => {

    console.log("ROW ID IS", rowId, "& THE FEE IS", fee)
    if (!rowId) {
      return toast.error("Job id is required!");
    }
    try {
      const { data } = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/fee/${rowId}`,
        {
          fee: fee,
        }
      );

      console.log("THE DATE RECEIVED AFTER THE UPDATE",data)
      if (data) {
        if (filterId || active || active1) {
          setFilterData((prevData) => {
             

            return  prevData?.map((item) =>
              item._id === rowId
                ? { ...item, fee: fee }
                : item
            )
          }
            
           
          );
        }
        setTableData((prevData) => {

           
          return prevData?.map((item) =>
            item._id === rowId
              ? { ...item, fee: fee }
              : item
          )
        }
          
        );
        toast.success("Job Fee updated!");
        
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
        // socketId.emit("notification", {
        //   title: "New Job Assigned",
        //   redirectLink: "/job-planning",
        //   description: data?.notification?.description,
        //   taskId: data?.notification?.taskId,
        //   userId: data?.notification?.userId,
        //   status: "unread",
        // });
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
      return "Upcoming";
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
        // socketId.emit("addJob", {
        //   note: "New Task Added",
        // });
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
//   useEffect(() => {
//      const handleClickOutside = (event) => {

         
//   const clickInside =
//     commentStatusRef.current?.contains(event.target) ||
//     document.querySelector(".MuiPopover-root")?.contains(event.target) || // for MUI Menu
//     document.querySelector(".EmojiPickerReact")?.contains(event.target) || // for emoji picker
//     document.querySelector(".MuiDialog-root")?.contains(event.target); // ✅ For Dialog

//   if (!clickInside) {
//     setIsComment(false);
//   }
// };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);









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
        // console.log("ClientJob:", clientJob);

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
        // socketId.emit("addJob", {
        //   note: "New Task Added",
        // });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while add label");
    }
  };

 


// ----------------------------
// 🔑 Authentication Context
// ----------------------------
const authCtx = useMemo(() => {
  return {
    auth,    
    users,
    access
  }
}, [auth, users, access])


// ----------------------------
// 💬 Comment Context
// ----------------------------
const commentCtx = useMemo(() => {
  return {
    jobId,           
    isComment,        
    comment_taskId,   
    setJobId,         
    setIsComment,     
  }
}, [jobId, isComment, comment_taskId])


// ----------------------------
// 📂 Job Context
// ----------------------------
const jobCtx = useMemo(() => {
  return {
    totalFee,           
    totalHours,         
    dataLable,         
    labelData,
    totalClientPaidFee, 
    showUniqueClients,         
    addJoblabel,        
    setCompanyName,     
    addDatalabel1,     
    getSingleJobDetail, 
    handleUpdateFee,   
    updateActiveClient, 
    handleUpdateDates,  
    setClientCompanyName, 
    setShowNewTicketModal, 
    moveJobToLead,      
    handleUpdateLead,  
    handleUpdateTicketStatusConfirmation, 
    handleUpdateJobHolder  
  }
}, [totalFee, totalHours, dataLable, labelData, totalClientPaidFee, showUniqueClients])


// ----------------------------
// ⏱️ Timer Context
// ----------------------------
const timerCtx = useMemo(() => {
  return {
    timerRef,    
    timerId,      
    jid,          
    play,         
    setPlay,      
    setIsShow,   
    note,        
    currentPath, 
    setNote,     
    activity,     
    setActivity, 

    setIsNonChargeable,
    setIsSubmitting
  }
}, [timerRef, timerId, jid, play, note, currentPath, activity])


// ----------------------------
// 🌐 Global Context (Merged)
// ----------------------------
const ctx = useMemo(() => {
  return {
    ...authCtx,     
    ...commentCtx, 
    ...jobCtx,     
    ...timerCtx,    
  }
}, [authCtx, commentCtx, jobCtx, timerCtx])


 


  const columns = useMemo(() => {



    const allColumns = getJobsColumns(ctx);

    return  allColumns.filter((col) => columnVisibility[col.id] || col.accessorKey === "_id");




  }, [ctx, columnVisibility]);

 


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
    // enableColumnPinning: true,
     
    // enableRowVirtualization: true,
    // enableColumnVirtualization: true,
    onRowSelectionChange: setRowSelection,

    initialState: {
      columnVisibility: {
        _id: false
      }
    },

    renderTopToolbar:() => (
      
      <div style={{ width: '100%' }}>
        {isMoving && (
          <LinearProgress
            sx={{
              width: '100%',
              marginBottom: '16px', // Space between the progress bar and table
               
            }}
          />
        )}
      </div>
    ),

    // enableRowActions: true,

    // renderRowActionMenuItems: ({ closeMenu }) => [
    //   <MenuItem
    //     key={0}
    //     onClick={() => {
    //       // View profile logic...
    //       closeMenu();
    //     }}
    //     sx={{ m: 0 }}
    //   >
    //     <ListItemIcon>
    //       <MdAccountCircle />
    //     </ListItemIcon>
    //     View Profile
    //   </MenuItem>,
    //   <MenuItem
    //     key={1}
    //     onClick={() => {
    //       // Send email logic...
    //       closeMenu();
    //     }}
    //     sx={{ m: 0 }}
    //   >
    //     <ListItemIcon>
    //       <BiSend />
    //     </ListItemIcon>
    //     Send Email
    //   </MenuItem>,
    // ],


     

    // state: { rowSelection,  columnPinning: { right: ['mrt-row-actions'],}  },
    state: { rowSelection,  pagination, density: "compact"  },
    // enableEditing: true,
    // state: { isLoading: loading },

    enablePagination: true,
    // initialState: {
    //   pagination: { pageSize: 30 },
    //   pageSize: 20,
    //   density: "compact",
    //   // columnPinning: {
        
    //   //   right: ['mrt-row-actions'],
    //   // },
    // },

    onPaginationChange: setPagination, // ✅ Hook for page changes

    autoResetPageIndex: false,

    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        backgroundColor: "#E5E7EB",
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
    // console.log(rowSelection)
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
          clientType,
          fee,
          totalHours: hours,
          activeClient,
          // qualities: qualityLabels,
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
        setClientType("");
        setFee("");
        setHours("");
        setActiveClient("");
        // setQualities([]);
      }
    } catch (error) {
      setIsUpdate(false);
      console.log(error?.response?.data?.message);
      toast.error("Something went wrong!");
    } finally {
      setIsUpdate(false);
    }
  };


    const user_jobs_count_map = useMemo(() => {
    return Object.fromEntries(
      users.map((user) => [user, getJobHolderCount(user, active)])
    );
  }, [users, active, getJobHolderCount]);



const renderColumnControls = () => (
  <section className="w-[600px] rounded-lg bg-white border border-slate-200 shadow-sm">
    {/* Header */}
    <header className="px-5 py-3 border-b">
      <h3 className="text-sm font-semibold text-slate-800">
        View settings
      </h3>
    </header>

    {/* Content */}
    <div className="grid grid-cols-2 divide-x">
      {/* LEFT — Columns */}
      <section className="px-5 py-4">
        <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
          Columns
        </h4>

        <ul className="space-y-1 list-decimal">
          {Object.keys(columnVisibility)?.map((column) => (
            <li key={column}>
              <label
                className="flex items-center justify-between rounded-md px-2 py-1.5
                           text-sm text-slate-700 cursor-pointer
                           hover:bg-slate-50 transition"
              >
                <span className="capitalize">{column}</span>
                <input
                  type="checkbox"
                  checked={columnVisibility[column]}
                  onChange={() => toggleColumnVisibility(column)}
                  className="h-4 w-4 accent-orange-600"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* RIGHT — Users */}
      <section className="px-5 py-4">
        <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
          Users
        </h4>

        <div className="h-full overflow-y-auto space-y-1 pr-1">
          <SelectedUsers
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            userNameArr={users}
            countMap={user_jobs_count_map}
            label={"job"}
          />
        </div>
      </section>
    </div>
  </section>
);



    // a little function to help us with reordering the result
    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
    
      return result;
    };
  
  
      //  -----------Handle drag end---------
    const handleUserOnDragEnd = (result) => {
   
      const items = reorder( selectedUsers, result.source.index, result.destination.index );
      localStorage.setItem("jobs_usernamesOrder", JSON.stringify(items));

      console.log("ONHANDLEUSERDRAG END💙💜💙💙💙💙💙💙💙💙💙💙💙💚💙💜💜💙",items )
      setSelectedUsers(items)
  
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












  const tableColumnFilters = table.getState().columnFilters;
useEffect(() => {
  const filteredRows = table.getFilteredRowModel().rows;
  const totalHours = filteredRows.reduce((acc, row) => acc + Number(row.original.totalHours), 0);
  setTotalHours(totalHours.toFixed(0));
  

  if(!showUniqueClients) {
    const filteredRows = table.getFilteredRowModel().rows;
   const totalFee = filteredRows.reduce((acc, row) => acc + Number(row.original.fee), 0);
    setTotalFee(totalFee.toFixed(0));
  }


  if(showUniqueClients) {
    const filteredRows = table.getFilteredRowModel().rows;
    const totalClientPaidFee = filteredRows.reduce((acc, row) => acc + Number(row.original.clientPaidFee || '0'), 0);
    setTotalClientPaidFee(totalClientPaidFee.toFixed(0))
  }

  

}, [tableColumnFilters, table, showUniqueClients, tableData]);

 




 




  const setColumnFromOutsideTable = (colKey, filterVal) => {

    const col = table.getColumn(colKey);

    return col.setFilterValue(filterVal);
  }




  useEffect(() => {


    if(auth.user?.role?.name === "Admin") {

      // console.log("Admin Role Detected, setting showJobHolder to true💛💛🧡🧡");
      setShowJobHolder(true);
      setActiveBtn("jobHolder");

    }



  }, [])









    useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setShowColumn(false);
      }
    };

    if (showcolumn) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showcolumn]);



  







useEffect(() => {
  if (comment_taskId) {
    
    filterByRowId(table, comment_taskId, setJobId, setIsComment);

    // searchParams.delete("comment_taskId");
    // navigate({ search: searchParams.toString() }, { replace: true });
  }
}, [comment_taskId, searchParams, navigate, table]);






  
  useEffect(() => {
    if (show_completed) {

      setActiveBtn("completed");
              setShowCompleted(true);
              setActive("");
    }
  }, [show_completed]);


  return (
    <>
      <div className="w-full h-[100%] py-4 px-2 sm:px-4 overflow-y-auto ">
        <div className="flex items-start sm:items-center sm:justify-between flex-col sm:flex-row gap-3 ">
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
                setActive1("");
                dispatch(setFilterId(""));
                handleClearFilters();
                dispatch(setSearchValue(""));
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6 text-white" />
            </span>
            <QuickAccess />
               {isAdmin(auth) && <span className=" "> <OverviewForPages /> </span>}
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
                } !bg-gray-100 hidden sm:flex !shadow-none text-black hover:bg-orange-500 text-[15px] ${
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
              className={`px-4 h-[2.2rem] hidden sm:flex items-center justify-center gap-1 rounded-md hover:shadow-md text-gray-800 bg-sky-100 hover:text-white hover:bg-sky-600 text-[15px] `}
              onClick={handleExportData}
              title="Export Date"
            >
              <LuImport className="h-6 w-6 " /> Export
            </button>
            {/* <button
              className={`${style.button1} hidden sm:flex text-[15px] `}
              onClick={() => setShowQuickList(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Quality List
            </button> */}
             <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowSubtaskList(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Manage SubtaskList
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
        <div className="flex items-center overflow-x-auto hidden1 gap-2 mt-6 max-lg:hidden">
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
                  dispatch(setFilterId(""));
                  dep === "All" && allClientData();

                  setColumnFromOutsideTable('Departments', (dep === "All" ? "" : dep));

                  
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
              activeBtn === "jobHolder" && showJobHolder && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setActiveBtn("jobHolder");
              setShowJobHolder(prev => !prev);
              setShowStatus(false);
            }}
            title="Filter by Job Holder"
          >
            <IoBriefcaseOutline className="h-6 w-6  cursor-pointer " />
          </span>
          {/* <span
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
          </span> */}
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
              activeBtn === "status" && showStatus && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setActiveBtn("status");
              setShowStatus(prev => !prev);

              setShowJobHolder(false);
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
              <div className="fixed top-[11rem] right-[20%] z-[99] max-h-[80vh] overflow-y-auto hidden1  " ref={boxRef}>
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
              dispatch(setFilterId(""));
            }}
            title="Refresh Data"
          >
            <GrUpdate
              className={`h-5 w-5  cursor-pointer ${
                isLoad && "animate-spin text-sky-500"
              }`}
            />
          </span>



          <div
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
              showUniqueClients && "bg-orange-500 text-white"
            }`}
            title="Clients"
            onClick={() => {

              
            
              // setTableData((prev) => {
              //   return getUniqueClients(prev)
              // })

              
              setShowUniqueClients(prev => !prev);
               
            }}
          >
            <BsPersonCheckFill className="h-6 w-6  cursor-pointer" />
          </div>


        </div>
        {/*  */}
        <hr className="mb-1 bg-gray-200 w-full h-[1px] max-lg:hidden" />

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
                  <option value="empty">Select POC</option>
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
              {auth?.user?.role?.name === "Admin" && (
                <div className="">
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                    className={`${style.input} w-full`}
                    style={{ width: "8rem" }}
                  >
                    <option value="">Client Type</option>
                    {ctypes.map((ct, i) => (
                      <option value={ct} key={i}>
                        {ct}
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
                  style={{ width: "6.4rem" }}
                  title="Select Active Client"
                >
                  <option value="empty">Select AC</option>

                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* <div className=" z-[999]">
                <Select
                  options={qualityOptions}
                  value={qualities}
                  onChange={setQualities}
                  // isMulti
                  placeholder="Quality Check"
                  className="min-w-[8rem]"
                />
              </div> */}

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
            <div className="w-full  py-2 max-lg:hidden">
              <div className="flex items-center flex-wrap gap-4">
                <DragDropContext onDragEnd={handleUserOnDragEnd}>
                  <Droppable droppableId="users" direction="horizontal">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex items-center gap-2 overflow-x-auto hidden1"
                      >
                        {selectedUsers
                          ?.filter(
                            (user) => getJobHolderCount(user, active) > 0
                          )
                          ?.map((user, index) => (
                            <Draggable
                              key={user}
                              draggableId={user}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  className={`py-1 rounded-tl-md rounded-tr-md w-[5.8rem] sm:w-fit px-1 !cursor-pointer font-[500] text-[14px] ${
                                    active1 === user &&
                                    "  border-b-2 text-orange-600 border-orange-600"
                                  }`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => {
                                    setActive1(user);
                                    filterByDepStat(user, active);

                                    setColumnFromOutsideTable("Job_Status", "Progress");
                                    setColumnFromOutsideTable("Assign", user);


                                    if(auth.user?.role === "Admin" && (user === auth.user?.name) ) {
                                      setColumnFromOutsideTable("Job_Date", "Today");
                                    } else {
                                       setColumnFromOutsideTable("Job_Date", "");
                                    }


                                  }}
                                >
                                  {user} (
                                  {getJobHolderCount(user, active)})
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>


                <div className=" border-l px-5 ">

                  <OutsideFilter setColumnFromOutsideTable={setColumnFromOutsideTable} title={"Job_Date"} />
                </div>



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
                  const { due, overdue, upcoming } =
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
                      ) : stat === "Overdue" ? (
                        <span>Overdue {overdue}</span>
                      ) : (
                        <span>Upcoming {upcoming}</span>
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
            <div className="w-full py-2 flex items-center overflow-x-auto hidden1 gap-2 ">
              <div className="flex items-center  gap-4">
                {dateStatus?.map((stat, i) => {
                  const { due, overdue, upcoming } =
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
                      ) : stat === "Overdue" ? (
                        <span>Overdue {overdue}</span>
                      ) : (
                        <span>Upcoming {upcoming}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4">
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
                  <MaterialReactTable table={table}  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ------------Add Client_Job Modal -------------*/}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full min-h-full overflow-y-auto z-[999] bg-gray-100   flex items-center justify-center py-6  px-4">
          {/* <span
            className="absolute  top-[4px] right-[.8rem]  cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-gray-300/70 transition-all duration-150 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <CgClose className="h-5 w-5 text-black" />
          </span> */}

 
          <NewJobModal
            setIsOpen={setIsOpen}
            allClientJobData={allClientJobData}
          />
        </div>
      )}

      {/*---------------Job Details---------------*/}

      {showDetail && (
        // <div className="fixed right-0 top-[3.8rem] z-[999] bg-gray-100 w-[97%] sm:w-[37%] 3xl:w-[26%] h-[calc(103vh-0rem)] py-3 px-3 ">
        //   <div className="flex items-center justify-between">
        //     <h3 className="text-lg font-semibold">Company: {companyName}</h3>
        //     <span
        //       className="p-1 rounded-md bg-gray-50 border  hover:shadow-md hover:bg-gray-100"
        //       onClick={() => setShowDetail(false)}
        //     >
        //       <IoClose className="h-5 w-5 cursor-pointer" />
        //     </span>
        //   </div>
        //   <JobDetail
        //     clientId={clientId}
        //     handleStatus={handleStatusChange}
        //     allClientJobData={allClientJobData}
        //     handleDeleteJob={handleDeleteJob}
        //     users={users}
        //     allClientData={allClientData}
        //   />
        // </div>



            <div className="fixed inset-0 z-[499] flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-gray-100 rounded-xl shadow-lg w-[95%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[70%] 3xl:w-[60%]    py-4 px-5   ">
                <div className="h-full w-full flex flex-col justify-start items-center relative">

                 <div className="flex items-center justify-between border-b px-4 py-2 self-start w-full">
            <h3 className="text-lg font-semibold">Company: {companyName}</h3>
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
              </div>
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
                    disabled={isNonChargeable}
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
                  <button
                    className={`${style.btn} flex items-center justify-center space-x-1`}
                    onClick={handleStopTimer}
                    disabled={isSubmitting} // Optional: disable button while submitting
                  >
                    {isSubmitting ? (
                      <span className="flex space-x-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-150"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-300"></span>
                      </span>
                    ) : (
                      "Submit"
                    )}
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


      {/* ---------------New Ticket Modal------------- */}
      {showNewTicketModal && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
          <NewTicketModal
            setShowSendModal={setShowNewTicketModal}
            
            clientCompanyName={clientCompanyName}
          />
        </div>
      )}

       {/* ---------------New Ticket Modal------------- */}
      {showSubtaskList && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
          <SubtaskListManager
            onApplyList={(subtasks) => console.log(subtasks)}
             onClose={() => setShowSubtaskList(false)}
            />
        </div>
      )}


    </>
  );
}
