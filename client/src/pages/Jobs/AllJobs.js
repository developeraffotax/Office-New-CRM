import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { GoPlus } from "react-icons/go";
import { style } from "../../utlis/CommonStyle";
import NewJobModal from "../../components/Modals/NewJobModal";
import { CgClose } from "react-icons/cg";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoIosArrowDropup } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import { LuPlusCircle } from "react-icons/lu";
import axios from "axios";
import { clientJobs } from "../../utlis/DummyData";

export default function AllJobs() {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(false);
  const [jobHolders, setJobHolders] = useState([]);

  console.log(jobHolders);

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

  // Get All Users
  const getAllUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setJobHolders(data?.users.map((user) => user.name));
      console.log("users", data?.users);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();

    // eslint-disable-next-line
  }, []);

  const columns = [
    {
      headerName: "Sr",
      filter: false,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      editable: false,
      valueGetter: (params) => params.node.rowIndex + 1,
    },
    {
      headerName: "Company Name",
      field: "companyName",
      editable: false,
      filter: true,
    },
    {
      headerName: "Client Name",
      field: "clientName",
      filter: true,
    },
    {
      headerName: "Job Holder",
      field: "job.jobHolder",
      filter: "agSetColumnFilter",
      filterParams: {
        values: jobHolders,
        suppressMiniFilter: true,
        suppressSelectAll: true,
      },
      floatingFilterComponent: "agSetColumnFloatingFilter",
      floatingFilterComponentParams: {
        values: jobHolders,
        suppressFilterButton: true,
        suppressInput: true,
      },
    },
    {
      headerName: "Departments",
      field: "job.jobName",
      filter: true,
    },
    {
      headerName: "Hours",
      field: "totalHours",
      filter: true,
    },
    {
      headerName: "Year End",
      field: "job.yearEnd",
      filter: true,
    },
    {
      headerName: "Deadline",
      field: "job.jobDeadline",
      filter: true,
    },
    {
      headerName: "Job Date",
      field: "currentDate",
      filter: true,
    },
    {
      headerName: "Status",
      field: "job.jobStatus",
      filter: true,
    },
    {
      headerName: "Note",
      field: "job.note",
      filter: true,
    },
    {
      headerName: "Job Status",
      field: "job.jobStatus",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: [
          "Select",
          "Data",
          "Progress",
          "Queries",
          "Approval",
          "Submission",
          "Billing",
          "Feedback",
        ],
      },
      floatingFilterComponent: "selectFloatingFilter",
      floatingFilterComponentParams: {
        options: [
          "Data",
          "Progress",
          "Queries",
          "Approval",
          "Submission",
          "Billing",
          "Feedback",
        ],
        suppressFilterButton: true,
        suppressInput: true,
      },
    },
    {
      headerName: "Lead",
      field: "job.lead",
      filter: true,
    },
    {
      headerName: "Timer",
      field: "job.timer",
      filter: true,
    },
    {
      headerName: "Chat",
      field: "job.chat",
      filter: true,
    },
  ];

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      floatingFilter: true,
      editable: true,
      resizable: true,
    }),
    []
  );

  const cellClickedListener = useCallback((event) => {}, []);

  return (
    <Layout>
      <div className="w-full min-h-screen py-4 px-2 sm:px-4 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-semibold ">Job</h1>
            <span className="" onClick={() => setShow(!show)}>
              {show ? (
                <IoIosArrowDropup className="h-5 w-5 cursor-pointer" />
              ) : (
                <IoIosArrowDropdown className="h-5 w-5 cursor-pointer" />
              )}
            </span>
          </div>
          <button
            className={`${style.button1}`}
            onClick={() => setIsOpen(true)}
          >
            <GoPlus className="h-5 w-5 text-white " /> Add Tasks
          </button>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-4">
          {departments?.map((dep, i) => (
            <div
              className={`py-1 cursor-pointer font-[500] text-[14px] ${
                active === dep && "border-b-2  border-orange-600"
              }`}
              key={i}
              onClick={() => setActive(dep)}
            >
              {dep}
            </div>
          ))}
          <span className="">
            <LuPlusCircle className="h-5 w-5 text-gray-950 hover:text-orange-600 cursor-pointer" />
          </span>
        </div>
        {/*  */}
        <hr className="my-5 bg-gray-300 w-full h-[1px]" />
        {/* ---------------------Table---------------- */}
        <div className="w-full min-h-screen">
          <div
            className="ag-theme-alpine"
            style={{ height: 600, width: "100%" }}
          >
            <AgGridReact
              rowData={clientJobs}
              columnDefs={columns}
              editType={"fullRow"}
              rowSelection="multiple"
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              paginationPageSize={25}
              onCellClicked={cellClickedListener}
              suppressDragLeaveHidesColumns={true}
            />
          </div>
        </div>
      </div>
      {/* Add Modal */}
      {isOpen && (
        <div className="fixed top-6 left-0 w-full h-screen z-[999] bg-gray-100 flex items-center justify-center py-6 px-4">
          <span
            className="absolute top-[2px] right-[.5rem] cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-gray-300/70 transition-all duration-150 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <CgClose className="h-5 w-5 text-black" />
          </span>
          <NewJobModal setIsOpen={setIsOpen} />
        </div>
      )}
    </Layout>
  );
}
