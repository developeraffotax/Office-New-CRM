import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import AddComplaint from "../../components/Complaint/AddComplaint";
import AddErrorType from "../../components/Complaint/AddErrorType";
import AddSolutions from "../../components/Complaint/AddSolutions";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import { CiEdit } from "react-icons/ci";
import { AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { GoEye } from "react-icons/go";
import ComplaintDetail from "../../components/Complaint/ComplaintDetail";
import { GrCopy } from "react-icons/gr";

export default function Complaints() {
  const [show, setShow] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [errorData, setErrorData] = useState([]);
  const [solutionData, setSolutionData] = useState([]);
  const [complaintId, setComplaintId] = useState("");
  const [users, setUsers] = useState([]);
  const [complaintData, setComplaintData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPoint, setTotalPoint] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [copyLoad, setCopyLoad] = useState(false);

  // Get All Complaints
  const getAllComplaints = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/complaints/fetch/complaint`
      );

      setComplaintData(data.complaints);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllComplaints();
  }, []);
  // --------Get Complaints----------->
  const getComplaints = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/complaints/fetch/complaint`
      );

      setComplaintData(data.complaints);
    } catch (error) {
      console.log(error);
    }
  };

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );

      setUsers(data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  // -----------Total Hours-------->
  useEffect(() => {
    const calculateTotalHours = (data) => {
      return data.reduce((sum, complaint) => sum + Number(complaint.points), 0);
    };

    setTotalPoint(calculateTotalHours(filteredData).toFixed(0));
  }, [filteredData]);

  //   Get All Labels
  const getlabel = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/complaint/labels/error`
      );
      if (data.success) {
        setErrorData(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getlabel();
  }, []);

  //   Get All Data Labels
  const getDatalable = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/complaint/labels/solutions`
      );
      if (data.success) {
        setSolutionData(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDatalable();
  }, []);

  //   Handle Delete Complaint's
  const handleDeleteComplaintConfirmation = (propId) => {
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
        handleDeleteComplaint(propId);
        Swal.fire("Deleted!", "Your complaint has been deleted.", "success");
      }
    });
  };

  const handleDeleteComplaint = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/complaints/delete/complaint/${id}`
      );
      if (data) {
        getComplaints();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // -----------Copy Complaint-------->
  const handleCopyComplaint = async (id) => {
    setCopyLoad(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/complaints/copy/${id}`
      );
      if (data) {
        getComplaints();
        toast.success("Complaint copied successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setCopyLoad(false);
    }
  };

  //-----------Table Data------------->.
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "company",
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
            <div className="cursor-pointer text-[#000]  w-full h-full">
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
        accessorKey: "client",
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
        size: 150,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },
      {
        accessorKey: "department",
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
        Cell: ({ cell, row }) => {
          const department = cell.getValue();

          return (
            <div className="w-full flex items-center justify-start">
              <span>{department}</span>
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
        accessorKey: "assign",
        Header: ({ column }) => {
          console.log("users", users);
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
                {users?.map((user, i) => (
                  <option key={user._id} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = cell.getValue();

          return (
            <div className="w-full flex items-center justify-start">
              <span>{jobholder.name}</span>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const user = row.original?.assign?.name || "";
          return user === filterValue;
        },
        filterSelectOptions: users.map((jobhold) => jobhold.name),
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 150,
        grow: false,
      },
      //   Created At
      {
        accessorKey: "createdAt",
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
                Created Date
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

          console.log("createdAt", createdAt);
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

          // Handle "Custom date" filter (if it includes a specific month-year)
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
            case "Tomorrow":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
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
          "Expired",
          "Today",
          "Tomorrow",
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
        accessorKey: "errorType",

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
                Error Type
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {errorData?.map((label, i) => (
                  <option key={i} value={label?.name}>
                    {label?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const [show, setShow] = useState(false);
          const jobLabel = row.original.errorType || {};
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
                  >
                    .
                  </span>
                )}
              </div>
            </div>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const labelName = row.original?.errorType?.name || "";
          return labelName === filterValue;
        },

        filterVariant: "select",
        filterSelectOptions: errorData.map((label) => label.name),
        size: 200,
        minSize: 100,
        maxSize: 210,
        grow: false,
      },
      {
        accessorKey: "note",
        minSize: 200,
        maxSize: 600,
        size: 600,
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
                Note
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[380px] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const note = row.original.note;

          return (
            <div className="w-full px-1">
              <div
                onClick={() => {
                  setComplaintId(row.original._id);
                  setShowDetail(true);
                }}
                className="cursor-pointer w-full select-none text-blue-500 font-medium"
              >
                {note ? (
                  note.slice(0, 80) + "..."
                ) : (
                  <div className="text-white w-full h-full">.</div>
                )}
              </div>
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
        accessorKey: "points",
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
                Points
              </span>
              <span
                title={totalPoint}
                className="font-medium w-full cursor-pointer text-center text-[12px] px-1 py-1 rounded-md bg-gray-50 text-black"
              >
                {totalPoint}
              </span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const points = row.original.points;
          return (
            <div className="w-full flex items-center justify-center">
              <span className="text-[15px] font-medium">
                {points ? points : 0}
              </span>
            </div>
          );
        },
        filterFn: "equals",
        size: 60,
      },
      {
        accessorKey: "solution",
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
                Solutions
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {solutionData?.map((label, i) => (
                  <option key={i} value={label?.name}>
                    {label?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const [show, setShow] = useState(false);
          const jobLabel = row.original.solution || {};
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
                  >
                    .
                  </span>
                )}
              </div>
            </div>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const labelName = row.original?.solution?.name || "";
          return labelName === filterValue;
        },

        filterVariant: "select",
        filterSelectOptions: solutionData.map((label) => label.name),
        size: 200,
        minSize: 100,
        maxSize: 210,
        grow: false,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          return (
            <div className="flex items-center justify-center gap-2 w-full h-full">
              <span
                className=""
                title="See Detail"
                onClick={() => {
                  setComplaintId(row.original._id);
                  setShowDetail(true);
                }}
              >
                <GoEye className="h-6 w-6 cursor-pointer text-sky-500 hover:text-sky-600" />
              </span>
              <span
                className=""
                title="Copy Complaint"
                onClick={() => {
                  handleCopyComplaint(row.original._id);
                }}
              >
                <GrCopy className="h-6 w-6 cursor-pointer text-lime-500 hover:text-lime-600" />
              </span>
              <span
                className=""
                title="Edit Complaint"
                onClick={() => {
                  setComplaintId(row.original._id);
                  setShow(true);
                }}
              >
                <CiEdit className="h-7 w-7 cursor-pointer text-green-500 hover:text-green-600" />
              </span>
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() =>
                  handleDeleteComplaintConfirmation(row.original._id)
                }
                title="Delete Lead!"
              >
                <AiTwotoneDelete className="h-6 w-6 text-pink-500 hover:text-pink-600 " />
              </span>
            </div>
          );
        },
        size: 130,
      },
    ],
    // eslint-disable-next-line
    [totalPoint, complaintData, users, errorData, solutionData]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
  };

  const table = useMaterialReactTable({
    columns,
    data: complaintData,
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
      pagination: { pageSize: 30 },
      pageSize: 20,
      density: "compact",
    },

    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        backgroundColor: "rgb(193, 183, 173, 0.8)",
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

  return (
    <Layout>
      <div className=" relative w-full h-[100%] overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-start sm:items-center sm:justify-between flex-col sm:flex-row gap-4 ">
          <div className="flex items-center gap-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Complaint's
            </h1>

            <span
              className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
              onClick={() => {
                handleClearFilters();
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6 text-white" />
            </span>
          </div>

          {/* ---------Template Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[13px] sm:text-[15px] `}
              onClick={() => setShowError(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Error Type
            </button>
            <button
              className={`${style.button1} text-[13px] sm:text-[15px] `}
              onClick={() => setShowSolution(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Solution
            </button>
            <button
              className={`${style.button1} text-[13px] sm:text-[15px] `}
              onClick={() => setShow(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New Complaint
            </button>
          </div>
        </div>
        <hr className="w-full h-[1px] bg-gray-300 my-4" />
        {/* Load */}
        {copyLoad && (
          <div className="pb-5">
            <div class="loader"></div>
          </div>
        )}
        {/*  */}

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

        {/* -----------Handle Complaint------ */}
        {show && (
          <div className="fixed top-0 left-0 w-full h-full z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
            <AddComplaint
              setShow={setShow}
              users={users}
              setComplaintId={setComplaintId}
              complaintId={complaintId}
              getComplaints={getComplaints}
              errorData={errorData}
              solutionData={solutionData}
            />
          </div>
        )}
        {/* ----------------Detail---------- */}
        {showDetail && (
          <div className="fixed top-0 left-0 w-full h-full z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
            <ComplaintDetail
              setShowDetail={setShowDetail}
              setComplaintId={setComplaintId}
              complaintId={complaintId}
            />
          </div>
        )}

        {/* ---------------Add Error------------- */}
        {showError && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
            <AddErrorType
              setShowlabel={setShowError}
              type={"error"}
              getLabels={getlabel}
            />
          </div>
        )}

        {/* ---------------Add Solution label------------- */}
        {showSolution && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
            <AddSolutions
              setShowDataLable={setShowSolution}
              getDatalable={getDatalable}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
