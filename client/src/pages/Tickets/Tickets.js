import React, { useEffect, useMemo, useRef, useState } from "react";
import { MaterialReactTable, useMaterialReactTable, } from "material-react-table";
import Loader from "../../utlis/Loader";
import { format } from "date-fns";
 
import { style } from "../../utlis/CommonStyle";
import { IoBriefcaseOutline, IoClose } from "react-icons/io5";
import SendEmailModal from "../../components/Tickets/SendEmailModal";
import toast from "react-hot-toast";
import axios from "axios";
 
import { MdCheckCircle, MdInsertComment, MdOutlineModeEdit, MdRemoveRedEye, } from "react-icons/md";
import { AiOutlineEdit, AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import { useNavigate, useSearchParams } from "react-router-dom";
import JobCommentModal from "../Jobs/JobCommentModal";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import QuickAccess from "../../utlis/QuickAccess";
import { TbLoader2, TbLogs } from "react-icons/tb";
import { filterByRowId } from "../../utlis/filterByRowId";
import ActivityLogDrawer from "../../components/Modals/ActivityLogDrawer";
import { NumberFilterPortal, NumderFilterFn } from "../../utlis/NumberFilterPortal";
import { TiFilter } from "react-icons/ti";
import { Drawer } from "@mui/material";
import EmailDetailDrawer from "./EmailDetailDrawer";
import { useSelector } from "react-redux";
import { LuRefreshCcw } from "react-icons/lu";
import RefreshTicketsButton from "./ui/RefreshTicketsButton";
import { getTicketsColumns } from "./table/columns";
import OverviewForPages from "../../utlis/overview/OverviewForPages";
import { isAdmin } from "../../utlis/isAdmin";
import DetailComments from "../Tasks/TaskDetailComments"


const updates_object_init = { jobHolder: "", jobStatus: "", jobDate: "", };
const jobStatusOptions = [ "Quote", "Data", "Progress", "Queries", "Approval", "Submission", "Billing", "Feedback", ];
const companyData = ["Affotax", "Outsource"];
const status = ["Read", "Unread", "Send"];


export default function Tickets() {


  const auth = useSelector((state) => state.auth.auth);
 


  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const comment_taskId = searchParams.get("comment_taskId");

  const [showSendModal, setShowSendModal] = useState(false);
  const [emailData, setEmailData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("progress");
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [access, setAccess] = useState([]);

  const [isComment, setIsComment] = useState(false);
  const commentStatusRef = useRef(null);
  const [commentTicketId, setCommentTicketId] = useState("");

  const [showJobHolder, setShowJobHolder] = useState(true);
  const [active1, setActive1] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50, // ✅ default page size
  });

  const [rowSelection, setRowSelection] = useState({});
  const [updates, setUpdates] = useState(updates_object_init);
  const [showEdit, setShowEdit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);


  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [activityDrawerTicketId, setActivityDrawerTicketId] = useState("");



  const anchorRef = useRef(null);

const [filterInfo, setFilterInfo] = useState({
  col: null,
  value: "",
  type: "eq",
});
const [appliedFilters, setAppliedFilters] = useState({});



  const [ticketSubject, setTicketSubject] = useState("")
















  const [ticketId, setTicketId] = useState("")

  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => {
     
    setOpen(newOpen);
  };


  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)

  const isReplyModalOpenCb = (isOpen) => {
    setIsReplyModalOpen(isOpen)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key shortcut
      if (e.key === "Escape") {

        if(!isReplyModalOpen) {
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


  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     // Escape key shortcut
  //     if (e.key === "Escape") {
  //       setOpen(false);
  //       setTicketId("");
  //       setTicketSubject("");
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);













const handleFilterClick = (e, colKey) => {
  e.stopPropagation();
  anchorRef.current = e.currentTarget;
  setFilterInfo({
    col: colKey,
    value: "",
    type: "eq",
  });
};


const handleCloseFilter = () => {
  setFilterInfo({ col: null, value: "", type: "eq" });
  anchorRef.current = null;
};

const applyFilter = (e) => {
  e.stopPropagation()
  const { col, value, type } = filterInfo;
  if (col && value) {
    table.getColumn(col)?.setFilterValue({ type, value: parseFloat(value) });
  }
  handleCloseFilter();
};



 
  // ===== Utility functions =====


  const handle_on_change_update = (e) => {
    setUpdates((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };


  const mergeWithSavedOrder = (fetchedUsernames, savedOrder) => {
    const savedSet = new Set(savedOrder);
    const ordered = savedOrder.filter((name) => fetchedUsernames.includes(name) );
    const newOnes = fetchedUsernames.filter((name) => !savedSet.has(name));
    return [...ordered, ...newOnes];
  };


  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };



  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
  };



  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };



  const handleUserOnDragEnd = (result) => {
    const items = reorder( userName, result.source.index, result.destination.index );
    localStorage.setItem("tickets_usernamesOrder", JSON.stringify(items));
    setUserName(items);
  };



  const getJobHolderCount = (user, status) => {
    if (user === "All") {
      return emailData.length;
    }
    return emailData.filter((ticket) => ticket?.jobHolder === user)?.length;
  };



  const setColumnFromOutsideTable = (colKey, filterVal) => {
    const col = table.getColumn(colKey);
    return col.setFilterValue(filterVal);
  };






  // ===== Functions with api calls =====

  const updateBulkLeads = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

    try {
      const { data } = await axios.put( `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/bulk/tickets`, { rowSelection: selectedIds, updates } );
      if (data) {
        setUpdates(updates_object_init);
        toast.success("Bulk Tickets Updated💚");
        getAllEmails();
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
      toast.error("Something went wrong!");
    } finally {
      setIsUpdating(false);
    }
  };

  
  
  const getAllEmails = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/tickets`
      );
      if (data) {
        setEmailData(data.emails);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };


  
  const getEmails = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/tickets`
      );
      if (data) {
        setEmailData(data.emails);
      }
    } catch (error) {
      console.log(error);
    }
  };


  
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers( data?.users?.filter((user) => user.role?.access?.some((item) => item?.permission?.includes("Tickets") ) ) || [] );

      const userNameArr = data?.users?.filter((user) => user.role?.access.some((item) => item?.permission?.includes("Tickets") ) ).map((user) => user.name);
      setUserName(userNameArr);

      const savedOrder = JSON.parse(localStorage.getItem("tickets_usernamesOrder") || "null");
      if (savedOrder) setUserName(mergeWithSavedOrder(userNameArr, savedOrder));

    } catch (error) {
      console.log(error);
    }
  };


  







  const handleDeleteTicketConfirmation = (ticketId) => {
    Swal.fire({ title: "Are you sure?", text: "You won't be able to revert this!", icon: "warning", showCancelButton: true, confirmButtonColor: "#3085d6", cancelButtonColor: "#d33", confirmButtonText: "Yes, delete it!", })
    .then((result) => {
      if (result.isConfirmed) {
        handleDeleteTicket(ticketId);
        Swal.fire("Deleted!", "Your ticket has been deleted.", "success");
      }
    });
  };

  const handleDeleteTicket = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/delete/ticket/${id}`
      );
      if (data) {
        const filteredData = emailData?.filter((item) => item._id !== id);
        setEmailData(filteredData);

        if (filteredData) {
          const filterData1 = filteredData?.filter((item) => item._id !== id);
          setFilteredData(filterData1);
        }
        getEmails();

        toast.success("Ticket deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };


  





  const updateJobStatus = async (ticketId, status) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
        { jobStatus: status }
      );
      if (data) {
        const updateTicket = data?.ticket;
        toast.success("Status updated successfully!");

        if (filteredData) {
          setFilteredData((prevData) => {
            if (Array.isArray(prevData)) {
              return prevData.map((item) =>
                item._id === updateTicket._id ? updateTicket : item
              );
            } else {
              return [updateTicket];
            }
          });
        }

        setEmailData((prevData) => {
          if (Array.isArray(prevData)) {
            return prevData.map((item) =>
              item._id === updateTicket._id ? updateTicket : item
            );
          } else {
            return [updateTicket];
          }
        });

      
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };


  



  const updateJobHolder = async (ticketId, jobHolder) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
        { jobHolder }
      );
      if (data) {
        const updateTicket = data?.ticket;
        toast.success("Job Holder updated successfully!");
        if (filteredData) {
          setFilteredData((prevData) => {
            if (Array.isArray(prevData)) {
              return prevData.map((item) =>
                item._id === updateTicket._id ? updateTicket : item
              );
            } else {
              return [updateTicket];
            }
          });
        }

        setEmailData((prevData) => {
          if (Array.isArray(prevData)) {
            return prevData.map((item) =>
              item._id === updateTicket._id ? updateTicket : item
            );
          } else {
            return [updateTicket];
          }
        });

        getEmails();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };










  const updateJobDate = async (ticketId, jobDate) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
        { jobDate }
      );
      if (data) {
        const updateTicket = data?.ticket;
        toast.success("Job Date updated successfully!");
        if (filteredData) {
          setFilteredData((prevData) => {
            if (Array.isArray(prevData)) {
              return prevData.map((item) =>
                item._id === updateTicket._id ? updateTicket : item
              );
            } else {
              return [updateTicket];
            }
          });
        }

        setEmailData((prevData) => {
          if (Array.isArray(prevData)) {
            return prevData.map((item) =>
              item._id === updateTicket._id ? updateTicket : item
            );
          } else {
            return [updateTicket];
          }
        });

        getEmails();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };


  








  const handleUpdateTicketStatusConfirmation = (ticketId) => {
    Swal.fire({ title: "Are you sure?", text: "You won't be able to revert this!", icon: "warning", showCancelButton: true, confirmButtonColor: "#3085d6", cancelButtonColor: "#d33", confirmButtonText: "Yes, Complete it!", })
    .then((result) => {
      if (result.isConfirmed) {
        handleStatusComplete(ticketId);
        Swal.fire(
          "Complete!",
          "Your ticket completed successfully!",
          "success"
        );
      }
    });
  };


  const handleStatusComplete = async (ticketId) => {
    if (!ticketId) {
      toast.error("Ticket id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
        { state: "complete" }
      );
      if (data?.success) {
        const updateTicket = data?.ticket;
        toast.success("Status completed successfully!");

        setEmailData((prevData) =>
          prevData.filter((item) => item._id !== updateTicket._id)
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };











  const updateTicketSingleField = async (ticketId, update) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
        update
      );

      if (data) {
        const updatedTicket = data?.ticket;

        setEmailData((prevData) => prevData.map((item) => item._id === updatedTicket._id ? updatedTicket : item ) );

        if (filteredData) setFilteredData((prevData) => prevData.map((item) => item._id === updatedTicket._id ? updatedTicket : item ) );

        toast.success("Ticket updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };


 













  
    // ----------------------------
    // 🔑 Authentication & User Data
    // ----------------------------
    const authCtx = useMemo(
      () => ({
        auth,
        users,
         
      }),
      [auth, users, ]
    );
  
    // ----------------------------
    // 📂 Projects
    // ----------------------------
    const companyCtx = useMemo(
      () => ({
        companyData,
         
      }),
      [companyData]
    );
  
    // ----------------------------
    // 📊 Tasks / Filtering
    // ----------------------------
    const ticketCtx = useMemo(
      () => ({
         
        anchorRef,
        status,
        jobStatusOptions,
        navigate,
        handleFilterClick,
        updateJobStatus,
        updateTicketSingleField,
        updateJobHolder,
        updateJobDate,
        toggleDrawer,
        setTicketId,

         setIsActivityDrawerOpen,
         setActivityDrawerTicketId,
         setCommentTicketId,
         setIsComment,
         handleUpdateTicketStatusConfirmation,
         handleDeleteTicketConfirmation
      }),
      [status, jobStatusOptions,  ]
    );
  
    // ----------------------------
 
 
  
    
  
    // ----------------------------
    // 📦 Merge into one ctx if needed
    // ----------------------------
    const ctx = useMemo(
      () => ({
        ...authCtx,
        ...ticketCtx,
        ...companyCtx,
         
        
      }),
      [authCtx, ticketCtx, companyCtx  ]
    );
  
    // ----------------------------
    // 📑 Columns
    // ----------------------------
    const columns = useMemo(() => getTicketsColumns(ctx), [ctx]);










 

  const table = useMaterialReactTable({
    columns,
    data: emailData || [],
    enableStickyHeader: true,
    enableStickyFooter: true,
    muiTableContainerProps: { sx: { maxHeight: "850px" } },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,

    enablePagination: true,
    // initialState: {
    //   pagination: { pageSize: 50 },
    //   pageSize: 50,
    //   density: "compact",
    // },
    initialState: {
      columnVisibility: {
        _id: false,
      },
    },

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,

    enableBatchRowSelection: true,

    state: {
      pagination, // ✅ Controlled pagination
      density: "compact",
      rowSelection,
    },
    onPaginationChange: setPagination, // ✅ Hook for page changes

    autoResetPageIndex: false,
    getRowId: (row) => row._id,
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
  });

  // ===== Side-effects =====

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


  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    getAllEmails();
  }, []);

  useEffect(() => {
    if (auth.user) {
      const filterAccess = auth.user.role.access
        .filter((role) => role.permission === "Tickets")
        .flatMap((jobRole) => jobRole.subRoles);

      setAccess(filterAccess);
    }
  }, [auth]);

  useEffect(() => {
    if (comment_taskId) {
      filterByRowId(table, comment_taskId, setCommentTicketId, setIsComment);
    }
  }, [comment_taskId, searchParams, navigate, table]);

  return (
    <>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">


        

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Tickets
            </h1>

            {
              <span
                className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
                onClick={() => {
                  handleClearFilters();
                }}
                title="Clear filters"
              >
                <IoClose className="h-6 w-6 text-white" />
              </span>
            }



            <QuickAccess />
              {isAdmin(auth) && <span className=" "> <OverviewForPages /> </span>}
          </div>

          {/* ---------Template Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowSendModal(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New Ticket
            </button>
          </div>
        </div>

        <>
          <div className="w-full flex flex-row justify-start items-center gap-2 mt-5">
            <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden  transition-all duration-300 w-fit">
              <button
                className={`py-1 px-2 outline-none w-[6rem] transition-all duration-300   ${
                  selectedTab === "progress"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("progress")}
              >
                Progress
              </button>
              <button
                className={`py-1 px-2 outline-none transition-all duration-300 w-[6rem]  ${
                  selectedTab === "complete"
                    ? "bg-orange-500 text-white"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("complete");
                  navigate("/tickets/complete");
                }}
              >
                Completed
              </button>
              {(auth?.user?.role?.name === "Admin" ||
                access.includes("Inbox")) && (
                <button
                  className={`py-1 px-2 outline-none transition-all border-l-2  border-orange-500 duration-300 w-[6rem]  ${
                    selectedTab === "inbox"
                      ? "bg-orange-500 text-white"
                      : "text-black bg-gray-100 hover:bg-slate-200"
                  }`}
                  onClick={() => {
                    navigate("/tickets/inbox");
                  }}
                >
                  Inbox
                </button>
              )}
            </div>

            {auth?.user?.role?.name === "Admin" && (
              <div className="flex justify-center items-center  gap-2">
                <span
                  className={` p-1 rounded-md hover:shadow-md bg-gray-50   cursor-pointer border  ${
                    showJobHolder && "bg-orange-500 text-white"
                  }`}
                  onClick={() => {
                    setShowJobHolder((prev) => !prev);
                  }}
                  title="Filter by Job Holder"
                >
                  <IoBriefcaseOutline className="h-6 w-6  cursor-pointer " />
                </span>

                <span
                  className={` p-1 rounded-md hover:shadow-md   bg-gray-50 cursor-pointer border ${
                    showEdit && "bg-orange-500 text-white"
                  }`}
                  onClick={() => {
                    setShowEdit(!showEdit);
                  }}
                  title="Edit Multiple Jobs"
                >
                  <MdOutlineModeEdit className="h-6 w-6  cursor-pointer" />
                </span>


                <RefreshTicketsButton getAllEmails={getAllEmails}/>


              </div>
            )}
          </div>
          <hr className="mb-1 bg-gray-300 w-full h-[1px] my-2 " />

          {/* ----------Job_Holder Summery Filters---------- */}
          {auth?.user?.role?.name === "Admin" && showJobHolder && (
            <>
              <div className="w-full  py-2 ">
                <div className="flex items-center flex-wrap gap-4">
                  <DragDropContext onDragEnd={handleUserOnDragEnd}>
                    <Droppable droppableId="users0" direction="horizontal">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="flex items-center gap-3 overflow-x-auto hidden1"
                        >
                          <div
                            className={`py-1 rounded-tl-md w-[6rem] sm:w-fit rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                              active1 === "All" &&
                              "  border-b-2 text-orange-600 border-orange-600"
                            }`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              setActive1("All");
                              setColumnFromOutsideTable("jobHolder", "");
                            }}
                          >
                            All ({getJobHolderCount("All")})
                          </div>

                          {userName.map((user, index) => {
                            return (
                              <Draggable
                                key={user}
                                draggableId={user}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    className={`py-1   px-2 !cursor-pointer font-[500] text-[14px]   ${
                                      active1 === user &&
                                      "  border-b-2 text-orange-600 border-orange-600"
                                    }`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => {
                                      setActive1(user);
                                      setColumnFromOutsideTable(
                                        "jobHolder",
                                        user
                                      );
                                    }}
                                  >
                                    {user} ({getJobHolderCount(user)})
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>

              {/* Update Bulk Jobs */}
              {showEdit && (
                <div className="w-full  p-4 ">
                  <form
                    onSubmit={updateBulkLeads}
                    className="w-full grid grid-cols-12 gap-4 max-2xl:grid-cols-8  "
                  >
                    <div className="w-full">
                      <select
                        name="jobHolder"
                        value={updates.jobHolder}
                        onChange={handle_on_change_update}
                        className={`${style.input} w-full`}
                      >
                        <option value="empty">Job Holder</option>
                        {users.map((jobHolder, i) => (
                          <option value={jobHolder.name} key={i}>
                            {jobHolder.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="">
                      <select
                        name="jobStatus"
                        value={updates.jobStatus}
                        onChange={handle_on_change_update}
                        className={`${style.input} w-full`}
                      >
                        <option value="empty">Job Status</option>
                        {jobStatusOptions.map((el, i) => (
                          <option value={el} key={i}>
                            {el}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="inputBox">
                      <input
                        type="date"
                        name="jobDate"
                        value={updates.jobDate}
                        onChange={handle_on_change_update}
                        className={`${style.input} w-full `}
                      />
                      <span>Job Date</span>
                    </div>

                    <div className="w-full flex items-center justify-end  ">
                      <button
                        className={`${style.button1} text-[15px] w-full `}
                        type="submit"
                        disabled={isUpdating}
                        style={{ padding: ".5rem  " }}
                      >
                        {isUpdating ? (
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

              <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
            </>
          )}
        </>

        {/* <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" /> */}

        {/* ---------Table Detail---------- */}
        <div className="w-full h-full">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-screen px-4 py-4">
              <Loader />
            </div>
          ) : (
            <div className="w-full min-h-[10vh] relative ">
              <div className="h-full hidden1 overflow-y-auto relative">
                <MaterialReactTable table={table} />
              </div>
            </div>
          )}
        </div>

        {/* ---------------------Send Email Modal------------------ */}
        {showSendModal && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-1 bg-gray-700/70 flex items-center justify-center">
            <SendEmailModal
              setShowSendModal={setShowSendModal}
              getEmails={getEmails}
              access={access}
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
              jobId={commentTicketId}
              setJobId={setCommentTicketId}
              users={userName}
              type={"ticket"}
              getTasks1={getEmails}
              page={"ticket"}
            />
          </div>
        )}



        {/* ---------------------Activity Log Drawer------------------ */}
        {/* {isActivityDrawerOpen && (
          <ActivityLogDrawer isOpen={isActivityDrawerOpen} onClose={() => setIsActivityDrawerOpen(false)} ticketId={activityDrawerTicketId} />
)}




   <Drawer open={open} onClose={() => {toggleDrawer(false); } } anchor="right"   sx={{zIndex: 1400, '& .MuiDrawer-paper': {
        width: 600, // Set your custom width here (px, %, etc.)
      },}}  >
                
                  <div className="  " >

                       <ActivityLogDrawer isOpen={isActivityDrawerOpen} onClose={() => setIsActivityDrawerOpen(false)} ticketId={activityDrawerTicketId} />
                    <EmailDetailDrawer id={ticketId} toggleDrawer={toggleDrawer} />
                  </div>
  
              </Drawer> */}






























            {
              open && <div className="fixed inset-0 z-[499] flex items-center justify-center bg-black/30 backdrop-blur-sm  h-full     ">
                          <div className="h-[95%] bg-gray-100 rounded-xl shadow-lg w-[95%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[70%] 3xl:w-[60%]    py-4 px-5   ">
                            <div className="h-full w-full flex flex-col justify-start items-center relative">
            
                              <div className="flex items-center justify-between border-b pb-2 mb-3 self-start w-full">
                              <h3 className="text-lg font-semibold">Ticket: {(ticketSubject) ? ticketSubject : "Loading..."}</h3>
                              <button
                                className="p-1 rounded-2xl bg-gray-50 border hover:shadow-md hover:bg-gray-100"
                                onClick={() => {toggleDrawer(false); setTicketId(""); setTicketSubject("")}}
                              >
                                <IoClose className="h-5 w-5" />
                              </button>
                              </div>
            
 



                              
      <div className=" w-full h-full flex justify-center items-center gap-8 px-8 py-4 overflow-hidden " >

 
                        
                        <EmailDetailDrawer id={ticketId} setTicketSubject={setTicketSubject} isReplyModalOpenCb={isReplyModalOpenCb}/>

                        <div className="w-full h-full flex flex-col justify-start items-start gap-5 ">

                           

                              

                               <div className="max-w-lg w-full h-[50%] px-3">

                               <ActivityLogDrawer isOpen={isActivityDrawerOpen} onClose={() => setIsActivityDrawerOpen(false)} ticketId={ticketId} />
                            </div>

                            <div className="max-w-lg w-full  h-[50%]">
                                
                                <DetailComments type={"ticket"} jobId={ticketId} getTasks1={getEmails} />

                              </div>




                        </div>


                  </div>
  


                            </div>
                          </div>
                        </div>

            }


































{filterInfo.col && anchorRef.current && (
  <NumberFilterPortal
    anchorRef={anchorRef}
    value={filterInfo.value}
    filterType={filterInfo.type}
    onApply={applyFilter}
    onClose={handleCloseFilter}
    setValue={(val) => setFilterInfo((f) => ({ ...f, value: val }))}
    setFilterType={(type) => setFilterInfo((f) => ({ ...f, type }))}
  />
)}
      </div>
    </>
  );
}
