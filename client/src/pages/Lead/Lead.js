import React, { useEffect, useMemo, useRef, useState } from "react";

import { IoBriefcaseOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import axios from "axios";

import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  MdOutlineAnalytics,
  MdOutlineModeEdit,
  MdOutlineQueryStats,
} from "react-icons/md";

import SendEmailModal from "../../components/Tickets/SendEmailModal";

import NewTicketModal from "../../utlis/NewTicketModal";
import { ActionsCell } from "./ActionsCell";
import DateRangePopover from "../../utlis/DateRangePopover";
import {
  NumberFilterPortal,
  NumderFilterFn,
} from "../../utlis/NumberFilterPortal";
import { useSelector } from "react-redux";
import { Box, LinearProgress } from "@mui/material";
import { getLeadColumns } from "./table/columns";
import WonLeadsStats from "./userLeadChart/UserLeadChart";
import UserLeadChart from "./userLeadChart/UserLeadChart";
import EmailDetailDrawerNewWrapper from "../../components/shared/EmailDetailDrawerNewWrapper";
import { usePersistedUsers } from "../../hooks/usePersistedUsers";
import { LeadUserProvider } from "./contextApi/UserContext";
import { LeadColumnProvider } from "./contextApi/ColumnContext";

// components
import Header from "./components/Header";
import Tabswitcher from "./components/Tabswitcher";

//constents
import { leadSource } from "./constants/leadSource";
import { columnData } from "./constants/columnData";
import {
  stages,
  brands,
  sources,
  departments,
} from "./constants/dropdownOptions";

// hooks
import useBulkLeadEdit from "./hooks/useBulkLeadEdit";

