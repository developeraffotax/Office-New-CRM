import React, { useEffect, useMemo, useRef, useState } from "react";
 
import { IoBriefcaseOutline, IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { useNavigate } from "react-router-dom";
 
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import axios from "axios";
 
import { format } from "date-fns";
 
import { IoTicketOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { MdOutlineAnalytics, MdOutlineModeEdit, MdOutlineQueryStats } from "react-icons/md";
 
import { GoEye, GoEyeClosed } from "react-icons/go";
import { TbLoader2 } from "react-icons/tb";
 
 
 
import SendEmailModal from "../../components/Tickets/SendEmailModal";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import QuickAccess from "../../utlis/QuickAccess";
 
import NewTicketModal from "../../utlis/NewTicketModal";
import { ActionsCell } from "./ActionsCell";
import DateRangePopover from "../../utlis/DateRangePopover";
import { DateFilterFn } from "../../utlis/DateFilterFn";
import { TiFilter } from "react-icons/ti";
import { NumberFilterPortal, NumderFilterFn } from "../../utlis/NumberFilterPortal";
import { LuRefreshCcw } from "react-icons/lu";
import { useSelector } from "react-redux";
import RefreshLeadsButton from "./ui/RefreshLeadsButton";
import { Box, LinearProgress } from "@mui/material";
import getLeadColumns from "./table/columns";
import WonLeadsStats from "./userLeadChart/UserLeadChart";
import UserLeadChart from "./userLeadChart/UserLeadChart";
import { BsGraphUpArrow } from "react-icons/bs";
import { isAdmin } from "../../utlis/isAdmin";
import OverviewForPages from "../../utlis/overview/OverviewForPages";

const updates_object_init = {
      companyName: '',
      clientName: '',
      jobHolder: '',
      department: '',
      source: '',
      brand: '',
      lead_Source: '',
      followUpDate: '',
      JobDate: '',
      Note: '',
      stage: '',
      status: '',
      value: '',
      number: ''
}

export default function Lead() {


  const navigate = useNavigate();


  const  auth  = useSelector((state) => state.auth.auth);


  const [selectedTab, setSelectedTab] = useState("progress");
  const [isLoading, setIsLoading] = useState(false);

  const [showUserLeadChart, setShowUserLeadChart] = useState(false);
 
  const [leadData, setLeadData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [load, setLoad] = useState(false);
  const [valueTotal, setValueTotal] = useState(0);


    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [clientCompanyName, setClientCompanyName] = useState("");
    const [clientEmail, setClientEmail] = useState("");


    const [showSendModal, setShowSendModal] = useState(false);
      const [access, setAccess] = useState([]);

      

  const [showJobHolder, setShowJobHolder] = useState(true);
  const [active1, setActive1] = useState("");



  
  
    const [pagination, setPagination] = useState({
            pageIndex: 0,
            pageSize: 30, // ✅ default page size
          });
  
  


  
  const anchorRef = useRef(null);

const [filterInfo, setFilterInfo] = useState({
  col: null,
  value: "",
  type: "eq",
});



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





      // With Loading
      const getEmails = async () => {
        try {
          const { data } = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/tickets`
          );
          if (data) {
            // setEmailData(data.emails);
          }
        } catch (error) {
          console.log(error);
        }
      };


        // Get Auth Access
        useEffect(() => {
          if (auth.user) {
            const filterAccess = auth.user.role.access
              .filter((role) => role.permission === "Tickets")
              .flatMap((jobRole) => jobRole.subRoles);
      
            setAccess(filterAccess);
          }
        }, [auth]);



  
  const leadSource = [
    "Upwork",
    "Fiverr",
    "PPH",
    "Referral",
    "Partner",
    "Google",
    "Facebook",
    "LinkedIn",
    "CRM",
    "Existing",
    "Other",
  ];
  const stages = ["Interest", "Decision", "Action"];
  const brands = ["Affotax", "Outsource", "OTL"];
  const sources = ["Invitation", "Proposal", "Website"];
  const departments = [
    "Bookkeeping",
    "Payroll",
    "VAT Return",
    "Accounts",
    "Personal Tax",
    "Company Sec",
    "Address",
    "Billing",
  ];
  const [formData, setFormData] = useState({
    companyName: "",
    clientName: "",
    jobHolder: "",
    department: "",
    source: "",
    brand: "",
    lead_Source: "",
    followUpDate: "",
    JobDate: "",
    Note: "",
    stage: "",
    value: "",
    number: "",
    jobDeadline: "",
    yearEnd: "",

    email: ""
  });
  const [active, setActive] = useState(false);
  const [selectFilter, setSelectFilter] = useState("");


  
  // BULK EDITING
  const [rowSelection, setRowSelection] = useState({});
  
  const [showEdit, setShowEdit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [updates, setUpdates] = useState(updates_object_init)


  const handle_on_change_update = (e) => {
    setUpdates(prev => {
      return {
        ...prev,
        [e.target.name]: e.target.value
      }
    })
  }
  
  // -------Update Bulk Leads------------->

  const updateBulkLeads = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    console.log("Row Selection",rowSelection);
    console.log("Updates",updates)

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/update/bulk/leads`,
        {
          rowSelection: Object.keys(rowSelection).filter(
            (id) => rowSelection[id] === true
          ),
          updates
        }
      );

      if (data) {
        setUpdates(updates_object_init);
        toast.success("Leads Updated💚💚");
        getAllLeads()
      }
    } catch (error) {
       
      console.log(error?.response?.data?.message);
      toast.error("Something went wrong!");
    } finally {
      setIsUpdating(false);
    }
  };



























  const [showcolumn, setShowColumn] = useState(false);
      const boxRef = useRef(null);
  const columnData = [
    "companyName",
    "clientName",
    "jobHolder",
    "department",
    "source",
    "brand",
    "value",
    "number",
    "lead_Source",
    "leadCreatedAt",
    "followUpDate",
    "Days",
    "stage",
    "actions",
    "Note",
    "jobDeadline",
    "yearEnd",
    "email",
    "received",
    "sent"
    // "Fee",
    // "Source",
    // "ClientType",
    // "CC_Person",
    // "AC",
    // "SignUp_Date",
  ];

  const [columnVisibility, setColumnVisibility] = useState(() => {
    const savedVisibility = JSON.parse(
      localStorage.getItem("columnVisibilityLead")
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
    localStorage.setItem("columnVisibilityLead", JSON.stringify(updatedVisibility));
  };



  
  const renderColumnControls = () => (
    <div className="flex flex-col gap-2 bg-white rounded-md   border p-4">
      {Object.keys(columnVisibility)?.map((column) => (
        <div key={column} className="flex w-full gap-1 flex-col ">
          <div className="flex items-center">
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
          <hr className=" bg-gray-300 w-full h-[1px]" />
        </div>
      ))}
    </div>
  );



  console.log("filteredData:", filteredData);

  // -------Get All Leads-------
  const getAllLeads = async () => {
    setIsLoading(true);
    try {
      if (selectedTab === "progress") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/progress/lead`
        );
        if (data) {
          setLeadData(data.leads);
          
        }
      } else if (selectedTab === "won") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/won/lead`
        );
        if (data) {
          setLeadData(data.leads);
           
        }
      } else {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/lost/lead`
        );
        if (data) {
          setLeadData(data.leads);
           
        }
      }
    } catch (error) {
      console.log(error);
       
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllLeads();
  }, [selectedTab]);

  // Filter Total Value
  useEffect(() => {
    const totalvalue = filteredData.reduce(
      (acc, item) => acc + Number(item.value || 0),
      0
    );
    console.log("totalvalue:", totalvalue);
    setValueTotal(totalvalue);
  }, [filteredData]);

  const getLeads = async () => {
    setLoad(true);
    try {
      if (selectedTab === "progress") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/progress/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setLoad(false);
        }
      } else if (selectedTab === "won") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/won/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setLoad(false);
        }
      } else {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/lost/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setLoad(false);
        }
      }
    } catch (error) {
      setLoad(false);
      console.log(error);
    } finally {
      setLoad(false);
    }
  };

  // Total Source Count
  const getSourceCount = (source) => {
    if (filteredData.length > 0 || selectFilter) {
      return filteredData.filter((item) => item.source === source).length;
    } else {
      return leadData.filter((item) => item.source === source).length;
    }
  };

  const sourcePercentage = (source) => {
    const totalLead =
      filteredData.length > 0 || selectFilter
        ? filteredData.length
        : leadData.length;
    const sourceCount = getSourceCount(source);
    return totalLead > 0 ? ((sourceCount / totalLead) * 100).toFixed(0) : 0;
  };




  
  function mergeWithSavedOrder(fetchedUsernames, savedOrder) {
    const savedSet = new Set(savedOrder);
    console.log("savedSET>>>>", savedSet)
    // Preserve the order from savedOrder, but only if the username still exists in the fetched data
    const ordered = savedOrder.filter(name => fetchedUsernames.includes(name));
    
    // Add any new usernames that aren't in the saved order
    const newOnes = fetchedUsernames.filter(name => !savedSet.has(name));
    
    return [...ordered, ...newOnes];
  }



  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access?.some((item) => item?.permission.includes("Leads"))
        ) || []
      );

      const userNameArr = data?.users
      ?.filter((user) =>
        user.role?.access.some((item) => item?.permission.includes("Leads"))
      )
      .map((user) => user.name)

      setUserName(userNameArr );

      const savedOrder = JSON.parse(localStorage.getItem("leads_usernamesOrder"));
        if(savedOrder) {
          const savedUserNames = mergeWithSavedOrder(userNameArr, savedOrder);
          
            setUserName(savedUserNames)
        }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);




 
  //   Create New Lead
  const handleCreateLead = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/create/lead`,
        { ...formData }
      );
      if (data) {
        setLeadData((prevData) =>
          prevData ? [...prevData, data.lead] : [data.lead]
        );
        getAllLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //  ---------- Update Lead Status------>
  const handleLeadStatus = (leadId, status) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this job!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdateStatus(leadId, status);
        Swal.fire(
          "Updated!",
          `Your lead ${status || "Update"} successfully!.`,
          "success"
        );
      }
    });
  };
  const handleUpdateStatus = async (leadId, status) => {
    if (!leadId) {
      toast.error("Lead id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/update/lead/${leadId}`,
        { status: status }
      );
      if (data?.success) {
        const updateLead = data?.lead;

        setLeadData((prevData) =>
          prevData.filter((item) => item._id !== updateLead._id)
        );
        if (filteredData) {
          setFilteredData((prevData) =>
            prevData.filter((item) => item._id !== updateLead._id)
          );
        }
        getAllLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  //  ------------Delete Lead------------>
  const handleDeleteLeadConfirmation = (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteLead(taskId);
        Swal.fire("Deleted!", "Your lead has been deleted.", "success");
      }
    });
  };

  const handleDeleteLead = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/delete/lead/${id}`
      );
      if (data) {
        const filteredData = leadData?.filter((item) => item._id !== id);
        setLeadData(filteredData);

        if (filteredData) {
          const filterData1 = filteredData?.filter((item) => item._id !== id);
          setFilteredData(filterData1);
        }
        getAllLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Update Form Data
  const handleUpdateData = async (leadId, updateData) => {
    if (!leadId) {
      toast.error("Lead id is required!");
      return;
    }

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/update/lead/${leadId}`,
        { ...updateData }
      );
      if (data?.success) {
        const updatedLead = data?.lead;

        // setLeadData((prevData) =>
        //   prevData.filter((item) => item._id !== updateLead._id)
        // );
        // if (filteredData) {
        //   setFilteredData((prevData) =>
        //     prevData.filter((item) => item._id !== updateLead._id)
        //   );
        // }


         // ✅ Update leadData in-place instead of filtering it out
      setLeadData((prevData) =>
        prevData.map((item) =>
          item._id === updatedLead._id ? updatedLead : item
        )
      );

      // ✅ If you maintain filteredData, also update it
      if (filteredData) {
        setFilteredData((prevData) =>
          prevData.map((item) =>
            item._id === updatedLead._id ? updatedLead : item
          )
        );
      }
        setFormData({
          companyName: "",
          clientName: "",
          jobHolder: "",
          department: "",
          source: "",
          brand: "",
          lead_Source: "",
          followUpDate: "",
          JobDate: "",
          Note: "",
          stage: "",
          value: "",
          number: "",
        });
        toast.success("Lead data updated!");
        //getLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  //   ------------------------Table Data----------->
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  // Copy Lead
  const handleCopyLead = async ({
    jobHolder,
    department,
    source,
    brand,
    lead_Source,
    followUpDate,
    JobDate,
    stage,
  }) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/create/lead`,
        {
          jobHolder,
          department,
          source,
          brand,
          lead_Source,
          followUpDate,
          JobDate,
          stage,
          jobDeadline: new Date().toISOString()

        }
      );
      if (data) {
        setLeadData((prevData) =>
          prevData ? [...prevData, data.lead] : [data.lead]
        );
        getAllLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };








  const columns = useMemo(
    () => {



const allColumns = getLeadColumns({
  setSelectFilter,
  setFormData,
  handleUpdateData,
  users,
  departments,
  sources,
  brands,
  leadSource,
  auth,
   
  anchorRef,
  handleFilterClick,
   
  NumderFilterFn,
   
  DateRangePopover,
  valueTotal,
  ActionsCell,
  selectedTab,
  setClientCompanyName,
  setClientEmail,
  setShowNewTicketModal,
  handleCopyLead,
  handleLeadStatus,
  handleDeleteLeadConfirmation,
  stages,
});

 



return allColumns.filter((col) => columnVisibility[col.accessorKey]);








    },

    // eslint-disable-next-line
    [users, auth, leadData,departments,sources,brands, leadSource,selectedTab,
      stages,
        load, valueTotal, filteredData, showcolumn, columnVisibility]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
    setSelectFilter("");
  };

  const table = useMaterialReactTable({
    columns,
    data: leadData || [],

     
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection,
      isLoading: isLoading,
      showSkeletons: false,
      

      pagination
     

      
      },
    enableBatchRowSelection: true,
 


    getRowId: (row) => row._id,
    enableStickyHeader: true,
    enableStickyFooter: true,
    muiTableContainerProps: { sx: { maxHeight: "850px", overflowX: 'auto' } },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    enablePagination: true,
    initialState: {
      pagination: { pageSize: 30 },
      pageSize: 30,
      density: "compact",
  //      columnPinning: {
  //     right: ['actions'], 
  // },
       
    },

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
  });

  useEffect(() => {
    const filteredRows = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    setFilteredData(filteredRows);
  }, [table.getFilteredRowModel().rows]);


































  















    // a little function to help us with reordering the result
    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
    
      return result;
    };
  
  
      //  -----------Handle drag end---------
    const handleUserOnDragEnd = (result) => {
   
      const items = reorder( userName, result.source.index, result.destination.index );
      localStorage.setItem("leads_usernamesOrder", JSON.stringify(items));
      setUserName(items)
  
    };
 
    
  // --------------Job_Holder Length---------->

  const getJobHolderCount = (user, status) => {
    console.log("L:LEADS DATA", leadData)
    if(user === "All") {
      return leadData.filter((lead) =>
        lead?.status === status
      )?.length;
    }
    return leadData.filter((lead) =>
      lead?.jobHolder === user && lead?.status === status
    )?.length;
  };
    
    
        
    
        const setColumnFromOutsideTable = (colKey, filterVal) => {
    
          const col = table.getColumn(colKey);
          return col.setFilterValue(filterVal);
        }
    





        
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





  return (
    <>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Leads
            </h1>


            {
              // auth?.user?.role?.name === 'Admin' && 
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
              className={`${style.button1} text-[15px] flex items-center gap-1`}
              onClick={() => setShowSendModal(true)}
              style={{ padding: ".4rem 1rem" }}
            >
             <span className="text-xl "><IoTicketOutline /></span> New Ticket 
            </button>


            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => handleCreateLead()}
              style={{ padding: ".4rem 1rem" }}
            >
              New Lead
            </button>
          </div>
        </div>
        {/*  */}
        <>
          <div className="flex items-center  gap-5">
            <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden mt-5 transition-all duration-300 w-fit">
              <button
                className={`py-1 px-4  outline-none transition-all duration-300  w-[6rem] ${
                  selectedTab === "progress"
                    ? "bg-orange-500 text-white "
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("progress")}
              >
                Progress
              </button>
              <button
                className={`py-1 px-4 outline-none border-l-2 border-orange-500 transition-all duration-300 w-[6rem]  ${
                  selectedTab === "won"
                    ? "bg-orange-500 text-white"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("won");
                  // navigate("/tickets/complete");
                }}
              >
                Won
              </button>
              <button
                className={`py-1 px-4 outline-none border-l-2 border-orange-500 transition-all duration-300 w-[6rem]  ${
                  selectedTab === "lost"
                    ? "bg-orange-500 text-white"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("lost");
                  // navigate("/tickets/complete");
                }}
              >
                Lost
              </button>
            </div>
            <button
              onClick={() => setActive(!active)}
              className={`flex items-center justify-center px-2 py-[4px] mt-[1.2rem] bg-gray-100  border border-gray-300 ${
                active && "bg-orange-600 text-white border-orange-500"
              }   rounded-md hover:shadow-md `}
            >
              <MdOutlineAnalytics className="h-7 w-7" />
            </button>



              <div className="flex justify-center items-center  mt-[1.2rem]   ">
                  <span
                      className={` p-2 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
                          showUserLeadChart && "bg-orange-500 text-white"
                            }`}
                      onClick={() => {
                        setShowUserLeadChart(prev => !prev);
                      }}
                      title="Show User Lead Chart"
                  > 
                  
                    <BsGraphUpArrow className="h-5 w-5  cursor-pointer" />
                  </span>
              </div>


              

              {/* Edit Multiple Job Button */}

              <div className="flex justify-center items-center  mt-[1.2rem]   ">
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
              </div>

          

         

              
            {/* Hide & Show Button And Fixed Component*/}
          <div className="flex justify-center items-center  mt-[1.2rem]   ">
            <div
              className={`  p-[6px]  rounded-md hover:shadow-md   bg-gray-50 cursor-pointer border  ${
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




           { auth?.user?.role?.name === "Admin" &&
              (
                <span
                className={`p-[6px] rounded-md hover:shadow-md bg-gray-50   cursor-pointer border  mt-[1.2rem] ${
                  showJobHolder && "bg-orange-500 text-white"
                }`}
                onClick={() => {
                   
                  setShowJobHolder(prev => !prev);
                }}
                title="Filter by Job Holder"
              >
                <IoBriefcaseOutline className="  cursor-pointer text-[22px] " />
              
              </span>
              )
            }


           {auth?.user?.role?.name === "Admin" && (
       
          <button
            title="Go to Leads Analytics"
            className="  p-[6px] rounded-md  bg-gray-50 hover:bg-orange-500 hover:text-white  hover:shadow-md transition   border  mt-[1.2rem] cursor-pointer"
            onClick={() => navigate("/leads/stats")}
          >
           
             <MdOutlineQueryStats className="   text-[22px] "/>
          </button>
        
      )}




            { auth?.user?.role?.name === "Admin" &&
              (
               <div className=" mt-[1.2rem] ">
                <RefreshLeadsButton getAllLeads={getAllLeads}/>
                </div>
              )
            }






          </div>
          {load && (
            <div className="py-3">
              <div class="loader"></div>
            </div>
          )}
          <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
          





                    {/* ----------Job_Holder Summery Filters---------- */}
                    {auth?.user?.role?.name === "Admin" && showJobHolder &&  (
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
                                        setColumnFromOutsideTable('jobHolder', "");
                                       
                                      }}
                                    >
                                     All  ( {getJobHolderCount("All", selectedTab)})

                                    </div>


                            {userName.map((user, index) => {

                                console.log("THE USER IS", user)

                                return (
                                  <Draggable
                                  key={user}
                                  draggableId={user}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      className={`py-1 rounded-tl-md w-[6rem] sm:w-fit rounded-tr-md px-1 !cursor-pointer font-[500] text-[14px] ${
                                        active1 === user &&
                                        "  border-b-2 text-orange-600 border-orange-600"
                                      }`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => {
                                        setActive1(user)
                                        setColumnFromOutsideTable('jobHolder', user);
                                         
                                        
                                      }}
                                    >
                                      
                                      {user} ( {getJobHolderCount(user, selectedTab)})

                                    </div>
                                  )}
                                  
                                  
                                </Draggable>

                                
                                
                              )

                            }
                                
                              )}
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




{active && (
            <>
              <div className="flex flex-col gap-2  py-1 px-4">
                <h3 className="font-semibold text-lg">Lead Source </h3>
                <div className="flex items-center gap-5">
                  {sources.map((source, i) => (
                    <div
                      className={`flex items-center gap-[2px] py-1 px-3 rounded-[2rem] text-white ${
                        source === "Invitation"
                          ? "bg-green-600"
                          : source === "Proposal"
                          ? "bg-pink-600"
                          : "bg-purple-600"
                      } `}
                      key={i}
                    >
                      <span className="font-medium text-[1rem]">{source}</span>
                      （{getSourceCount(source)} - {sourcePercentage(source)}%）
                    </div>
                  ))}
                </div>
              </div>
              <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
            </>

            
          )}




                  {/* Update Bulk Jobs */}
        {showEdit && (
          <div className="w-full  p-4 ">
            <form
              onSubmit={updateBulkLeads}
              className="w-full grid grid-cols-12 gap-4 max-2xl:grid-cols-8  "
            >

                <div className="inputBox w-full" >
                  <input
                    name="companyName"
                    type="text"
                    value={updates.companyName}
                    onChange={handle_on_change_update}
                    className={`${style.input} w-full `}
                    // placeholder="Company Name"
                  />
                  <span>Company Name</span>
                </div>

                <div className="inputBox w-full" >
                  <input
                    name="clientName"
                    type="text"
                    value={updates.clientName}
                    onChange={handle_on_change_update}
                    className={`${style.input} w-full `}
                  />
                  <span>Client Name</span>
                </div>

              <div className="w-full">
                <select
                  name="jobHolder"
                  value={updates.jobHolder}
                  
                  onChange={handle_on_change_update}
                  className={`${style.input} w-full`}
                   
                >
                  <option value="empty">Job Holder</option>
                  {users.map((jobHold, i) => (
                    <option value={jobHold.name} key={i}>
                      {jobHold.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <select
                  name="department"
                  value={updates.department}
                  
                  onChange={handle_on_change_update}
                  className={`${style.input} w-full`}
                   
                >
                  <option value="empty">Department</option>
                  {departments.map((department, i) => (
                    <option value={department} key={i}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <select
                  name="source"
                  value={updates.source}
                  
                  onChange={handle_on_change_update}
                  className={`${style.input} w-full`}
                  
                >
                  <option value="empty">Source</option>
                  {sources.map((source, i) => (
                    <option value={source} key={i}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <select
                  name="brand"
                  value={updates.brand}
                  
                  onChange={handle_on_change_update}
                  className={`${style.input} w-full`}
                   
                >
                  <option value="empty">Brand</option>
                  {brands.map((brand, i) => (
                    <option value={brand} key={i}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>


              <div className="inputBox w-full" >
                  <input
                    name="value"
                    type="text"
                    value={updates.value}
                    onChange={handle_on_change_update}
                    className={`${style.input} w-full `}
                  />
                  <span>Value</span>
                </div>

                <div className="inputBox w-full" >
                  <input
                    name="number"
                    type="text"
                    value={updates.number}
                    onChange={handle_on_change_update}
                    className={`${style.input} w-full `}
                  />
                  <span>Number</span>
                </div>

         


         
                <div className="w-full">
                    <select
                      name="lead_Source"
                      value={updates.lead_Source}
                      
                      onChange={handle_on_change_update}
                      className={`${style.input} w-full`}
                       
                    >
                      <option value="empty">Lead Source</option>
                      {leadSource.map((el, i) => (
                        <option value={el} key={i}>
                          {el}
                        </option>
                      ))}
                    </select>
              </div>

                  
                      

              <div className="inputBox" >
                <input
                  type="date"
                  name="followUpDate"
                  value={updates.followUpDate}
                  onChange={handle_on_change_update}
                  className={`${style.input} w-full `}
                />
                <span>Follow-Up Deadline</span>
              </div>


              <div className="inputBox" >
                <input
                  type="date"
                  name="JobDate"
                  value={updates.JobDate}
                  onChange={handle_on_change_update}
                  className={`${style.input} w-full `}
                />
                <span>Job Date</span>
              </div>
             


              
              
              <div className="">
                    <select
                      name="stage"
                      value={updates.stage}
                      
                      onChange={handle_on_change_update}
                      className={`${style.input} w-full`}
                       
                    >
                      <option value="empty">Stage</option>
                      {stages.map((el, i) => (
                        <option value={el} key={i}>
                          {el}
                        </option>
                      ))}
                    </select>
              </div>




              <div className="">
                    <select
                      name="status"
                      value={updates.status}
                      
                      onChange={handle_on_change_update}
                      className={`${style.input} w-full`}
                       
                    >
                      <option value="empty">Status</option>
                      {['progress', 'won', 'lost'].map((el, i) => (
                        <option value={el} key={i}>
                          {el}
                        </option>
                      ))}
                    </select>
              </div>

                

              <div className="inputBox w-full col-span-2" >
                  <input
                    name="Note"
                    type="text"
                    value={updates.Note}
                    onChange={handle_on_change_update}
                    className={`${style.input} w-full `}
                  />
                  <span>Note</span>
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
        </>

        {/* ---------Table Detail---------- */}
        <div className="w-full h-full">
          <div className="w-full min-h-[10vh] relative ">
              <div className="h-full hidden1 overflow-y-auto relative">
                {showUserLeadChart && <WonLeadsStats  users={users} auth={auth} active1={active1}/> }
                { !showUserLeadChart && <MaterialReactTable table={table} /> }
              </div>
            </div>
        </div>
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


       {/* ---------------New Ticket Modal------------- */}
            {showNewTicketModal && (
              <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
                <NewTicketModal
                  setShowSendModal={setShowNewTicketModal}
                  
                  clientCompanyName={clientCompanyName}

                  clientEmail= {clientEmail}
                />
              </div>
            )}








       {/* ---------------Sent/Received PopOver Filter------------- */}

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



           
    </>
  );
}
