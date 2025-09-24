import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Loader from "../../utlis/Loader";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import axios from "axios";
import { AiTwotoneDelete } from "react-icons/ai";
 
import { format } from "date-fns";
import { GrCopy } from "react-icons/gr";
import { FaTrophy } from "react-icons/fa6";
import { GiBrokenHeart } from "react-icons/gi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { MdOutlineAnalytics, MdOutlineModeEdit, MdOutlineQueryStats } from "react-icons/md";
import { RiProgress3Line } from "react-icons/ri";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { TbLoader2 } from "react-icons/tb";
import { style } from "../../utlis/CommonStyle";
import TicketsPopUp from "../shared/TicketsPopUp";
import { Popover, Typography } from "@mui/material";
import { IoTicketOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import getLeadColumns from "../../pages/Lead/table/columns";
import { NumberFilterPortal, NumderFilterFn } from "../../utlis/NumberFilterPortal";
import DateRangePopover from "../../utlis/DateRangePopover";
import { ActionsCell } from "../../pages/Lead/ActionsCell";
import NewTicketModal from "../../utlis/NewTicketModal";
import { useNavigate } from "react-router-dom";
import { BsGraphUpArrow } from "react-icons/bs";
import UserLeadChart from "../../pages/Lead/userLeadChart/UserLeadChart";





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



const Leads = forwardRef(({ childRef, setIsload }, ref) => {
 const navigate = useNavigate();
   const auth = useSelector((state => state.auth.auth));
  const [selectedTab, setSelectedTab] = useState("progress");
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [load, setLoad] = useState(false);
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
    yearEnd: ""
  });
  const [active, setActive] = useState(false);
  const [selectFilter, setSelectFilter] = useState("");



      const boxRef = useRef(null);
  const [showUserLeadChart, setShowUserLeadChart] = useState(false);

  
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




    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [clientCompanyName, setClientCompanyName] = useState("");
    const [clientEmail, setClientEmail] = useState("");



  const [valueTotal, setValueTotal] = useState(0);
    
    const anchorRef = useRef(null);
  
  const [filterInfo, setFilterInfo] = useState({
    col: null,
    value: "",
    type: "eq",
  });
  
  
    // Filter Total Value
    useEffect(() => {
      const totalvalue = filteredData.reduce(
        (acc, item) => acc + Number(item.value || 0),
        0
      );
      console.log("totalvalue:", totalvalue);
      setValueTotal(totalvalue);
    }, [filteredData]);
  
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
    "yearEnd"
    // "Fee",
    // "Source",
    // "ClientType",
    // "CC_Person",
    // "AC",
    // "SignUp_Date",
  ];

  const [columnVisibility, setColumnVisibility] = useState(() => {
    const savedVisibility = JSON.parse(
      localStorage.getItem("columnVisibilityLead_mylist")
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
    localStorage.setItem("columnVisibilityLead_mylist", JSON.stringify(updatedVisibility));
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
          setIsLoading(false);
        }
      } else if (selectedTab === "won") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/won/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setIsLoading(false);
        }
      } else {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/lost/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllLeads();
  }, [selectedTab]);

  const getLeads = async () => {
    setLoad(true);
    setIsload(true);
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
      setIsload(false);
      setLoad(false);
    }
  };

  useImperativeHandle(childRef, () => ({
    refreshData: getLeads,
  }));

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

      setUserName(
        data?.users
          ?.filter((user) =>
            user.role?.access.some((item) => item?.permission.includes("Leads"))
          )
          .map((user) => user.name)
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

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
        getLeads();
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
        getLeads();
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

    console.log("updateData", updateData);

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/update/lead/${leadId}`,
        { ...updateData }
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
        getLeads();
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
        }
      );
      if (data) {
        getLeads();
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
  };

  useImperativeHandle(ref, () => ({
    handleClearFilters,
  }));

  const table = useMaterialReactTable({
    columns,
    data: leadData || [],


    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    enableBatchRowSelection: true,

    getRowId: (row) => row._id,
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
    initialState: {
      pagination: { pageSize: 20 },
      pageSize: 20,
      density: "compact",
    },

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

  useEffect(() => {
    const filteredRows = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    console.log("Filtered Data:", filteredRows);
    setFilteredData(filteredRows);
  }, [table.getFilteredRowModel().rows]);



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
      <div className=" relative w-full h-full overflow-y-auto">
        {/*  */}
        <>
          <div className="flex items-center gap-5">
            <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden mt-2 transition-all duration-300 w-fit">
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
                }}
              >
                Lost
              </button>
            </div>
{/* Toggle Analytics Button */}
<button
  onClick={() => setActive(!active)}
  title="Toggle Analytics"
  className={`flex items-center justify-center p-2 mt-2 bg-gray-50 border rounded-md hover:shadow-md transition
    ${active ? "bg-orange-600 text-white border-orange-500" : "border-gray-300"}`}
>
  <MdOutlineAnalytics className="h-6 w-6" />
</button>

{/* Edit Multiple Job Button */}
<button
  onClick={() => setShowEdit(!showEdit)}
  title="Edit Multiple Jobs"
  className={`flex items-center justify-center p-2 mt-2 bg-gray-50 border rounded-md hover:shadow-md transition
    ${showEdit ? "bg-orange-500 text-white" : ""}`}
>
  <MdOutlineModeEdit className="h-6 w-6" />
</button>

{/* Leads Analytics Button */}
<button
  title="Go to Leads Analytics"
  onClick={() => navigate("/leads/stats")}
  className="flex items-center justify-center p-2 mt-2 bg-gray-50 border rounded-md hover:shadow-md transition"
>
  <MdOutlineQueryStats className="h-6 w-6" />
</button>

{/* User Lead Chart Button */}
<button
  onClick={() => setShowUserLeadChart((prev) => !prev)}
  title="Show User Lead Chart"
  className={`flex items-center justify-center p-2 mt-2 bg-gray-50 border rounded-md hover:shadow-md transition
    ${showUserLeadChart ? "bg-orange-500 text-white" : ""}`}
>
  <BsGraphUpArrow className="h-6 w-6" />
</button>

{/* Hide & Show Column Button */}
<div className="flex justify-center items-center mt-2">
  <button
    onClick={() => setShowColumn(!showcolumn)}
    title="Toggle Columns"
    className={`flex items-center justify-center p-2 bg-gray-50 border rounded-md hover:shadow-md transition
      ${showcolumn ? "bg-orange-500 text-white" : ""}`}
  >
    {showcolumn ? (
      <GoEyeClosed className="h-6 w-6" />
    ) : (
      <GoEye className="h-6 w-6" />
    )}
  </button>

  {showcolumn && (
    <div
      ref={boxRef}
      className="fixed top-[11rem] right-[20%] z-[99] max-h-[80vh] overflow-y-auto"
    >
      {renderColumnControls()}
    </div>
  )}
</div>



          </div>
          <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
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
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-screen px-4 py-4">
              <Loader />
            </div>
          ) : (
            <div className="w-full min-h-[10vh] relative ">
              <div className="h-full hidden1 overflow-y-scroll relative">
               {showUserLeadChart && <UserLeadChart   auth={auth}/> }
                               { !showUserLeadChart && <MaterialReactTable table={table} /> }
              </div>
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

        </div>
      </div>
    </>
  );
});

export default Leads;