export default function Lead() {
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth.auth);

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

  const [clientName, setClientName] = useState(""); // for creating the new ticket
  const [companyName, setCompanyName] = useState("");

  const [showSendModal, setShowSendModal] = useState(false);
  const [access, setAccess] = useState([]);

  const [showJobHolder, setShowJobHolder] = useState(true);
  const [active1, setActive1] = useState("");

  const { selectedUsers, setSelectedUsers } = usePersistedUsers(
    "leads:selected_users",
    userName,
  );

  const [emailPopup, setEmailPopup] = useState({
    open: false,
    email: "",
    clientName: "",
  });

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
    e.stopPropagation();
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
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/tickets`,
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
    email: "",
  });
  const [active, setActive] = useState(false);
  const [selectFilter, setSelectFilter] = useState("");

  // BULK EDITING
  const [rowSelection, setRowSelection] = useState({});
  const [showEdit, setShowEdit] = useState(false);

  const fetchLeads = async ({
    showMainLoader = false,
    showInlineLoader = false,
  } = {}) => {
    if (showMainLoader) setIsLoading(true);
    if (showInlineLoader) setLoad(true);

    try {
      const status = ["progress", "won", "lost"].includes(selectedTab)
        ? selectedTab
        : "lost";

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/${status}/lead`,
      );

      if (data?.leads) {
        setLeadData(data.leads);
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (showMainLoader) setIsLoading(false);
      if (showInlineLoader) setLoad(false);
    }
  };

  const getAllLeads = () => fetchLeads({ showMainLoader: true });
  const getLeads = () => fetchLeads({ showInlineLoader: true });

  const { updates, isUpdating, handleOnChangeUpdate, updateBulkLeads } =
    useBulkLeadEdit({
      rowSelection,
      onSuccess: () => getAllLeads(),
    });

  // --------------Job_Holder Length---------->
  const getJobHolderCount = (user, status) => {
    console.log("L:LEADS DATA", leadData);
    if (user === "All") {
      return leadData.filter((lead) => lead?.status === status)?.length;
    }
    return leadData.filter(
      (lead) => lead?.jobHolder === user && lead?.status === status,
    )?.length;
  };

  const [ticketMap, setTicketMap] = useState({});

  useEffect(() => {
    const fetchTicketCounts = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/available-tickets?status=${selectedTab}`,
        );
        if (data) {
          setTicketMap(data.ticketMap || {});
        }
      } catch (err) {
        console.error("Error fetching ticket counts", err);
      }
    };

    fetchTicketCounts();
  }, [selectedTab]);

  const [showcolumn, setShowColumn] = useState(false);
  const boxRef = useRef(null);

  const [columnVisibility, setColumnVisibility] = useState(() => {
    const savedVisibility = JSON.parse(
      localStorage.getItem("columnVisibilityLead"),
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
    localStorage.setItem(
      "columnVisibilityLead",
      JSON.stringify(updatedVisibility),
    );
  };

  const user_leads_count_map = useMemo(() => {
    return Object.fromEntries(
      userName.map((user) => [user, getJobHolderCount(user, selectedTab)]),
    );
  }, [userName, selectedTab, getJobHolderCount]);

  console.log("filteredData:", filteredData);

  useEffect(() => {
    getAllLeads();
  }, [selectedTab]);

  // Filter Total Value
  useEffect(() => {
    const totalvalue = filteredData.reduce(
      (acc, item) => acc + Number(item.value || 0),
      0,
    );
    console.log("totalvalue:", totalvalue);
    setValueTotal(totalvalue);
  }, [filteredData]);

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
    console.log("savedSET>>>>", savedSet);
    // Preserve the order from savedOrder, but only if the username still exists in the fetched data
    const ordered = savedOrder.filter((name) =>
      fetchedUsernames.includes(name),
    );

    // Add any new usernames that aren't in the saved order
    const newOnes = fetchedUsernames.filter((name) => !savedSet.has(name));

    return [...ordered, ...newOnes];
  }

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`,
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access?.some((item) => item?.permission.includes("Leads")),
        ) || [],
      );

      const userNameArr = data?.users
        ?.filter((user) =>
          user.role?.access.some((item) => item?.permission.includes("Leads")),
        )
        .map((user) => user.name);

      setUserName(userNameArr);

      const savedOrder = JSON.parse(
        localStorage.getItem("leads_usernamesOrder"),
      );
      if (savedOrder) {
        const savedUserNames = mergeWithSavedOrder(userNameArr, savedOrder);

        setUserName(savedUserNames);
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
        { ...formData },
      );
      if (data) {
        setLeadData((prevData) =>
          prevData ? [...prevData, data.lead] : [data.lead],
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
          "success",
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
        { status: status },
      );
      if (data?.success) {
        const updateLead = data?.lead;

        setLeadData((prevData) =>
          prevData.filter((item) => item._id !== updateLead._id),
        );
        if (filteredData) {
          setFilteredData((prevData) =>
            prevData.filter((item) => item._id !== updateLead._id),
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
        `${process.env.REACT_APP_API_URL}/api/v1/leads/delete/lead/${id}`,
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
        { ...updateData },
      );
      if (data?.success) {
        const updatedLead = data?.lead;

        // ✅ Update leadData in-place instead of filtering it out
        setLeadData((prevData) =>
          prevData.map((item) =>
            item._id === updatedLead._id ? updatedLead : item,
          ),
        );

        // ✅ If you maintain filteredData, also update it
        if (filteredData) {
          setFilteredData((prevData) =>
            prevData.map((item) =>
              item._id === updatedLead._id ? updatedLead : item,
            ),
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
          jobDeadline: new Date().toISOString(),
        },
      );
      if (data) {
        setLeadData((prevData) =>
          prevData ? [...prevData, data.lead] : [data.lead],
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

        setClientName,
        setCompanyName,

        setEmailPopup,
        ticketMap,
      });

      return allColumns.filter((col) => columnVisibility[col.accessorKey]);
    },

    // eslint-disable-next-line
    [
      users,
      auth,
      leadData,
      departments,
      sources,
      brands,
      leadSource,
      selectedTab,
      stages,
      load,
      valueTotal,
      filteredData,
      showcolumn,
      columnVisibility,
    ],
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
    state: {
      rowSelection,
      isLoading: isLoading,
      showSkeletons: false,

      pagination,
    },
    enableBatchRowSelection: true,

    getRowId: (row) => row._id,
    enableStickyHeader: true,
    enableStickyFooter: true,
    muiTableContainerProps: { sx: { maxHeight: "850px", overflowX: "auto" } },
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
    const items = reorder(
      selectedUsers,
      result.source.index,
      result.destination.index,
    );
    localStorage.setItem("leads_usernamesOrder", JSON.stringify(items));
    setSelectedUsers(items);
  };

  const setColumnFromOutsideTable = (colKey, filterVal) => {
    const col = table.getColumn(colKey);
    return col.setFilterValue(filterVal);
  };

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

  const leadUserContextValue = useMemo(
    () => ({
      users,
      userName,
      selectedUsers,
      setSelectedUsers,
      user_leads_count_map,
    }),
    [users, userName, selectedUsers, setSelectedUsers, user_leads_count_map],
  );

  const leadColumnContextValue = useMemo(
    () => ({
      columnVisibility,
      toggleColumnVisibility,
    }),
    [columnVisibility],
  );

  return (
    <LeadUserProvider value={leadUserContextValue}>
      <LeadColumnProvider value={leadColumnContextValue}>
        <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
          {/* ===== Section: Header/Actions Toolbar ===== */}
          <Header
            auth={auth}
            handleClearFilters={handleClearFilters}
            setShowSendModal={setShowSendModal}
            handleCreateLead={handleCreateLead}
          />

          {/* ===== Section: Tab Switcher + Source Stats ===== */}
          <Tabswitcher
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            active={active}
            setActive={setActive}
            showUserLeadChart={showUserLeadChart}
            setShowUserLeadChart={setShowUserLeadChart}
            showEdit={showEdit}
            setShowEdit={setShowEdit}
            showcolumn={showcolumn}
            setShowColumn={setShowColumn}
            boxRef={boxRef}
            auth={auth}
            showJobHolder={showJobHolder}
            setShowJobHolder={setShowJobHolder}
            navigate={navigate}
            getAllLeads={getAllLeads}
            load={load}
            handleUserOnDragEnd={handleUserOnDragEnd}
            active1={active1}
            setActive1={setActive1}
            setColumnFromOutsideTable={setColumnFromOutsideTable}
            getJobHolderCount={getJobHolderCount}
            selectedUsers={selectedUsers}
            sources={sources}
            getSourceCount={getSourceCount}
            sourcePercentage={sourcePercentage}
            updates={updates}
            isUpdating={isUpdating}
            handleOnChangeUpdate={handleOnChangeUpdate}
            updateBulkLeads={updateBulkLeads}
            users={users}
            departments={departments}
            brands={brands}
            leadSource={leadSource}
            stages={stages}
          />

          {/* ---------Table Detail---------- */}
          <div className="w-full h-full">
            <div className="w-full min-h-[10vh] relative ">
              <div className="h-full hidden1 overflow-y-auto relative">
                {showUserLeadChart && (
                  <WonLeadsStats users={users} auth={auth} active1={active1} />
                )}
                {!showUserLeadChart && <MaterialReactTable table={table} />}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Section: Modal Mount Section ===== */}
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
              clientEmail={clientEmail}
              clientName={clientName}
              companyName={companyName}
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

        {emailPopup.open && (
          <EmailDetailDrawerNewWrapper
            {...emailPopup}
            setEmailPopup={setEmailPopup}
          />
        )}
      </LeadColumnProvider>
    </LeadUserProvider>
  );
}
