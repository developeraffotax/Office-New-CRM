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
import { MdOutlineAnalytics, MdOutlineModeEdit } from "react-icons/md";
 
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
    "createdAt",
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

        



        
const allColumns = [{
  accessorKey: "companyName",
  minSize: 100,
  maxSize: 200,
  size: 170,
  grow: false,
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
            setSelectFilter("");
          }}
        >
          Company Name
        </span>
        <input
          type="search"
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        />
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const companyName = row.original.companyName;
    const [show, setShow] = useState(false);
    const [localCompanyName, setLocalCompanyName] = useState(companyName);

    const handleSubmit = (e) => {
      setFormData((prevData) => ({
        ...prevData,
        companyName: localCompanyName,
      }));

      handleUpdateData(row.original._id, {
         
        companyName: localCompanyName,
      });

      setShow(false);
    };

    return (
      <div className="w-full px-1">
        {show ? (
          <input
            type="text"
            value={localCompanyName}
            autoFocus
            onChange={(e) => setLocalCompanyName(e.target.value)}
            onBlur={(e) => handleSubmit(e.target.value)}

            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // optional: prevents form submission if inside a form
                handleSubmit();
              }
              if (e.key === "Escape") {
                  
                  setShow(false); 
              }
            }}

            className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
          />
        ) : (
          <div
            onDoubleClick={() => setShow(true)}
            onClick={(event) => {
              if (event.ctrlKey) {
                navigator.clipboard.writeText(companyName);
                toast.success(`Copied to clipboard! | ${companyName}`);
              }
            }}
            className="cursor-pointer w-full"
          >
            {localCompanyName ? (
              localCompanyName
            ) : (
              <div className="text-white w-full h-full">.</div>
            )}
          </div>
        )}
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
  accessorKey: "clientName",
  minSize: 100,
  maxSize: 200,
  size: 160,
  grow: false,
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
            setSelectFilter("");
          }}
        >
          Client Name
        </span>
        <input
          type="search"
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        />
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const clientName = row.original.clientName;
    const [show, setShow] = useState(false);
    const [localClientName, setLocalClientName] = useState(clientName);

    const handleSubmit = (e) => {
      setFormData((prevData) => ({
        ...prevData,
        clientName: localClientName,
      }));

      handleUpdateData(row.original._id, {
        
        clientName: localClientName,
      });

      setShow(false);
    };






    return (
      <>
        <div className="w-full px-1">
        {show ? (
          <input
            type="text"
            value={localClientName}
            autoFocus
            onChange={(e) => setLocalClientName(e.target.value)}
             
            onBlur={(e) => handleSubmit(e.target.value)}

            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // optional: prevents form submission if inside a form
                handleSubmit();
              }

               if (e.key === "Escape") {
                  
                  setShow(false); 
              }
            }}
            className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
          />
        ) : (
          <div
            onDoubleClick={() => setShow(true)}
            onClick={(event) => {
              if (event.ctrlKey) {
                navigator.clipboard.writeText(clientName);
                toast.success(`Copied to clipboard! | ${clientName}`);
              }
            }}
            className="cursor-pointer w-full"
             
          >
            {localClientName ? (
              localClientName
            ) : (
              <div className="text-white w-full h-full">.</div>
            )}
          </div>
        )}
      </div>




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
  accessorKey: "jobHolder",
  header: "Job Holder",
  Header: ({ column }) => {
    const user = auth?.user?.name;

    //sets the filter on mounting.
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
            setSelectFilter("");
          }}
        >
          Job Holder
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {users?.map((jobhold, i) => (
            <option key={i} value={jobhold?.name}>
              {jobhold?.name}
            </option>
          ))}

          <option value="empty">Empty</option>
        </select>
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const jobholder = row.original.jobHolder;
    const [localJobholder, setLocalJobholder] = useState(jobholder || "");
    const [show, setShow] = useState(false);

    const handleChange = (e) => {
      const selectedValue = e.target.value;
      setLocalJobholder(selectedValue);

      setFormData((prevData) => ({
        ...prevData,
        jobHolder: localJobholder,
      }));

      handleUpdateData(row.original._id, {
         
        jobHolder: selectedValue,
      });
      setShow(false);
    };

    return (
      <div className="w-full">
        {show ? (
          <select
            value={localJobholder || ""}
            className="w-full h-[2rem] rounded-md border-none  outline-none"
            onChange={handleChange}
          >
            <option value="empty"></option>
            {users?.map((jobHold, i) => (
              <option value={jobHold?.name} key={i}>
                {jobHold.name}
              </option>
            ))}
          </select>
        ) : (
          <div
            className="w-full cursor-pointer"
            onDoubleClick={() => setShow(true)}
          >
            {jobholder ? (
              <span>{jobholder}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
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


  // filterFn: "equals",
  filterSelectOptions: users.map((jobhold) => jobhold.name),
  filterVariant: "select",
  size: 110,
  minSize: 80,
  maxSize: 130,
  grow: false,
},
{
  accessorKey: "department",
  minSize: 100,
  maxSize: 200,
  size: 120,
  grow: false,
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
            setSelectFilter("");
          }}
        >
          Department
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {departments.map((dep, i) => (
            <option value={dep} key={i}>
              {dep}
            </option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const department = row.original.department;
    const [show, setShow] = useState(false);

    const [localDepartment, setLocalDepartment] = useState(
      department || ""
    );

    const handleChange = (e) => {
      const selectedValue = e.target.value;
      setLocalDepartment(selectedValue);

      setFormData((prevData) => ({
        ...prevData,
        department: localDepartment,
      }));

      handleUpdateData(row.original._id, {
         
        department: selectedValue,
      });

      setShow(false);
    };

    return (
      <div className="w-full ">
        {!show ? (
          <div
            className="w-full cursor-pointer"
            onDoubleClick={() => setShow(true)}
          >
            {department ? (
              <span>{department}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
        ) : (
          <select
            value={localDepartment || ""}
            className="w-full h-[2rem] rounded-md border-none  outline-none"
            onChange={handleChange}
          >
            <option value="empty"></option>
            {departments?.map((depart, i) => (
              <option value={depart} key={i}>
                {depart}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  },
  // filterFn: "equals",
  // filterSelectOptions: departments?.map((dep) => dep),
  // filterVariant: "select",

  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId);
    return String(cellValue ?? "") === String(filterValue);
  },



},
{
  accessorKey: "source",
  minSize: 90,
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
            setSelectFilter("");
          }}
        >
          Source
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {sources.map((source) => (
            <option value={source}>{source}</option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const source = row.original.source;
    const [show, setShow] = useState(false);
    const [localSource, setLocalSource] = useState(source || "");

    const handleChange = (e) => {
      const selectedValue = e.target.value;
      setLocalSource(selectedValue);

      setFormData((prevData) => ({
        ...prevData,
        source: localSource,
      }));

      handleUpdateData(row.original._id, {
         
        source: selectedValue,
      });

      setShow(false);
    };
    return (
      <div className="w-full ">
        {!show ? (
          <div
            className="w-full cursor-pointer"
            onDoubleClick={() => setShow(true)}
          >
            {source ? (
              <span>{source}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
        ) : (
          <select
            value={localSource || ""}
            className="w-full h-[2rem] rounded-md border-none  outline-none"
            onChange={handleChange}
          >
            <option value="empty"></option>
            {sources?.map((sour, i) => (
              <option value={sour} key={i}>
                {sour}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  },
  // filterFn: "equals",
  // filterSelectOptions: sources?.map((source) => source),
  // filterVariant: "select",

  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId);
    return String(cellValue ?? "") === String(filterValue);
  },
},
{
  accessorKey: "brand",
  minSize: 80,
  maxSize: 150,
  size: 90,
  grow: false,
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
            setSelectFilter("");
          }}
        >
          Brand
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {brands.map((brand) => (
            <option value={brand}>{brand}</option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const brand = row.original.brand;
    const [show, setShow] = useState(false);
    const [localBrand, setLocalBrand] = useState(brand || "");

    const handleChange = (e) => {
      const selectedValue = e.target.value;
      setLocalBrand(selectedValue);

      setFormData((prevData) => ({
        ...prevData,
        brand: localBrand,
      }));

      handleUpdateData(row.original._id, {
         
        brand: selectedValue,
      });

      setShow(false);
    };

    return (
      <div className="w-full ">
        {!show ? (
          <div
            className="w-full cursor-pointer"
            onDoubleClick={() => setShow(true)}
          >
            {brand ? (
              <span>{brand}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
        ) : (
          <select
            value={localBrand || ""}
            className="w-full h-[2rem] rounded-md border-none  outline-none"
            onChange={handleChange}
          >
            <option value="empty"></option>
            {brands?.map((brand, i) => (
              <option value={brand} key={i}>
                {brand}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  },
  // filterFn: "equals",
  // filterSelectOptions: brands?.map((brand) => brand),
  // filterVariant: "select",

  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId);
    return String(cellValue ?? "") === String(filterValue);
  },


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
  accessorKey: "value",
  minSize: 50,
  maxSize: 100,
  size: 60,
  grow: false,
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
            setSelectFilter("");
          }}
        >
          Value
        </span>
        <span className="border rounded px-2 py-1 text-sm ">
          {valueTotal}
        </span>
        {/* <input
          type="text"
          placeholder=""
          className="border rounded px-2 py-1 text-sm outline-none"
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
        /> */}
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const value = row.original.value;
    const [show, setShow] = useState(false);
    const [localValue, setLocalValue] = useState(value || "");

    const handleChange = (e) => {
      setFormData((prevData) => ({
        ...prevData,
        value: localValue,
      }));

      handleUpdateData(row.original._id, {
         
        value: localValue,
      });

      setShow(false);
    };

    return (
      <div className="w-full ">
        {!show ? (
          <div
            className="w-full cursor-pointer flex items-center justify-center"
            onDoubleClick={() => setShow(true)}
          >
            {value ? (
              <span>{value}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
        ) : (
          <input
            value={localValue || ""}
            className="w-full h-[2rem] px-1 rounded-md border-none  outline-none"
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={(e) => handleChange(e.target.value)}
          />
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId);
    if (cellValue == null) return false;
    return cellValue.toString().includes(filterValue.toString());
  },

  filterVariant: "select",
},
// Number
{
  accessorKey: "number",
  minSize: 50,
  maxSize: 100,
  size: 70,
  grow: false,
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
            setSelectFilter("");
          }}
        >
          Number
        </span>
        <input
          type="text"
          placeholder=""
          className="border rounded px-2 py-1 text-sm outline-none"
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
        />
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const number = row.original.number;
    const [show, setShow] = useState(false);
    const [localValue, setLocalValue] = useState(number || "");

    const handleChange = (e) => {
      setFormData((prevData) => ({
        ...prevData,
        number: localValue,
      }));

      handleUpdateData(row.original._id, {
         
        number: localValue,
      });

      setShow(false);
    };

    return (
      <div className="w-full ">
        {!show ? (
          <div
            className="w-full cursor-pointer flex items-center justify-center"
            onDoubleClick={() => setShow(true)}
          >
            {number ? (
              <span>{number}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
        ) : (
          <input
            value={localValue || ""}
            className="w-full h-[2rem] px-1 rounded-md border-none  outline-none"
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={(e) => handleChange(e.target.value)}
          />
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId);
    if (cellValue == null) return false;
    return cellValue.toString().includes(filterValue.toString());
  },

  filterVariant: "select",
},
{
  accessorKey: "lead_Source",
  minSize: 100,
  maxSize: 150,
  size: 110,
  grow: false,
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
            setSelectFilter("");
          }}
        >
          Lead Source
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {leadSource.map((leadS) => (
            <option value={leadS}>{leadS}</option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const lead_Source = row.original.lead_Source;
    const [show, setShow] = useState(false);
    const [localLead, setLocalLead] = useState(lead_Source || "");

    const handleChange = (e) => {
      const selectedValue = e.target.value;
      setLocalLead(selectedValue);

      setFormData((prevData) => ({
        ...prevData,
        lead_Source: localLead,
      }));

      handleUpdateData(row.original._id, {
         
        lead_Source: selectedValue,
      });

      setShow(false);
    };

    return (
      <div className="w-full ">
        {!show ? (
          <div
            className="w-full cursor-pointer"
            onDoubleClick={() => setShow(true)}
          >
            {lead_Source ? (
              <span>{lead_Source}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
        ) : (
          <select
            value={localLead || ""}
            className="w-full h-[2rem] rounded-md border-none  outline-none"
            onChange={handleChange}
          >
            <option value="empty"></option>
            {leadSource?.map((leads, i) => (
              <option value={leads} key={i}>
                {leads}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  },
  // filterFn: "equals",
  // filterSelectOptions: leadSource?.map((leads) => leads),
  // filterVariant: "select",

  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId);
    return String(cellValue ?? "") === String(filterValue);
  },
},
//   Created At
{
  accessorKey: "createdAt",
  Header: ({ column }) => {
    const [filterValue, setFilterValue] = useState("");
    
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [showPopover, setShowPopover] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
      if (filterValue === "Custom Range") {
        column.setFilterValue(dateRange);
      } else {
        column.setFilterValue(filterValue);
      }
    }, [dateRange, filterValue]);

    const handleFilterChange = (e) => {
      const val = e.target.value;
      setFilterValue(val);
      
      if (val === "Custom Range") {
        setShowPopover(true);
      } else {
        setShowPopover(false);
      }
    };


    

    const handleRangeChange = (key, value) => {
      setDateRange((prev) => ({ ...prev, [key]: value }));
    };


    return (
      <div className="flex flex-col gap-[2px] relative">
                    <span
                      className="ml-1 cursor-pointer"
                      title="Clear Filter"
                      onClick={() => {
                        setFilterValue("");
                        setDateRange({ from: "", to: "" });
                        column.setFilterValue("");
                      }}
                    >
                      Created Date
                    </span>

                    <select
                      ref={selectRef}
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
                      <option  value="Custom Range">Custom Date</option>
                    </select>

                    {showPopover && (
                      <DateRangePopover
                        anchorRef={selectRef}
                        
                        onChange={handleRangeChange}
                        onClose={() => setShowPopover(false)}
                      />
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
  filterFn: DateFilterFn,

  filterSelectOptions: [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 15 days",
    "Last 30 Days",
    "Last 60 Days",
    
  ],
  filterVariant: "custom",
  size: 100,
  minSize: 90,
  maxSize: 110,
  grow: false,
},
//   Follow Up














{
  accessorKey: "followUpDate",
  Header: ({ column }) => {
    const [filterValue, setFilterValue] = useState("");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [showPopover, setShowPopover] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
      if (filterValue === "Custom Range") {
        column.setFilterValue(dateRange);
      } else {
        column.setFilterValue(filterValue);
      }
    }, [dateRange, filterValue]);

    const handleFilterChange = (e) => {
      const val = e.target.value;
      setFilterValue(val);
      
      if (val === "Custom Range") {
        setShowPopover(true);
      } else {
        setShowPopover(false);
      }
    };


    

    const handleRangeChange = (key, value) => {
      setDateRange((prev) => ({ ...prev, [key]: value }));
    };
    
    return (
      <div className="flex flex-col gap-[2px] relative">
                    <span
                      className="ml-1 cursor-pointer"
                      title="Clear Filter"
                      onClick={() => {
                        setFilterValue("");
                        setDateRange({ from: "", to: "" });
                        column.setFilterValue("");
                      }}
                    >
                      Follow-Up Date
                    </span>

                    <select
                      ref={selectRef}
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
                      <option  value="Custom Range">Custom Date</option>
                    </select>

                    {showPopover && (
                      <DateRangePopover
                        anchorRef={selectRef}
                         
                        onChange={handleRangeChange}
                        onClose={() => setShowPopover(false)}
                      />
                    )}
                  </div>
    );
  },
  Cell: ({ cell, row }) => {
    const followUpDate = row.original.followUpDate;
    const [date, setDate] = useState(() => {
      const cellDate = new Date(
        cell.getValue() || "2024-09-20T12:43:36.002+00:00"
      );
      return cellDate.toISOString().split("T")[0];
    });

    const [showStartDate, setShowStartDate] = useState(false);

    const handleDateChange = (newDate) => {
      setDate(newDate);
      handleUpdateData(row.original._id, {
         
        followUpDate: newDate,
      });
      setShowStartDate(false);
    };

    return (
      <div className="w-full flex  ">
        {!showStartDate ? (
          <p
            onDoubleClick={() => setShowStartDate(true)}
            className="w-full"
          >
            {followUpDate ? (
              format(new Date(followUpDate), "dd-MMM-yyyy")
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

    // if (filterValue.includes("-")) {
    //   const [year, month] = filterValue.split("-");
    //   const cellYear = cellDate.getFullYear().toString();
    //   const cellMonth = (cellDate.getMonth() + 1)
    //     .toString()
    //     .padStart(2, "0");

    //   return year === cellYear && month === cellMonth;
    // }

    // Other filter cases
    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );


    if (typeof filterValue === "object" && filterValue.from && filterValue.to) {
    const fromDate = new Date(filterValue.from);
    const toDate = new Date(filterValue.to);
    return cellDate >= fromDate && cellDate <= toDate;
  }

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
    
  ],
  filterVariant: "custom",
  size: 120,
  minSize: 90,
  maxSize: 120,
  grow: false,
},
// Days
{
  accessorKey: "Days",
  Header: ({ column }) => {
    return (
      <div className="w-full flex flex-col gap-[2px]">
        <span
          className="cursor-pointer"
          title="Clear Filter"
          onClick={() => column.setFilterValue("")}
        >
          Days
        </span>
        {/* <input
          type="text"
          placeholder="Search Days..."
          className="border rounded px-2 py-1 text-sm outline-none"
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
        /> */}
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          <option value="0-10">0-10</option>
          <option value="10-20">10-20</option>
          <option value="20-30">20-30</option>
          <option value="30+">30+</option>
        </select>
      </div>
    );
  },
  Cell: ({ row }) => {
    const createdAt = new Date(row.original.createdAt);
    const deadline = new Date(row.original.followUpDate);

    if (!createdAt || !deadline) return <div>N/A</div>;

    const timeDifference = deadline.getTime() - createdAt.getTime();
    const dayDifference = Math.ceil(
      timeDifference / (1000 * 60 * 60 * 24)
    );

    return (
      <div className="w-full text-center">
        {dayDifference >= 0 ? (
          `${dayDifference} Days`
        ) : (
          <span className="text-red-500">Expired</span>
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const createdAt = new Date(row.original.createdAt);
    const deadline = new Date(row.original.followUpDate);

    if (!createdAt || !deadline) return false;

    const timeDifference = deadline.getTime() - createdAt.getTime();
    const dayDifference = Math.ceil(
      timeDifference / (1000 * 60 * 60 * 24)
    );

    if (filterValue === "30+") {
      return dayDifference >= 30;
    }

    const [min, max] = filterValue.split("-").map(Number);
    return dayDifference >= min && dayDifference <= max;
  },
  // filterFn: (row, columnId, filterValue) => {
  //   const createdAt = new Date(row.original.createdAt);
  //   const deadline = new Date(row.original.followUpDate);

  //   if (!createdAt || !deadline) return false;

  //   const timeDifference = deadline.getTime() - createdAt.getTime();
  //   const dayDifference = Math.ceil(
  //     timeDifference / (1000 * 60 * 60 * 24)
  //   );

  //   // alert(dayDifference);

  //   return dayDifference.toString().includes(filterValue);
  // },
  enableColumnFilter: true,
  size: 70,
  minSize: 60,
  maxSize: 120,
  grow: false,
},
//   Stages
{
  accessorKey: "stage",
  minSize: 80,
  maxSize: 150,
  size: 90,
  grow: false,
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
            setSelectFilter("");
          }}
        >
          Stages
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {stages.map((stage) => (
            <option value={stage}>{stage}</option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const stage = row.original.stage;
    const [show, setShow] = useState(false);
    const [localStage, setLocalStage] = useState(stage || "");

    const handleChange = (e) => {
      const selectedValue = e.target.value;
      setLocalStage(selectedValue);

      setFormData((prevData) => ({
        ...prevData,
        stage: localStage,
      }));

      handleUpdateData(row.original._id, {
        
        stage: selectedValue,
      });

      setShow(false);
    };
    return (
      <div className="w-full ">
        {!show ? (
          <div
            className="w-full cursor-pointer"
            onDoubleClick={() => setShow(true)}
          >
            {stage ? (
              <span>{stage}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
        ) : (
          <select
            value={localStage || ""}
            className="w-full h-[2rem] rounded-md border-none  outline-none"
            onChange={handleChange}
          >
            <option value="empty"></option>
            {stages?.map((stage, i) => (
              <option value={stage} key={i}>
                {stage}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  },
  filterFn: "equals",
  filterSelectOptions: stages?.map((stage) => stage),
  filterVariant: "select",
},











        // End  year
        {
          
          accessorKey: "yearEnd",
          Header: ({ column }) => {
            const [filterValue, setFilterValue] = useState("");
            const [dateRange, setDateRange] = useState({ from: "", to: "" });
                           const [showPopover, setShowPopover] = useState(false);
                           const selectRef = useRef(null);
           
                           useEffect(() => {
                             if (filterValue === "Custom Range") {
                               column.setFilterValue(dateRange);
                             } else {
                               column.setFilterValue(filterValue);
                             }
                           }, [dateRange, filterValue]);
           
                           const handleFilterChange = (e) => {
                             const val = e.target.value;
                             setFilterValue(val);
                             
                             if (val === "Custom Range") {
                               setShowPopover(true);
                             } else {
                               setShowPopover(false);
                             }
                           };
           
           
                           
           
                           const handleRangeChange = (key, value) => {
                             setDateRange((prev) => ({ ...prev, [key]: value }));
                           };
            return (
              <div className="flex flex-col gap-[2px] relative">
                                  <span
                                    className="ml-1 cursor-pointer"
                                    title="Clear Filter"
                                    onClick={() => {
                                      setFilterValue("");
                                      setDateRange({ from: "", to: "" });
                                      column.setFilterValue("");
                                    }}
                                  >
                                    Year End
                                  </span>
              
                                  <select
                                    ref={selectRef}
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
                                    <option  value="Custom Range">Custom Date</option>
                                  </select>
              
                                  {showPopover && (
                                    <DateRangePopover
                                      anchorRef={selectRef}
                                       
                                      onChange={handleRangeChange}
                                      onClose={() => setShowPopover(false)}
                                    />
                                  )}
                                </div>
            );
          },
          Cell: ({ cell, row }) => {
            const [date, setDate] = useState(() => {

              console.log("cell value yearEnd:", cell.getValue());

              if(!cell.getValue()) {
                return '';
              }
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
              // handleUpdateDates(row?.original?._id, newDate, "yearEnd");

              setFormData((prevData) => ({
                ...prevData,
                yearEnd: date
              }));
              handleUpdateData(row.original._id, {
                 
                yearEnd: date
              });


              setShowYearend(false);
            };

            return (
              <div className="w-full ">
                {!showYearend  ? (
                  <p onDoubleClick={() => setShowYearend(true)}>
                    {
                      date ? format(new Date(date), "dd-MMM-yyyy") : '--'
                    }
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

            

            // Other filter cases
            const today = new Date();
            const startOfToday = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );

                if (typeof filterValue === "object" && filterValue.from && filterValue.to) {
                const fromDate = new Date(filterValue.from);
                const toDate = new Date(filterValue.to);
                return cellDate >= fromDate && cellDate <= toDate;
              }

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
          
          ],
          filterVariant: "custom",
          size: 115,
          minSize: 80,
          maxSize: 140,
          grow: false,
        },






        // Job DeadLine
        {
          
          accessorKey: "jobDeadline",
          header: "Deadline",
          Header: ({ column }) => {
            const [filterValue, setFilterValue] = useState("");
            const [dateRange, setDateRange] = useState({ from: "", to: "" });
                            const [showPopover, setShowPopover] = useState(false);
                            const selectRef = useRef(null);
            
                            useEffect(() => {
                              if (filterValue === "Custom Range") {
                                column.setFilterValue(dateRange);
                              } else {
                                column.setFilterValue(filterValue);
                              }
                            }, [dateRange, filterValue]);
            
                            const handleFilterChange = (e) => {
                              const val = e.target.value;
                              setFilterValue(val);
                              
                              if (val === "Custom Range") {
                                setShowPopover(true);
                              } else {
                                setShowPopover(false);
                              }
                            };
            
            
                            
            
                            const handleRangeChange = (key, value) => {
                              setDateRange((prev) => ({ ...prev, [key]: value }));
                            };
            return (
              <div className="flex flex-col gap-[2px] relative">
                                  <span
                                    className="ml-1 cursor-pointer"
                                    title="Clear Filter"
                                    onClick={() => {
                                      setFilterValue("");
                                      setDateRange({ from: "", to: "" });
                                      column.setFilterValue("");
                                    }}
                                  >
                                    Deadline
                                  </span>
              
                                  <select
                                    ref={selectRef}
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
                                    <option  value="Custom Range">Custom Date</option>
                                  </select>
              
                                  {showPopover && (
                                    <DateRangePopover
                                      anchorRef={selectRef}
                                       
                                      onChange={handleRangeChange}
                                      onClose={() => setShowPopover(false)}
                                    />
                                  )}
                                </div>
            );
          },
          Cell: ({ cell, row }) => {
            const [date, setDate] = useState(() => {

              if(!cell.getValue()) {
                return '';
              }

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
              // handleUpdateDates(row.original._id, newDate, "jobDeadline");

              setFormData((prevData) => ({
                ...prevData,
                jobDeadline: date
              }));
              handleUpdateData(row.original._id, {
                 
                jobDeadline: date
              });



              setShowDeadline(false);
            };

            const cellDate = new Date(date);
            const today = new Date();
            const isExpired = cellDate < today;

            return (
              <div className="w-full ">
                {!showDeadline ? (
                  <p onDoubleClick={() => setShowDeadline(true)}>
                    {
                      date ? format(new Date(date), "dd-MMM-yyyy") : "--"
                    }
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

            
            // Other filter cases
            const today = new Date();
            const startOfToday = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );

            if (typeof filterValue === "object" && filterValue.from && filterValue.to) {
    const fromDate = new Date(filterValue.from);
    const toDate = new Date(filterValue.to);
    return cellDate >= fromDate && cellDate <= toDate;
  }

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
           
          ],
          filterVariant: "custom",
          size: 115,
          minSize: 80,
          maxSize: 140,
          grow: false,
        },







































// <-----Action------>
{
  accessorKey: "actions",
  header: "Actions",
   
   
  
   Cell: ({ row }) => <ActionsCell row={row}  setClientCompanyName={setClientCompanyName} setClientEmail={setClientEmail} setShowNewTicketModal={setShowNewTicketModal} handleCopyLead={handleCopyLead} handleLeadStatus={handleLeadStatus} handleDeleteLeadConfirmation={handleDeleteLeadConfirmation}  selectedTab={selectedTab}  />,
  size: 240,
 


},


































//  --- Email--->
{
  accessorKey: "email",
  minSize: 200,
  maxSize: 500,
  size: 250,
  grow: false,
    
     
    
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
            setSelectFilter("");
          }}
        >
          Email
        </span>
        <input
          type="search"
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] w-[240px] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        />
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const email = row.original.email;
    const [show, setShow] = useState(false);
    const [localEmail, setLocalEmail] = useState(email);

    const handleSubmit = (e) => {
      e.preventDefault();
      setFormData((prevData) => ({
        ...prevData,
        email: localEmail,
      }));
      handleUpdateData(row.original._id, {
         
        email: localEmail,
      });
      setShow(false);
    };

    return (
      <div className="w-full px-1">
        {show ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={localEmail}
              autoFocus
              onChange={(e) => setLocalEmail(e.target.value)}
              className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
            />
          </form>
        ) : (
          <div
            onDoubleClick={() => setShow(true)}
            className="cursor-pointer w-full"
          >
            {localEmail ? (
              localEmail.length > 80 ? (
                <span>{localEmail.slice(0, 80)}...</span>
              ) : (
                <span>{localEmail}</span>
              )
            ) : (
              <div className="text-white w-full h-full">.</div>
            )}
          </div>
        )}
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




















//  --- Note--->
{
  accessorKey: "Note",
  minSize: 200,
  maxSize: 500,
  size: 350,
  grow: false,
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
            setSelectFilter("");
          }}
        >
          Note
        </span>
        <input
          type="search"
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
            setSelectFilter(e.target.value);
          }}
          className="font-normal h-[1.8rem] w-[340px] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        />
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const note = row.original.Note;
    const [show, setShow] = useState(false);
    const [localNote, setLocalNote] = useState(note);

    const handleSubmit = (e) => {
      e.preventDefault();
      setFormData((prevData) => ({
        ...prevData,
        Note: localNote,
      }));
      handleUpdateData(row.original._id, {
         
        Note: localNote,
      });
      setShow(false);
    };

    return (
      <div className="w-full px-1">
        {show ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={localNote}
              autoFocus
              onChange={(e) => setLocalNote(e.target.value)}
              className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
            />
          </form>
        ) : (
          <div
            onDoubleClick={() => setShow(true)}
            className="cursor-pointer w-full"
          >
            {note ? (
              note.length > 46 ? (
                <span>{note.slice(0, 46)}...</span>
              ) : (
                <span>{note}</span>
              )
            ) : (
              <div className="text-white w-full h-full">.</div>
            )}
          </div>
        )}
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


























]



return allColumns.filter((col) => columnVisibility[col.accessorKey]);








    },

    // eslint-disable-next-line
    [users, auth, leadData, load, valueTotal, filteredData, showcolumn, columnVisibility]
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
      showSkeletons: false
        
     

      
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
                                      className={`py-1 rounded-tl-md w-[6rem] sm:w-fit rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
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
                <MaterialReactTable table={table} />
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
