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




















  const [ticketId, setTicketId] = useState("")

  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => {
     
    setOpen(newOpen);
  };





















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


 


  // ===== Table Details =====

  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "ID",
        size: 0,
        maxSize: 0,
        minSize: 0,
        enableColumnFilter: false,  
        enableSorting: false,
        Cell: () => null, 
      },
      {
        accessorKey: "companyName",
        minSize: 100,
        maxSize: 300,
        size: 240,
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
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const companyName = row.original.companyName;
          const [isEditing, setIsEditing] = useState(false);
          const [newcompanyName, setNewcompanyName] = useState("");

          const inputRef = useRef(null);

          const handleKeyDown = (e) => {
            if (e.key === "Escape") {
              setNewcompanyName("");
              setIsEditing(false);
            }

            if (e.key === "Enter") {
              if (newcompanyName !== companyName) {
                updateTicketSingleField(row.original._id, {
                  companyName: newcompanyName.trim(),
                });
              }

              setIsEditing(false);
            }
          };

          useEffect(() => {
            if (isEditing && inputRef?.current) {
              inputRef.current.focus();
            }
          }, [isEditing]);

          return (
            <>
              {row?.original?.clientId ? (
                <span>{companyName}</span>
              ) : (
                <div className="w-full px-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newcompanyName}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                          setNewcompanyName(e.target.value);
                        }}
                        onBlur={(e) => {
                          if (newcompanyName !== companyName) {
                            updateTicketSingleField(row.original._id, {
                              companyName: newcompanyName.trim(),
                            });
                          }
                          setIsEditing(false);
                        }}
                        className="w-full h-[1.8rem] px-2 border border-gray-300 rounded-md outline-none"
                      />
                    </div>
                  ) : (
                    <span
                      className="w-full flex"
                      onDoubleClick={() => {
                        setIsEditing(true);
                        setNewcompanyName(companyName);
                      }}
                    >
                      {companyName ? (
                        companyName
                      ) : (
                        <AiOutlineEdit className="text-gray-400 text-lg cursor-pointer" />
                      )}
                    </span>
                  )}
                </div>
              )}
            </>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";
          return cellValue.includes(filterValue.toLowerCase());
        },
        filterVariant: "select",
      },
      {
        accessorKey: "clientName",
        minSize: 100,
        maxSize: 200,
        size: 140,
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
                Client Name
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const clientName = row.original.clientName;
          const [isEditing, setIsEditing] = useState(false);
          const [newClientName, setNewClientName] = useState("");

          const inputRef = useRef(null);

          const handleKeyDown = (e) => {
            if (e.key === "Escape") {
              setNewClientName("");
              setIsEditing(false);
            }

            if (e.key === "Enter") {
              if (newClientName !== clientName) {
                updateTicketSingleField(row.original._id, {
                  clientName: newClientName.trim(),
                });
              }
              setIsEditing(false);
            }
          };

          useEffect(() => {
            if (isEditing && inputRef?.current) {
              inputRef.current.focus();
            }
          }, [isEditing]);

          return (
            <>
              {row?.original?.clientId ? (
                <span>{clientName}</span>
              ) : (
                <div className="w-full px-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newClientName}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                          setNewClientName(e.target.value);
                        }}
                        onBlur={(e) => {
                          if (newClientName !== clientName) {
                            updateTicketSingleField(row.original._id, {
                              clientName: newClientName.trim(),
                            });
                          }
                          setIsEditing(false);
                        }}
                        className="w-full h-[1.8rem] px-2 border border-gray-300 rounded-md outline-none"
                      />
                    </div>
                  ) : (
                    <span
                      className="w-full flex"
                      onDoubleClick={() => {
                        setIsEditing(true);
                        setNewClientName(clientName);
                      }}
                    >
                      {clientName ? (
                        clientName
                      ) : (
                        <AiOutlineEdit className="text-gray-400 text-lg cursor-pointer" />
                      )}
                    </span>
                  )}
                </div>
              )}
            </>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";
          return cellValue.includes(filterValue.toLowerCase());
        },

        filterVariant: "select",
      },

      {
        accessorKey: "company",
        minSize: 100,
        maxSize: 200,
        size: 100,
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
                Company
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                <option value={"Affotax"}>Affotax</option>
                <option value={"Outsource"}>Outsource</option>
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const company = row.original.company;
          return (
            <div className="w-full px-1">
              <span>{company}</span>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: companyData?.map((category) => category?.name),
        filterVariant: "select",
      },
      {
        accessorKey: "jobHolder",
        header: "Job Holder",
        Header: ({ column }) => {
          const user = auth?.user?.name;

          useEffect(() => {
            column.setFilterValue(user);
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
                    <option key={i} value={jobhold?.name}>
                      {jobhold?.name}
                    </option>
                  ))}
                </select>
              
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = cell.getValue();
          const [show, setShow] = useState(false);
          const [employee, setEmployee] = useState(jobholder);

          return (
            <div className="w-full">
              {show ? (
                <select
                  value={employee || ""}
                  className="w-full h-[2rem] rounded-md border-none  outline-none"
                  onChange={(e) => {
                    updateJobHolder(row.original._id, e.target.value);
                    setEmployee(e.target.value);
                    setShow(false);
                  }}
                >
                  <option value="empty"></option>
                  {users?.map((jobHold, i) => (
                    <option value={jobHold?.name} key={i}>
                      {jobHold.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  onDoubleClick={() => setShow(true)}
                  className="w-full cursor-pointer"
                >
                  {jobholder ? (
                    jobholder
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </span>
              )}
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((jobhold) => jobhold.name),
        filterVariant: "select",
        size: 100,
        minSize: 80,
        maxSize: 130,
        grow: false,
      },

      {
        accessorKey: "jobStatus",
        header: "Job Status",
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
                Job Status
              </span>

              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {jobStatusOptions?.map((status, i) => (
                  <option key={i} value={status}>
                    {status}
                  </option>
                ))}

                <option value="empty">Empty</option>
              </select>
            </div>
          );
        },
        Cell: ({ cell, row, table }) => {
          const jobStatus = cell.getValue();

          const [show, setShow] = useState(false);
          const [value, setValue] = useState(jobStatus);

          return (
            <div className="w-full">
              {show ? (
                <select
                  value={value || ""}
                  className="w-full h-[2rem] rounded-md border-none  outline-none"
                  onChange={(e) => {
                    updateJobStatus(row.original._id, e.target.value);
                    //setValue(e.target.value);
                    setShow(false);
                  }}
                >
                  <option value="empty"></option>
                  {jobStatusOptions?.map((status, i) => (
                    <option value={status} key={i}>
                      {status}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  onDoubleClick={() => setShow(true)}
                  className="w-full h-full cursor-pointer"
                >
                  {jobStatus && jobStatus !== "empty" ? (
                    jobStatus
                  ) : (
                    <div className="text-white w-full h-full  ">.</div>
                  )}
                </span>
              )}
            </div>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);

          if (filterValue === "empty") {
            return !cellValue || cellValue === "empty";
          }

          return String(cellValue ?? "") === String(filterValue);
        },

        size: 100,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },

      {
        accessorKey: "subject",
        minSize: 200,
        maxSize: 500,
        size: 440,
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
                Subject
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[380px] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
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
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";
          return cellValue.includes(filterValue.toLowerCase());
        },
        filterVariant: "select",
      },

{
  accessorKey: "received",
  Header: ({column}) => (
    <div className="flex flex-col items-center justify-between">
      <span title="Click to remove filter" onClick={() => column.setFilterValue("")} className="cursor-pointer ">Received</span>
      <button ref={anchorRef} onClick={(e) => handleFilterClick(e, "received")}>
        <TiFilter size={20} className="ml-1 text-gray-500 hover:text-black" />
      </button>
    </div>
  ),
  filterFn: NumderFilterFn,
  Cell: ({ row }) => (
    <span className="w-full flex justify-center text-lg bg-sky-600 text-white rounded-md">
      {row.original.received}
    </span>
  ),
  size: 60,
},

      {
        accessorKey: "sent",
        
         Header: ({column}) => (
    <div className="flex flex-col items-center justify-between">
       <span title="Click to remove filter" onClick={() => column.setFilterValue("")} className="cursor-pointer ">Sent</span>
      <button ref={anchorRef} onClick={(e) => handleFilterClick(e, "sent")}>
        <TiFilter size={20} className="ml-1 text-gray-500 hover:text-black" />
      </button>
    </div>
  ),
        Cell: ({ row }) => {
          const sent = row.original.sent;
          return (
            <span className="w-full flex justify-center text-lg bg-orange-600 text-white rounded-md">
              {sent}
            </span>
          );
        },

        size: 60,
          filterFn: NumderFilterFn,
      },

      {
        accessorKey: "status",
        header: "Status",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col items-center justify-center gap-[2px]">
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
                className="font-normal h-[1.8rem] w-[80px] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {status?.map((stat, i) => (
                  <option key={i} value={stat}>
                    {stat}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const stat = cell.getValue();

          return (
            <div className="w-full flex items-center justify-center">
              <span
                className={` py-1 px-2 rounded-lg text-white ${
                  stat === "Read"
                    ? "bg-gray-500"
                    : stat === "Unread"
                    ? "bg-sky-400"
                    : "bg-green-400"
                } `}
              >
                {stat}
              </span>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: status.map((stat) => stat),
        filterVariant: "select",
        size: 90,
        minSize: 80,
        maxSize: 130,
        grow: false,
      },

      // Created Date
      {
        accessorKey: "createdAt",
        Header: ({ column }) => {
          const [filterValue, setFilterValue] = useState("");
          const [customDate, setCustomDate] = useState(getCurrentMonthYear());

          useEffect(() => {
            if (filterValue === "Custom date") {
              column.setFilterValue(customDate);
            }
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
            <div className="w-full flex flex-col gap-[2px]">
              <span
                className="cursor-pointer "
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Date
              </span>

              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
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
          const createdAt = row.original.createdAt;

          return (
            <div className="w-full flex  ">
              <p>{format(new Date(createdAt), "dd-MMM-yyyy")}</p>
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
        filterVariant: "custom",
        size: 100,
        minSize: 90,
        maxSize: 110,
        grow: false,
      },
      {
        accessorKey: "jobDate",
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
            <div className="w-full flex flex-col gap-[2px]">
              <span
                className="cursor-pointer "
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
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
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
          const jobDate = row.original.jobDate;
          const [date, setDate] = useState(() => {
            const cellDate = new Date(
              cell.getValue() || "2024-09-20T12:43:36.002+00:00"
            );
            return cellDate.toISOString().split("T")[0];
          });

          const [showStartDate, setShowStartDate] = useState(false);

          const handleDateChange = (newDate) => {
            setDate(newDate);
            updateJobDate(row.original._id, newDate);
            setShowStartDate(false);
          };

          return (
            <div className="w-full flex  ">
              {!showStartDate ? (
                <p
                  onDoubleClick={() => setShowStartDate(true)}
                  className="w-full"
                >
                  {jobDate ? (
                    format(new Date(jobDate), "dd-MMM-yyyy")
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </p>
              ) : (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={(e) => handleDateChange(e.target.value)}
                  className={`h-[2rem] w-full cursor-pointer rounded-md border border-gray-200 outline-none `}
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
            case "Yesterday":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() - 1);
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
          "Yesterday",
          "In 7 days",
          "In 15 days",
          "30 Days",
          "60 Days",
          "Custom date",
        ],
        filterVariant: "custom",
        size: 100,
        minSize: 90,
        maxSize: 120,
        grow: false,
      },

      {
        accessorKey: "lastMessageSentTime",
        Header: ({ column }) => {
          const [filterValue, setFilterValue] = useState("");
          const [customDate, setCustomDate] = useState(getCurrentMonthYear());

          useEffect(() => {
            if (filterValue === "Custom date") {
              column.setFilterValue(customDate);
            }
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
            <div className="w-full flex flex-col gap-[2px]">
              <span
                className="cursor-pointer "
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Last Replied
              </span>

              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
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
          const lastReply = row.original.lastMessageSentTime;

          function getDaysOld(dateString) {
            const givenDate = new Date(dateString);
            const now = new Date();

            // Calculate the difference in milliseconds
            const diffMs = now - givenDate;

            // Convert milliseconds to days (1 day = 86400000 ms)
            const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            return daysOld;
          }

          return (
            <div className="w-full flex  ">
              <p
                // onDoubleClick={() => setShowStartDate(true)}
                className="w-full"
              >
                {lastReply ? (
                  <div className="w-full flex flex-col justify-center items-center ">
                    {/* <span>{format(new Date(lastReply), "dd-MMM-yyyy")}</span>{" "} */}
                    <span>{getDaysOld(lastReply)} days ago</span>
                  </div>
                ) : (
                  <span className="text-white">.</span>
                )}
              </p>
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
        filterVariant: "custom",
        size: 100,
        minSize: 90,
        maxSize: 120,
        grow: false,
      },

      // <-----Action------>
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          const comments = row.original?.comments;
          const [readComments, setReadComments] = useState([]);

          useEffect(() => {
            const filterComments = comments.filter(
              (item) => item.status === "unread"
            );
            setReadComments(filterComments);
            // eslint-disable-next-line
          }, [comments]);

          console.log("REaD COMMENTS", comments);

          return (
            <div className="flex items-center justify-center gap-4 w-full h-full">



                 <span
                className=""
                title="View Ticket"
                onClick={() => {
                  toggleDrawer(true);
                  setTicketId(row.original._id)
                  
                }}
              >
                
                <MdRemoveRedEye className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-600" />
              </span>

              


                 <span
                className=""
                title="View Logs"
                onClick={() => {
                  setIsActivityDrawerOpen(true);
                  setActivityDrawerTicketId(row.original._id);
                }}
              >
                <TbLogs className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-600" />
              </span>



                <div
                  className="flex items-center justify-center gap-1 relative w-full h-full"
                  onClick={() => {
                    setCommentTicketId(row.original._id);
                    setIsComment(true);
                  }}
                >
                  <div className="relative">
                    <span className="text-[1rem] cursor-pointer relative">
                      <MdInsertComment className={`h-5 w-5 text-orange-600 `} />
                    </span>
                  </div>
                </div>

              <span
                className=""
                title="Complete Ticket"
                onClick={() => {
                  handleUpdateTicketStatusConfirmation(row.original._id);
                }}
              >
                <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
              </span>
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => handleDeleteTicketConfirmation(row.original._id)}
                title="Delete Ticket!"
              >
                <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600 " />
              </span>
            </div>
          );
        },
        size: 200,
      },
    ],
    // eslint-disable-next-line
    [users, auth, emailData, filteredData]
  );

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
                                    className={`py-1   px-2 cursor-pointer font-[500] text-[14px]   ${
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
        {isActivityDrawerOpen && (
          <ActivityLogDrawer isOpen={isActivityDrawerOpen} onClose={() => setIsActivityDrawerOpen(false)} ticketId={activityDrawerTicketId} />
)}




   <Drawer open={open} onClose={() => {toggleDrawer(false); } } anchor="right"   sx={{zIndex: 1400, '& .MuiDrawer-paper': {
        width: 600, // Set your custom width here (px, %, etc.)
      },}}  >
                
                  <div className="  " >
  
                    <EmailDetailDrawer id={ticketId} toggleDrawer={toggleDrawer} />
                  </div>
  
              </Drawer>






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
