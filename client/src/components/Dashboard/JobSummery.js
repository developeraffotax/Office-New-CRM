import axios from "axios";
import { format } from "date-fns";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const clientTypes = ["Limited", "LLP", "Individual", "Non UK"];
const departments = [
  "Bookkeeping",
  "Payroll",
  "Vat Return",
  "Personal Tax",
  "Accounts",
  "Company Sec",
  "Address",
];

const status = [
  "Data",
  "Progress",
  "Queries",
  "Approval",
  "Submission",
  "Billing",
  "Feedback",
];

export default function JobSummery({
  workFlowData,
  uniqueClients,
  userData,
  inactiveClient,
}) {
  const [activeClient, setActiveClient] = useState("");
  const [clientTypeLength, setClientTypeLength] = useState([]);
  const [departmentLength, setDepartmentLength] = useState([]);
  const [userLength, setUserLength] = useState([]);
  const [statusLength, setStatusLength] = useState([]);
  const [filterClient, setFilterClient] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    clientType: "",
    department: "",
    jobHolder: "",
    jobStatus: "",
  });
  const [totalHours, setTotalHours] = useState("0");
  const [totalFee, setTotalFee] = useState(0);

  console.log("workFlowData:", workFlowData);
  console.log("filterClient:", filterClient);

  //   Client Type Length
  useEffect(() => {
    const typeCounts = clientTypes.map((type) => {
      return {
        type,
        count: uniqueClients.filter((client) => client.clientType === type)
          .length,
      };
    });
    setClientTypeLength(typeCounts);
  }, [uniqueClients]);

  //   Department Length
  useEffect(() => {
    const departmentCounts = departments.map((department) => {
      return {
        department,
        count: workFlowData.filter((job) => job.job.jobName === department)
          .length,
      };
    });
    setDepartmentLength(departmentCounts);
  }, [workFlowData]);

  // User Length
  useEffect(() => {
    const calculateUserJobs = () => {
      // Calculate job count for each user
      const userJobs = userData.map((user) => {
        const jobCount = workFlowData.filter(
          (job) => job.job.jobHolder === user.name
        ).length;
        return {
          name: user.name,
          jobCount,
        };
      });

      // Filter out users with 0 jobs
      const filteredUsers = userJobs.filter((user) => user.jobCount > 0);

      // Update state
      setUserLength(filteredUsers);
    };

    calculateUserJobs();
  }, [workFlowData, userData]);

  // Total Hours
  // -----------Total Hours-------->
  useEffect(() => {
    if (filterClient.length > 0) {
      const calculateTotalHours = (data) => {
        return data?.reduce(
          (sum, client) => sum + Number(client.totalHours),
          0
        );
      };

      setTotalHours(
        calculateTotalHours(filterClient?.length > 0 && filterClient)?.toFixed(
          0
        )
      );
    }
  }, [filterClient]);

  //   Total Fee
  // ------------Total Fee-------->
  useEffect(() => {
    if (filterClient.length > 0) {
      const calculateTotalFee = (data) => {
        return data?.reduce((sum, client) => sum + Number(client.fee), 0);
      };

      setTotalFee(
        calculateTotalFee(filterClient.length > 0 && filterClient)?.toFixed(0)
      );
    }
  }, [filterClient]);

  //   Status Length
  useEffect(() => {
    const departmentCounts = status?.map((state) => {
      return {
        state,
        count: workFlowData.filter((job) => job.job.jobStatus === state).length,
      };
    });
    setStatusLength(departmentCounts);
  }, [workFlowData]);

  // Get Status (Due & OverDue)
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
      return "";
    }
  };

  // Filter Client Based on Active Client or Status
  useEffect(() => {
    const filtered = workFlowData.filter((job) => {
      const { clientType, department, jobHolder, jobStatus } = selectedFilters;

      return (
        (!clientType || job.clientType === clientType) &&
        (!department || job.job.jobName === department) &&
        (!jobHolder || job.job.jobHolder === jobHolder) &&
        (!jobStatus || job.job.jobStatus === jobStatus)
      );
    });

    setFilterClient(filtered);
  }, [selectedFilters, workFlowData]);

  // ------------------------------Table Data--------------------------------------->

  // -----------Handle Custom date filter--------->
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "companyName",
        minSize: 190,
        maxSize: 300,
        size: 210,
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
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const companyName = cell.getValue();

          return (
            <div
              className="cursor-pointer text-[#0078c8] hover:text-[#0053c8] w-full h-full"
              // onClick={() => {
              //   getSingleJobDetail(row.original._id);
              //   setCompanyName(companyName);
              // }}
            >
              {companyName}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.includes(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "clientName",
        header: "Client",
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
                Client
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
              />
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.includes(filterValue.toLowerCase());
        },
        size: 120,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },
      {
        accessorKey: "job.jobHolder",
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
                Assign
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {userLength?.map((jobhold, i) => (
                  <option key={i} value={jobhold.name}>
                    {jobhold.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = cell.getValue();

          return (
            <div className="w-full flex items-center justify-center">
              <span>{jobholder === "empty" ? "" : jobholder}</span>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: userLength?.map((jobhold) => jobhold.name),
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },
      {
        accessorKey: "job.jobName",
        header: "Departments",
        filterFn: "equals",
        Header: ({ column }) => {
          const deparments = [
            "Bookkeeping",
            "Payroll",
            "Vat Return",
            "Personal Tax",
            "Accounts",
            "Company Sec",
            "Address",
          ];
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Departments
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {deparments?.map((depart, i) => (
                  <option key={i} value={depart}>
                    {depart}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterSelectOptions: [
          "Bookkeeping",
          "Payroll",
          "Vat Return",
          "Personal Tax",
          "Accounts",
          "Company Sec",
          "Address",
        ],

        filterVariant: "select",
        size: 110,
        minSize: 100,
        maxSize: 140,
        grow: false,
      },
      {
        accessorKey: "totalHours",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px] w-full rounded-md items-center justify-center pr-2 ">
              <span
                className="ml-1 w-full text-center cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Hrs
              </span>
              <span className="font-medium w-[5rem] ml-2 text-center  px-1 py-1 rounded-md bg-gray-50 text-black">
                {totalHours}
              </span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const hours = cell.getValue();
          return (
            <div className="w-full flex items-center justify-center">
              <span className="text-[15px] font-medium">{hours}</span>
            </div>
          );
        },
        filterFn: "equals",
        size: 60,
      },
      // End  year
      {
        accessorKey: "job.yearEnd",
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
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Year End
              </span>
              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal w-full cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
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
                </select>
              )}
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          return (
            <div className="w-full ">
              <p>{format(new Date(date), "dd-MMM-yyyy")}</p>
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
          "Select",
          "Expired",
          "Today",
          "Tomorrow",
          "In 7 days",
          "In 15 days",
          "30 Days",
          "60 Days",
          // "Last 12 months",
          "Custom date",
        ],
        filterVariant: "custom",
        size: 115,
        minSize: 80,
        maxSize: 140,
        grow: false,
      },
      // Job DeadLine
      {
        accessorKey: "job.jobDeadline",
        header: "Deadline",
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
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Deadline
              </span>
              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal w-full   cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal w-full  cursor-pointer rounded-md border border-gray-200 outline-none"
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
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          return (
            <div className="w-full ">
              <p>{format(new Date(date), "dd-MMM-yyyy")}</p>
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
          // "Last 12 months",
          "Custom date",
        ],
        filterVariant: "custom",
        size: 115,
        minSize: 80,
        maxSize: 140,
        grow: false,
      },
      //  Current Date
      {
        accessorKey: "job.workDeadline",
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
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
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
                  className="h-[1.8rem] font-normal w-full    cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal w-full  cursor-pointer rounded-md border border-gray-200 outline-none"
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
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          return (
            <div className="w-full ">
              <p>{format(new Date(date), "dd-MMM-yyyy")}</p>
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
            case "Month Wise":
              return (
                cellDate.getFullYear() === today.getFullYear() &&
                cellDate.getMonth() === today.getMonth()
              );
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
          // "Last 12 months",
          "Custom Date",
        ],
        filterVariant: "select",
        size: 115,
        minSize: 80,
        maxSize: 140,
        grow: false,
      },
      //  -----Due & Over Due Status----->
      {
        accessorKey: "status",
        Header: ({ column }) => {
          const dateStatus = ["Overdue", "Due"];
          return (
            <div className=" flex flex-col gap-[2px]">
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
                className="font-normal ml-1 h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {dateStatus?.map((status, i) => (
                  <option key={i} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ row }) => {
          const status = getStatus(
            row.original.job.jobDeadline,
            row.original.job.yearEnd
          );

          return (
            <div className="w-full ">
              <span
                className={`text-white   rounded-[2rem] ${
                  status === "Due"
                    ? "bg-green-500  py-[6px] px-4 "
                    : status === "Overdue"
                    ? "bg-red-500  py-[6px] px-3 "
                    : "bg-transparent"
                }`}
              >
                {status}
              </span>
            </div>
          );
        },
        filterFn: (row, id, filterValue) => {
          const status = getStatus(
            row.original.job.jobDeadline,
            row.original.job.yearEnd
          );
          if (status === undefined || status === null) return false;
          return status.toString().toLowerCase() === filterValue.toLowerCase();
        },
        filterSelectOptions: ["Overdue", "Due"],
        filterVariant: "select",
        size: 95,
        minSize: 70,
        maxSize: 120,
        grow: false,
      },
      //
      {
        accessorKey: "jobStatus",
        accessorFn: (row) => row.job?.jobStatus || "",
        Header: ({ column }) => {
          const jobStatusOptions = [
            "Data",
            "Progress",
            "Queries",
            "Approval",
            "Submission",
            "Billing",
            "Feedback",
          ];

          return (
            <div className="flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => column.setFilterValue("")}
              >
                Job Status
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] ml-1 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {jobStatusOptions.map((status, i) => (
                  <option key={i} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const statusValue = cell.getValue();
          return (
            <select
              value={statusValue}
              className="w-[6rem] h-[2rem] rounded-md border border-sky-300 outline-none"
            >
              <option value="empty"></option>
              <option value="Data">Data</option>
              <option value="Progress">Progress</option>
              <option value="Queries">Queries</option>
              <option value="Approval">Approval</option>
              <option value="Submission">Submission</option>
              <option value="Billing">Billing</option>
              <option value="Feedback">Feedback</option>
              <option value="Inactive">Inactive</option>
            </select>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          return (cellValue || "").toString() === filterValue.toString();
        },
        filterSelectOptions: [
          "Data",
          "Progress",
          "Queries",
          "Approval",
          "Submission",
          "Billing",
          "Feedback",
          "Inactive",
        ],
        filterVariant: "select",
        size: 110,
        grow: false,
      },
      {
        accessorKey: "job.lead",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="  cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Owner
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {userLength?.map((lead, i) => (
                  <option key={i} value={lead.name}>
                    {lead?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const leadValue = cell.getValue();

          return (
            <div className="w-full">
              <select
                value={leadValue || ""}
                className="w-full h-[2rem] rounded-md border-none bg-transparent outline-none"
              >
                <option value="."></option>
                {userLength.map((lead, i) => (
                  <option value={lead.name} key={i}>
                    {lead?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: userLength.map((lead) => lead.name),
        filterVariant: "select",
        size: 100,
        minSize: 70,
        maxSize: 140,
        grow: false,
      },
      //
      {
        accessorKey: "totalTime",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]  ml w-[5rem]">
              <span className="w-full text-center ">Budget</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const currentVal = row.original.totalTime;
          // const statusValue = cell.getValue();
          const [show, setShow] = useState(false);
          const [totalTime, setTotalTime] = useState(currentVal);
          const [load, setLoad] = useState(false);

          const updateTimer = async (e) => {
            e.preventDefault();
            setLoad(true);
            try {
              const { data } = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/v1/client/update/timer/${row.original._id}`,
                { totalTime }
              );
              if (data) {
                setShow(false);
                setLoad(true);
                toast.success("Budget updated!");
              }
            } catch (error) {
              setLoad(false);
              console.log(error);
            }
          };

          return (
            <div className="flex items-center gap-1 w-full ">
              {!show ? (
                <div className="w-full flex items-center gap-1 justify-center cursor-pointer">
                  <span className="text-[1rem]">⏳</span>
                  <span>{totalTime}</span>
                </div>
              ) : (
                <div className="w-full">
                  <form onSubmit={updateTimer}>
                    <input
                      type="text"
                      disabled={load}
                      className="w-full h-[2rem] rounded-md border border-gray-500 px-1 outline-none "
                      value={totalTime}
                      onChange={(e) => setTotalTime(e.target.value)}
                    />
                  </form>
                </div>
              )}
            </div>
          );
        },
        size: 80,
      },
      // Label
      {
        accessorKey: "label",

        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Labels
              </span>
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const [show, setShow] = useState(false);
          const jobLabel = row.original.label || {};
          const { name, color } = jobLabel;

          return (
            <div className="w-full flex items-center justify-center">
              <div
                className="cursor-pointer h-full min-w-full "
                onDoubleClick={() => setShow(true)}
              >
                {name ? (
                  <span
                    className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                    style={{ background: `${color}` }}
                  >
                    {name}
                  </span>
                ) : (
                  <span
                    className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                    // style={{ background: `${color}` }}
                  >
                    .
                  </span>
                )}
              </div>
            </div>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const labelName = row.original?.label?.name || "";
          return labelName === filterValue;
        },

        filterVariant: "select",
        size: 120,
        minSize: 100,
        maxSize: 210,
        grow: false,
      },
      // Source
      {
        accessorKey: "fee",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px] w-full items-center justify-center  ">
              <span
                className="ml-1 w-full text-center cursor-pointer pr-6"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Fee
              </span>
              <span
                title={totalFee}
                className="font-medium w-full cursor-pointer text-center text-[12px] px-1 py-1 rounded-md bg-gray-50 text-black"
              >
                {totalFee}
              </span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const fee = row.original.fee;
          return (
            <div className="w-full flex items-center justify-center">
              <span className="text-[15px] font-medium">{fee && fee}</span>
            </div>
          );
        },
        filterFn: "equals",
        size: 60,
      },
      {
        accessorKey: "source",
        Header: ({ column }) => {
          const sources = ["FIV", "UPW", "PPH", "Website", "Direct", "Partner"];
          return (
            <div className=" flex flex-col gap-[2px] w-[5.5rem] items-center justify-center  ">
              <span
                className="ml-1 w-full text-center cursor-pointer pr-6"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Source
              </span>

              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal w-full max-w-[5rem] h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {sources?.map((sour, i) => (
                  <option key={i} value={sour}>
                    {sour}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const source = row.original.source;
          return (
            <div className="w-full flex items-start justify-start">
              <span className="text-[15px] font-medium">
                {source && source}
              </span>
            </div>
          );
        },
        filterFn: "equals",
        size: 90,
      },
      // Data Label
      {
        accessorKey: "data",

        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                CC Person
              </span>
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const [show, setShow] = useState(false);
          const jobLabel = row.original.data || {};
          const { name, color, _id } = jobLabel;

          return (
            <div className="w-full flex items-start ">
              <div
                className="cursor-pointer h-full min-w-full "
                onDoubleClick={() => setShow(true)}
              >
                {name ? (
                  <span
                    className={`label relative  rounded-md hover:shadow  cursor-pointer text-black ${
                      color === "#fff"
                        ? "text-gray-950 py-[4px] px-0"
                        : "text-white py-[4px] px-2"
                    }`}
                    style={{ background: `${color}` }}
                  >
                    {name}
                  </span>
                ) : (
                  <span
                    className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                    // style={{ background: `${color}` }}
                  >
                    .
                  </span>
                )}
              </div>
            </div>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const labelName = row.original?.data?.name || "";
          return labelName === filterValue;
        },

        filterVariant: "select",
        size: 110,
        minSize: 100,
        maxSize: 210,
        grow: false,
      },
      // ----Client Type showcolumn ---->
      {
        id: "AC",
        accessorKey: "activeClient",
        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                AC
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const active = row.original.activeClient || "";

          return (
            <div className="w-full flex items-start capitalize">
              {active ? active : ""}
            </div>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const labelName = row.original?.activeClient || "";
          return labelName === filterValue;
        },

        filterVariant: "select",
        size: 50,
        minSize: 70,
        maxSize: 120,
        grow: false,
      },
      //  Current Date
      {
        id: "SignUp_Date",
        accessorKey: "currentDate",
        Header: ({ column }) => {
          const [filterValue, setFilterValue] = useState("");
          const [customDate, setCustomDate] = useState(getCurrentMonthYear());

          useEffect(() => {
            if (filterValue === "Custom Date") {
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
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                SignUp Date
              </span>
              {filterValue === "Custom Date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal w-full cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
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
                </select>
              )}
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          return (
            <div className="w-full">
              <p>{format(new Date(date), "dd-MMM-yyyy")}</p>
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

          const today = new Date();

          switch (filterValue) {
            case "Today":
              return cellDate.toDateString() === today.toDateString();
            case "Tomorrow":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              return cellDate.toDateString() === tomorrow.toDateString();
            case "Last 7 days":
              const last7Days = new Date(today);
              last7Days.setDate(today.getDate() - 7);
              return cellDate >= last7Days && cellDate <= today;
            case "Last 15 days":
              const last15Days = new Date(today);
              last15Days.setDate(today.getDate() - 15);
              return cellDate >= last15Days && cellDate <= today;
            case "Last 30 Days":
              const last30Days = new Date(today);
              last30Days.setDate(today.getDate() - 30);
              return cellDate >= last30Days && cellDate <= today;
            case "Last 12 months":
              const lastYear = new Date(today);
              lastYear.setFullYear(today.getFullYear() - 1);
              return cellDate >= lastYear && cellDate <= today;
            // case "Custom Date":
            //   const [year, month] = filterValue.split("-");
            //   return (
            //     cellDate.getFullYear() === parseInt(year) &&
            //     cellDate.getMonth() === parseInt(month) - 1
            //   );
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Today",
          "Tomorrow",
          "Last 7 days",
          "Last 15 days",
          "Last 30 Days",
          "Last 12 months",
          "Custom Date",
        ],
        filterVariant: "select",
        size: 115,
        minSize: 80,
        maxSize: 140,
        grow: false,
      },
    ],
    // eslint-disable-next-line
    [filterClient]
  );

  const table = useMaterialReactTable({
    columns,
    data: filterClient,
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
        background: "rgb(193, 183, 173, 0.8)",
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

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {/* Unique Clients */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-black ">Clients</h2>
            <span className="text-xl font-semibold text-orange-500 hover:text-orange-600 cursor-pointer underline">
              {uniqueClients.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-700 ">
              Inactive Clients
            </h2>
            <span className="text-xl font-semibold text-orange-500 hover:text-orange-600 cursor-pointer underline">
              {inactiveClient}
            </span>
          </div>
        </div>
        {/* Client Type Length */}
        <div className="w-full flex flex-col gap-4 p-4 border border-gray-300 rounded-lg hover:shadow-lg shadow-gray-300 bg-gradient-to-r from-white to-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
            {clientTypeLength.map((client) => (
              <div
                key={client.type}
                className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-md cursor-pointer transition-all transform ${
                  client.type === activeClient
                    ? "bg-orange-100 border-orange-300 scale-105 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"
                }`}
                onClick={() => {
                  setActiveClient(client.type);
                  setSelectedFilters((prev) => ({
                    ...prev,
                    clientType: client.type,
                    department: "",
                    jobHolder: "",
                    jobStatus: "",
                  }));
                }}
              >
                <span
                  className={`text-xl font-bold ${
                    client.type === activeClient
                      ? "text-orange-600"
                      : "text-gray-700"
                  }`}
                >
                  {client.count}
                </span>
                <span className="text-sm text-gray-600">{client.type}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Client Department */}
        <div className="w-full flex flex-col gap-4 p-4 border border-gray-300 rounded-lg hover:shadow-lg shadow-gray-300 bg-gradient-to-r from-white to-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 px-4">
            {departmentLength.map((dep) => (
              <div
                key={dep.department}
                className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-md cursor-pointer transition-all transform ${
                  dep.department === activeClient
                    ? "bg-orange-100 border-orange-300 scale-105 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"
                }`}
                onClick={() => {
                  setActiveClient(dep.department);
                  setSelectedFilters((prev) => ({
                    ...prev,
                    department: dep.department,
                    jobHolder: "",
                    jobStatus: "",
                    clientType: "",
                  }));
                }}
              >
                <span
                  className={`text-xl font-bold ${
                    dep.department === activeClient
                      ? "text-orange-600"
                      : "text-gray-700"
                  }`}
                >
                  {dep.count}
                </span>
                <span className="text-sm text-gray-600">{dep.department}</span>
              </div>
            ))}
          </div>
        </div>
        {/* User length */}
        <div className="w-full flex flex-col gap-4 p-4 border border-gray-300 rounded-lg hover:shadow-lg shadow-gray-300 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center overflow-auto hidden1 gap-4 px-4">
            {userLength.map((user) => (
              <div
                key={user.name}
                className={`flex flex-col items-center justify-center min-w-[8rem] w-full   gap-2 p-4 border rounded-md cursor-pointer transition-all transform ${
                  user.name === activeClient
                    ? "bg-orange-100 border-orange-300 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"
                }`}
                onClick={() => {
                  setActiveClient(user.name);
                  setSelectedFilters((prev) => ({
                    ...prev,
                    jobHolder: user.name,
                    jobStatus: "",
                    clientType: "",
                    department: "",
                  }));
                }}
              >
                <span
                  className={`text-xl font-bold ${
                    user.name === activeClient
                      ? "text-orange-600"
                      : "text-gray-700"
                  }`}
                >
                  {user.jobCount}
                </span>
                <span className="text-sm text-gray-600">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Status length */}
        <div className="w-full flex flex-col gap-4 p-4 border border-gray-300 rounded-lg hover:shadow-lg shadow-gray-300 bg-gradient-to-r from-white to-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 px-4">
            {statusLength.map((s) => (
              <div
                key={s?.state}
                className={`flex flex-col items-center justify-center gap-2 p-4 border rounded-md cursor-pointer transition-all transform ${
                  s?.state === activeClient
                    ? "bg-orange-100 border-orange-300 scale-105 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"
                }`}
                onClick={() => {
                  setActiveClient(s?.state);
                  setSelectedFilters((prev) => ({
                    ...prev,
                    jobStatus: s?.state,
                    clientType: "",
                    department: "",
                    jobHolder: "",
                  }));
                }}
              >
                <span
                  className={`text-xl font-bold ${
                    s.state === activeClient
                      ? "text-orange-600"
                      : "text-gray-700"
                  }`}
                >
                  {s?.count}
                </span>
                <span className="text-sm text-gray-600">{s?.state}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {activeClient && (
        <div className="w-full min-h-[20vh] relative border-t border-gray-300">
          <div className="h-full hidden1 overflow-y-scroll relative">
            <MaterialReactTable table={table} />
          </div>
        </div>
      )}
    </div>
  );
}
