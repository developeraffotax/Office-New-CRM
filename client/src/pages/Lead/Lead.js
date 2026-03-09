import React, { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import SendEmailModal from "../../components/Tickets/SendEmailModal";

import NewTicketModal from "../../utlis/NewTicketModal";
import { ActionsCell } from "./ActionsCell";
import DateRangePopover from "../../utlis/DateRangePopover";
import {
  NumberFilterPortal,
  NumberFilterFn,
} from "../../utlis/NumberFilterPortal";
import { useSelector } from "react-redux";
import { getLeadColumns } from "./table/columns";
import WonLeadsStats from "./userLeadChart/UserLeadChart";
import EmailDetailDrawerNewWrapper from "../../components/shared/EmailDetailDrawerNewWrapper";
import { LeadProvider } from "./contextApi/LeadContext";

// components
import Header from "./components/Header";
import Tabswitcher from "./components/Tabswitcher";

//constents
import { columnData } from "./constants/columnData";
import {
  LEAD_STAGES,
  BRANDS,
  SOURCES,
  LEAD_SOURCES,
  DEPARTMENTS,
} from "./constants/dropdownOptions";
import { Lead_Status } from "./constants/leadStatus";
import { STORAGE_KEYS } from "./constants/storageKeys";

// hooks
import useBulkLeadEdit from "./hooks/useBulkLeadEdit";
import useLeadData from "./hooks/useLeadData";
import useLeadModals from "./hooks/useLeadModals";
import useLeadUsers from "./hooks/useLeadUsers";
import useLeadFilters from "./hooks/useLeadFilters";

export default function Lead() {
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth.auth);

  const [selectedTab, setSelectedTab] = useState(Lead_Status.PROGRESS);

  const [showUserLeadChart, setShowUserLeadChart] = useState(false);

  const [showJobHolder, setShowJobHolder] = useState(true);
  const [active1, setActive1] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 30, // ✅ default page size
  });

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

  // BULK EDITING
  const [rowSelection, setRowSelection] = useState({});
  const [showEdit, setShowEdit] = useState(false);

  const {
    leadData,
    setLeadData,
    isLoading,
    load,
    valueTotal,
    setValueTotal,
    users,
    getAllLeads,
    getLeads,
    getAllUsers,
    handleCreateLead,
    handleUpdateData,
    handleLeadStatus,
    handleDeleteLeadConfirmation,
    handleCopyLead,
  } = useLeadData(selectedTab);

  const {
    showNewTicketModal,
    setShowNewTicketModal,
    clientCompanyName,
    setClientCompanyName,
    clientEmail,
    setClientEmail,
    clientName,
    setClientName,
    companyName,
    setCompanyName,
    showSendModal,
    setShowSendModal,
    access,
    emailPopup,
    setEmailPopup,
    getEmails,
  } = useLeadModals(auth);

  const {
    userName,
    selectedUsers,
    setSelectedUsers,
    ticketMap,
    getJobHolderCount,
    user_leads_count_map,
    handleUserOnDragEnd,
  } = useLeadUsers({ users, leadData, selectedTab });

  const {
    selectFilter,
    setSelectFilter,
    active,
    setActive,
    anchorRef,
    filterInfo,
    setFilterInfo,
    handleFilterClick,
    handleCloseFilter,
  } = useLeadFilters();

  const { updates, isUpdating, handleOnChangeUpdate, updateBulkLeads } =
    useBulkLeadEdit({
      rowSelection,
      onSuccess: () => getAllLeads(),
    });

  const [showcolumn, setShowColumn] = useState(false);
  const boxRef = useRef(null);

  const [columnVisibility, setColumnVisibility] = useState(() => {
    const savedVisibility = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.COLUMN_VISIBILITY),
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
      STORAGE_KEYS.COLUMN_VISIBILITY,
      JSON.stringify(updatedVisibility),
    );
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  //   ------------------------Table Data----------->
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  const columns = useMemo(
    () => {
      const allColumns = getLeadColumns({
        setSelectFilter,
        setFormData,
        handleUpdateData,
        users,
        departments: DEPARTMENTS,
        sources: SOURCES,
        brands: BRANDS,
        leadSource: LEAD_SOURCES,
        auth,

        anchorRef,
        handleFilterClick,

        NumberFilterFn,

        DateRangePopover,
        valueTotal,
        ActionsCell,
        setClientCompanyName,
        setClientEmail,
        setShowNewTicketModal,
        handleCopyLead,
        handleLeadStatus,
        handleDeleteLeadConfirmation,
        stages: LEAD_STAGES,

        setClientName,
        setCompanyName,

        setEmailPopup,
      });

      return allColumns.filter((col) => columnVisibility[col.accessorKey]);
    },

    // eslint-disable-next-line
    [
      users,
      auth,
      leadData,
      DEPARTMENTS,
      SOURCES,
      BRANDS,
      LEAD_SOURCES,
      selectedTab,
      LEAD_STAGES,
      load,
      valueTotal,
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

  const filteredData = useMemo(
    () => table.getFilteredRowModel().rows.map((row) => row.original),
    // eslint-disable-next-line
    [table.getFilteredRowModel().rows],
  );

  // Filter Total Value
  useEffect(() => {
    const totalvalue = filteredData.reduce(
      (acc, item) => acc + Number(item.value || 0),
      0,
    );
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

  const applyFilter = (e) => {
    e.stopPropagation();
    const { col, value, type } = filterInfo;
    if (col && value) {
      table.getColumn(col)?.setFilterValue({ type, value: parseFloat(value) });
    }
    handleCloseFilter();
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

  const leadContextValue = useMemo(
    () => ({
      users,
      selectedUsers,
      setSelectedUsers,
      user_leads_count_map,
      columnVisibility,
      toggleColumnVisibility,
      selectedTab,
      ticketMap,
    }),
    [
      users,
      selectedUsers,
      setSelectedUsers,
      user_leads_count_map,
      columnVisibility,
      selectedTab,
      ticketMap,
    ],
  );

  return (
    <LeadProvider value={leadContextValue}>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
        {/* ===== Section: Header/Actions Toolbar ===== */}
        <Header
          auth={auth}
          handleClearFilters={handleClearFilters}
          setShowSendModal={setShowSendModal}
          handleCreateLead={() => handleCreateLead(formData)}
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
          getSourceCount={getSourceCount}
          sourcePercentage={sourcePercentage}
          updates={updates}
          isUpdating={isUpdating}
          handleOnChangeUpdate={handleOnChangeUpdate}
          updateBulkLeads={updateBulkLeads}
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
    </LeadProvider>
  );
}
