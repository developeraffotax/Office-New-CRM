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
import { addMonths, format, formatISO } from "date-fns";
import { MdDriveFileMoveOutline, MdInsertComment } from "react-icons/md";
import toast from "react-hot-toast";
 
import Loader from "../../utlis/Loader";
import { IoClose, IoTicketOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";

 
import JobCommentModal from "../../pages/Jobs/JobCommentModal";
import JobDetail from "../../pages/Jobs/JobDetail";
import CompletedJobs from "../../pages/Jobs/CompletedJobs";
import { Timer } from "../../utlis/Timer";
import Swal from "sweetalert2";
import { LinearProgress, Popover, Typography } from "@mui/material";
import TicketsPopUp from "../shared/TicketsPopUp";
import { useSelector } from "react-redux";
import { getJobsColumns } from "../../pages/Jobs/table/columns";
import NewTicketModal from "../../utlis/NewTicketModal";
 

const Jobs = forwardRef(
  ({ tableData, setTableData, childRef, setIsload }, ref) => {
     



     const auth = useSelector((state => state.auth.auth));
     const anyTimerRunning = useSelector((state => state.auth.anyTimerRunning));
     const jid = useSelector((state => state.auth.jid));
      


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
    const [timerId, setTimerId] = useState("");
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

   const [clientCompanyName, setClientCompanyName] = useState("");

    console.log("filterData:", filterData);

    // Extract the current path
    const currentPath = location.pathname;



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

    //
    useEffect(() => {
      const timeId = localStorage.getItem("jobId");
      setTimerId(JSON.parse(timeId));
    }, [anyTimerRunning]);

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
        calculateTotalFee(
          filterData.length > 0 ? filterData : tableData
        ).toFixed(0)
      );
    }, [tableData, filterData]);

    // -----------Get Client without Showing Loading-------->
    const allClientData = async () => {
      setIsload(true);
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
      } finally {
        setIsload(false);
      }
    };

    useImperativeHandle(childRef, () => ({
      refreshData: allClientData,
    }));

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




















 
  const [isMoving, setIsMoving] = useState(false)

  // Move to Job Handler
  const moveJobToLead = async (client) => {
    

    // Get today's date
    const today = new Date();

    // Add one month to today's date
    const nextMonthDate = addMonths(today, 1);

    // Format the new date to ISO format (including the time and timezone)
    const followUpDate = formatISO(nextMonthDate);

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






















    // ---------------Handle Status Change---------->

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
          if (active) {
            setFilterData((prevData) =>
              prevData?.map((item) =>
                item._id === rowId
                  ? { ...item, job: { ...item.job, lead: newValue } }
                  : item
              )
            );
          }
          setTableData((prevData) =>
            prevData?.map((item) =>
              item._id === rowId
                ? { ...item, job: { ...item.job, lead: newValue } }
                : item
            )
          );
          
          toast.success(`Client updated to ${newValue}`);
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
            : { workDeadline: date }
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
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

 







  // ---------------Handle Update Fee ---------->
  const handleUpdateFee = async (rowId, fee) => {

     
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
        
        setJobId,         
        setIsComment,     
      }
    }, [jobId, isComment, ])
    
    
    // ----------------------------
    // 📂 Job Context
    // ----------------------------
    const jobCtx = useMemo(() => {
      return {
        totalFee,           
        totalHours,         
        dataLable,         
        labelData,
        
        
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
    }, [totalFee, totalHours, dataLable, labelData, ])
    
    
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
    
        return  allColumns;
    
    
    
    
      }, [ctx]);




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
        columnVisibility: { _id: false,  },
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




      muiTableHeadCellProps: {
        style: {
          fontWeight: "600",
          fontSize: "14px",
          background: "#E5E7EB",
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
            <NewJobModal
              setIsOpen={setIsOpen}
              allClientJobData={allClientData}
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


        {/* ---------------New Ticket Modal------------- */}
              {showNewTicketModal && (
                <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
                  <NewTicketModal
                    setShowSendModal={setShowNewTicketModal}
                    
                    clientCompanyName={clientCompanyName}
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
                    <button
                      className={`${style.btn}`}
                      onClick={handleStopTimer}
                    >
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
  }
);

export default Jobs;
