import React, { useEffect, useMemo, useState } from "react";
 
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import axios from "axios";
import { style } from "../../utlis/CommonStyle";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import Leads from "./Lead";
import QuickAccess from "../../utlis/QuickAccess";
import { isAdmin } from "../../utlis/isAdmin";
import OverviewForPages from "../../utlis/overview/OverviewForPages";
import { useSelector } from "react-redux";

export default function Workflow() {
  const [loading, setLoading] = useState(false);
  const [workFlowData, setWorkflowData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Clients");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [clients, setClients] = useState([]);




  const auth = useSelector( (state) => state.auth.auth );


  const departments = [
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ];

  // console.log("workFlowData:", workFlowData);
  // console.log("clients:", clients);

  // ---------------All Client_Job Data----------->
  const allClientJobData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/workflow/clients`
      );
      if (data) {
        setWorkflowData(data?.clients);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allClientJobData();
    // eslint-disable-next-line
  }, []);

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

  // Get Client Lead Wise Total
  useEffect(() => {
    const departmentTotals = departments.map((department) => {
      // Filter jobs by department
      const departmentJobs = workFlowData.filter(
        (job) => job.job.jobName === department
      );

      // Calculate total hours, fees, and job count for the department
      const totalHours = departmentJobs
        .reduce((sum, job) => sum + parseFloat(job.totalHours || 0), 0)
        .toFixed(0);
      const totalFee = departmentJobs.reduce(
        (sum, job) => sum + parseFloat(job.fee || 0),
        0
      );
      const totalDepartmentCount = departmentJobs.length;

      // Calculate lead-wise totals and job counts
      const leadWiseTotals = departmentJobs.reduce((acc, job) => {
        const lead = job.job.lead;
        if (!acc[lead]) {
          acc[lead] = { totalHours: 0, totalFee: 0, departmentCount: 0 };
        }
        acc[lead].totalHours += parseFloat(job.totalHours || 0);
        acc[lead].totalFee += parseFloat(job.fee || 0);
        acc[lead].departmentCount += 1;
        return acc;
      }, {});

      return {
        department,
        totalHours,
        totalFee,
        totalDepartmentCount,
        leadWiseTotals,
      };
    });

    setClients(departmentTotals);

    // eslint-disable-next-line
  }, [workFlowData]);

  // ---------------------Table Data----------------
  const columns = useMemo(
    () => [
      {
        accessorKey: "department",
        header: "Department",
        size: 170,
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
                Department
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {departments?.map((dep, i) => (
                  <option key={i} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell }) => (
          <span className="font-medium text-[16px] text-black px-2">
            {cell.getValue()}
          </span>
        ),
        filterFn: "equals",
        filterSelectOptions: departments?.map((dep) => dep),
        filterVariant: "select",
      },
      {
        accessorKey: "totalDepartmentCount",
        header: "Total Count",
        size: 100,
        Cell: ({ cell }) => <span className="px-2">{cell.getValue()}</span>,
      },
      {
        accessorKey: "totalHours",
        header: "Total Hours",
        size: 130,
        Cell: ({ cell }) => <span className="px-2">{cell.getValue()}</span>,
      },
      {
        accessorKey: "totalFee",
        header: "Total Fee",
        size: 130,
        Cell: ({ cell }) => <span className="px-2">${cell.getValue()}</span>,
      },

      {
        accessorKey: "leadWiseTotals",
        header: "Owner-wise Breakdown",
        size: 600,
        grow: true,
        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px] w-[36rem] xl:w-[39rem] 2xl:w-[44rem] 3xl:w-[47rem] 4xl:w-[55rem] px-2  ">
              <div className="w-full rounded-md flex items-center justify-between">
                {["Owner", "Hours", "Fee", "Dep Count"].map((label, index) => (
                  <span
                    key={label}
                    className={`ml-1 cursor-pointer ${
                      index === 1 ? "3xl:ml-[1rem]" : ""
                    }`}
                    title="Clear Filter"
                    onClick={() => column.setFilterValue("")}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          );
        },
        Cell: ({ cell }) => {
          const leadWiseData = cell.getValue();
          const leadColumns = [
            { accessorKey: "lead", header: "Owner", size: 100 },
            { accessorKey: "totalHours", header: "Hours", size: 80 },
            { accessorKey: "totalFee", header: "Fee", size: 80 },
            { accessorKey: "departmentCount", header: "Dep Count", size: 60 },
          ];

          // Apply filter based on selectedUser
          const filteredLeadData = Object.entries(leadWiseData)
            .map(([lead, totals]) => ({
              lead,
              totalHours: totals.totalHours.toFixed(0),
              totalFee: totals.totalFee,
              departmentCount: totals.departmentCount,
            }))
            .filter((data) =>
              selectedUser ? data.lead === selectedUser : true
            );

          return (
            <MaterialReactTable
              columns={leadColumns}
              data={filteredLeadData}
              enablePagination={false}
              enableSorting={false}
              enableColumnFilters={false}
              enableTopToolbar={false}
              enableBottomToolbar={false}
              enableTableHead={false}
              muiTableContainerProps={{
                sx: { maxHeight: "300px", border: "1px solid #ddd" },
              }}
              muiTableBodyCellProps={{
                sx: {
                  padding: "4px",
                  fontSize: "12px",
                  border: "1px solid rgba(203, 201, 201, 0.5)",
                },
              }}
              muiTableProps={{
                sx: { fontSize: "12px", tableLayout: "fixed" },
              }}
              muiTableHeadCellProps={{
                style: {
                  fontWeight: "600",
                  fontSize: "14px",
                  backgroundColor: "#DDE6ED",
                  color: "#000",
                  padding: ".7rem 0.3rem",
                  borderRadius: "0",
                },
              }}
            />
          );
        },
      },
    ],

    [departments, selectedUser]
  );

  const table = useMaterialReactTable({
    columns,
    data: clients || [],
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
        backgroundColor: "#E5E7EB",
        color: "#000",
        padding: ".4rem 0.3rem",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        border: "1px solid #999",
        padding: "0rem 0rem",
      },
    },
    muiTableProps: {
      sx: {
        "& .MuiTableHead-root": {
          backgroundColor: "#f0f0f0",
        },
        tableLayout: "auto",
        fontSize: "13px",
        // border: "1px solid #999",
        caption: {
          captionSide: "top",
        },
      },
    },
  });

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);

    table.setGlobalFilter("");
  };

  return (
    <>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Workflow
            </h1>

            <span
              className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
              onClick={() => {
                handleClearFilters();
                setSelectedUser("");
                setSelectedDepartment("");
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6 text-white" />
            </span>
            <span className="mt-2"><QuickAccess /></span>
              {isAdmin(auth) && <span className=" "> <OverviewForPages /> </span>}
          </div>
        </div>
        {/* ---------Buttons--------- */}
        <>
          <div className="flex items-center gap-5">
            <div className="flex items-center border-2 border-orange-500 rounded-sm overflow-hidden mt-5 transition-all duration-300 w-fit">
              <button
                className={`py-[.35rem] px-2 w-[6.5rem] outline-none transition-all duration-300 ${
                  selectedTab === "Clients"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("Clients")}
              >
                Clients
              </button>
              <button
                className={`py-[.35rem] px-2 w-[6.5rem] outline-none transition-all duration-300   ${
                  selectedTab === "Owners"
                    ? "bg-orange-500 text-white"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => setSelectedTab("Owners")}
              >
                Owners
              </button>
            </div>
            <div className="w-[9.5rem] mt-5">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className={`${style.input} w-full `}
                required
              >
                <option value="">Select Owner</option>
                {users?.map((user, i) => (
                  <option key={i} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
            {selectedTab === "Owners" && (
              <div className="w-[12rem] mt-5">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={`${style.input} w-full `}
                  required
                >
                  <option value="">Select Department</option>
                  {departments?.map((dep, i) => (
                    <option key={i} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
        </>
        {selectedTab === "Clients" ? (
          <div className="w-full h-full ">
            {loading ? (
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
        ) : (
          <div className="w-full h-full">
            <Leads
              selectedLead={selectedUser}
              selectedDepartment={selectedDepartment}
            />
          </div>
        )}
      </div>
    </>
  );
}
