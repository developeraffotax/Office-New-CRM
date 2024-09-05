import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { style } from "../../utlis/CommonStyle";
import { IoClose } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";
import { Box, Button } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { differenceInSeconds, format } from "date-fns";
import { AiTwotoneDelete } from "react-icons/ai";
import { AiOutlineEdit } from "react-icons/ai";
import Loader from "../../utlis/Loader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import AddTimerModal from "./AddTimerModal";

// CSV Configuration
const csvConfig = mkConfig({
  filename: "full_table_data",
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  showTitle: true,
  title: "Exported Timer Table Data",
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
});

export default function TimeSheet() {
  const { auth } = useAuth();
  const [timerData, setTimerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [timerId, setTimerId] = useState("");
  const [tableFilterData, setTableFilterDate] = useState([]);
  const [times, setTimes] = useState({
    monTotal: 0,
    tueTotal: 0,
    wedTotal: 0,
    thuTotal: 0,
    friTotal: 0,
    satTotal: 0,
    sunTotal: 0,
    weekTotal: 0,
  });

  // const [selectedUser, setSelectedUser] = useState("");
  // const [selectedCompany, setSelectedComapany] = useState("");
  // const [selectedDepartment, setSelectedDepartment] = useState("");
  // const [selectedDay, setSelectedDay] = useState("");
  // const [active, setActive] = useState("All");
  // const [filterData, setFilterData] = useState([]);
  console.log("timerData:", timerData);

  //   Get All Timer Data
  const getAllTimeSheetData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/get/all/timers`
      );

      setTimerData(data.timers);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTimeSheetData();

    // eslint-disable-next-line
  }, []);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users.map((user) => ({ name: user?.name, id: user?._id }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  // -------------- Filter Data By Department || Jobholder || Date ----------->
  // const filterByDep = (value) => {
  //   setFilterData("");

  //   if (value !== "All") {
  //     const filteredData = timerData?.filter(
  //       (item) =>
  //         item?.JobHolderName === value ||
  //         item.department === value ||
  //         item.company === value
  //     );

  //     // console.log("FilterData", filteredData);

  //     setFilterData([...filteredData]);
  //   }
  // };

  // -----------Download in CSV------>
  const flattenData = (data) => {
    return data.map((row) => ({
      date: row.date || "",
      JobHolderName: row.JobHolderName || "",
      companyName: row.companyName || "",
      clientName: row.clientName || "",
      projectName: row.projectName || "",
      department: row.department || "",
      startTime: row.startTime || "",
      endTime: row.endTime || "",
      type: row.type || "",
      note: row.note || "",
      task: row.task || "",
    }));
  };

  const handleExportData = () => {
    const csvData = flattenData(timerData);
    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
  };

  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  // ------------------Delete Timer------------->

  const handleDeleteTaskConfirmation = (taskId) => {
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
        handleDeleteTimer(taskId);
        Swal.fire("Deleted!", "Your timer has been deleted.", "success");
      }
    });
  };

  const handleDeleteTimer = async (id) => {
    const filteredData = timerData?.filter((item) => item._id !== id);
    setTimerData(filteredData);

    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/delete/timer/${id}`
      );
      if (data) {
        toast.success("Timer deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // -----------Update Alocate Task-------->
  const updateAlocateTask = async (taskId, note) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/update/timer/${taskId}`,
        { note }
      );
      if (data?.success) {
        const updateTimer = data?.timer;
        toast.success("Task updated successfully!");
        setTimerData((prevData) =>
          prevData?.map((item) =>
            item._id === updateTimer._id ? updateTimer : item
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // --------------Table Data--------->
  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
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
                className="cursor-pointer"
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
                  className="h-[1.8rem] font-normal cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal cursor-pointer rounded-md border border-gray-200 outline-none"
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
          const date = row.original.date;

          return (
            <div className="w-full flex">
              <p>{format(new Date(date), "dd-MMM-yyyy")}</p>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          console.log("Filter Data:=>", row, columnId, filterValue);
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
            case "Yesterday":
              const yesterday = new Date(today);
              yesterday.setDate(today.getDate() - 1);
              return cellDate.toDateString() === yesterday.toDateString();
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
            case "Last 60 Days":
              const last60Days = new Date(today);
              last60Days.setDate(today.getDate() - 60);
              return cellDate >= last60Days && cellDate <= today;
            case "Custom date":
              if (!filterValue.includes("-")) return false;
              const [year, month] = filterValue.split("-");
              const cellYear = cellDate.getFullYear().toString();
              const cellMonth = (cellDate.getMonth() + 1)
                .toString()
                .padStart(2, "0");

              return year === cellYear && month === cellMonth;
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
        accessorKey: "jobHolderName",
        header: "Job Holder",
        Header: ({ column }) => {
          const user = auth?.user?.name;

          useEffect(() => {
            column.setFilterValue(user);

            // eslint-disable-next-line
          }, [user]);
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
              {auth?.user?.role === "Admin" && (
                <select
                  value={column.getFilterValue()}
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
              )}
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = cell.getValue() || "";

          return (
            <div className="w-full flex ">
              <div className="">
                <span className="text-center">{jobholder}</span>
              </div>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          return (cellValue || "").toString() === filterValue.toString();
        },
        filterSelectOptions: users.map((jobhold) => jobhold?.name || ""),
        filterVariant: "select",
        size: 90,
        minSize: 80,
        maxSize: 130,
        grow: false,
      },
      {
        accessorKey: "companyName",
        minSize: 120,
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
                }}
              >
                Company
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const clientName = cell.getValue();

          return (
            <div className="w-full flex cursor-pointer" title={clientName}>
              <span>{clientName}</span>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.startsWith(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "clientName",
        header: "Client",
        minSize: 120,
        maxSize: 200,
        size: 130,
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
                Client
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const clientName = cell.getValue();

          return (
            <div className="w-full flex cursor-pointer " title={clientName}>
              <span>{clientName}</span>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.startsWith(filterValue.toLowerCase());
        },
      },
      // {
      //   accessorKey: "projectName",
      //   header: "Project",
      //   minSize: 120,
      //   maxSize: 200,
      //   size: 150,
      //   grow: false,
      //   Header: ({ column }) => {
      //     return (
      //       <div className=" flex flex-col gap-[2px]">
      //         <span
      //           className="ml-1 cursor-pointer"
      //           title="Clear Filter"
      //           onClick={() => {
      //             column.setFilterValue("");
      //           }}
      //         >
      //           Project
      //         </span>
      //         <input
      //           type="search"
      //           value={column.getFilterValue() || ""}
      //           onChange={(e) => column.setFilterValue(e.target.value)}
      //           className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
      //         />
      //       </div>
      //     );
      //   },
      //   Cell: ({ cell, row }) => {
      //     const projectName = cell.getValue();

      //     return (
      //       <div className="w-full flex " title={projectName}>
      //         <span>{projectName}</span>
      //       </div>
      //     );
      //   },
      //   filterFn: (row, columnId, filterValue) => {
      //     const cellValue =
      //       row.original[columnId]?.toString().toLowerCase() || "";

      //     return cellValue.startsWith(filterValue.toLowerCase());
      //   },
      // },
      {
        accessorKey: "department",
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
        size: 100,
        minSize: 90,
        maxSize: 140,
        grow: false,
      },
      {
        accessorKey: "time",
        header: "Time",
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
                Time
              </span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const startTime = row.original.startTime;
          const endTime = row.original.endTime;
          return (
            <div className="w-full flex ">
              <span>
                {format(new Date(startTime), "hh:mm:ss a")} -{" "}
                {format(new Date(endTime), "hh:mm:ss a")}
              </span>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";
          return cellValue.startsWith(filterValue.toLowerCase());
        },

        size: 190,
        minSize: 100,
        maxSize: 220,
        grow: false,
      },
      // Days

      {
        accessorKey: "monday",
        header: "Mon",
        Cell: ({ row }) => {
          const createdDate = new Date(row.original.date);
          const startTime = row.original.startTime;
          const endTime = row.original.endTime;

          const dayOfWeek = createdDate.getDay();

          if (dayOfWeek === 1 && startTime) {
            return renderTime(startTime, endTime);
          }

          return null;
        },
        size: 50,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "tuesday",
        header: "Tue",
        Cell: ({ row }) => {
          const createdDate = new Date(row.original.date);
          const startTime = row.original.startTime;
          const endTime = row.original.endTime;

          const dayOfWeek = createdDate.getDay();

          if (dayOfWeek === 2 && startTime) {
            return renderTime(startTime, endTime);
          }

          return null;
        },
        size: 50,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "wednesday",
        header: "Wed",
        Cell: ({ row }) => {
          const createdDate = new Date(row.original.date);
          const startTime = row.original.startTime;
          const endTime = row.original.endTime;

          const dayOfWeek = createdDate.getDay();

          if (dayOfWeek === 3 && startTime) {
            return renderTime(startTime, endTime);
          }

          return null;
        },
        size: 50,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "thursday",
        header: "Thu",
        Cell: ({ row }) => {
          const createdDate = new Date(row.original.date);
          const startTime = row.original.startTime;
          const endTime = row.original.endTime;

          const dayOfWeek = createdDate.getDay();

          if (dayOfWeek === 4 && startTime) {
            return renderTime(startTime, endTime);
          }

          return null;
        },
        size: 50,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "friday",
        header: "Fri",
        Cell: ({ row }) => {
          const createdDate = new Date(row.original.date);
          const startTime = row.original.startTime;
          const endTime = row.original.endTime;

          const dayOfWeek = createdDate.getDay();

          if (dayOfWeek === 5 && startTime) {
            return renderTime(startTime, endTime);
          }

          return null;
        },
        size: 50,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "saturday",
        header: "Sat",
        Cell: ({ row }) => {
          const createdDate = new Date(row.original.date);
          const startTime = row.original.startTime;
          const endTime = row.original.endTime;

          const dayOfWeek = createdDate.getDay();

          if (dayOfWeek === 6 && startTime) {
            return renderTime(startTime, endTime);
          }

          return null;
        },
        size: 50,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      {
        accessorKey: "sunday",
        header: "Sun",
        Cell: ({ row }) => {
          const createdDate = new Date(row.original.date);
          const startTime = row.original.startTime;
          const endTime = row.original.endTime;

          const dayOfWeek = createdDate.getDay();

          if (dayOfWeek === 0 && startTime) {
            return renderTime(startTime, endTime);
          }

          return null;
        },
        size: 50,
        minSize: 40,
        maxSize: 100,
        grow: false,
      },
      // Task
      {
        accessorKey: "task",
        header: "Tasks",
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
                Tasks
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const task = row.original.task;
          const [allocateTask, setAllocateTask] = useState(task);
          const [showEdit, setShowEdit] = useState(false);

          useEffect(() => {
            setAllocateTask(row.original.task);
          }, [row.original]);

          return (
            <div className="w-full h-full ">
              {showEdit ? (
                <input
                  type="text"
                  placeholder="Enter Task..."
                  value={allocateTask}
                  onChange={(e) => setAllocateTask(e.target.value)}
                  className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-start "
                  title={allocateTask}
                >
                  <p
                    className="text-black cursor-pointer text-start  "
                    onDoubleClick={() => setShowEdit(true)}
                  >
                    {allocateTask}
                  </p>
                </div>
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.startsWith(filterValue.toLowerCase());
        },
        size: 220,
        minSize: 200,
        maxSize: 400,
        grow: false,
      },
      // Note
      {
        accessorKey: "note",
        header: "Note",
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
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const note = row.original.note;
          // const notes = cell.getValue();
          const [allocateNote, setAllocateNote] = useState(note);
          const [showEdit, setShowEdit] = useState(false);

          useEffect(() => {
            setAllocateNote(row.original.note);
          }, [row.original]);

          const updateAllocateNote = (task) => {
            updateAlocateTask(row.original._id, allocateNote);
            setShowEdit(false);
          };

          return (
            <div className="w-full h-full ">
              {showEdit ? (
                <input
                  type="text"
                  placeholder="Enter Task..."
                  value={allocateNote}
                  onChange={(e) => setAllocateNote(e.target.value)}
                  onBlur={(e) => updateAllocateNote(e.target.value)}
                  className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-start "
                  onDoubleClick={() => setShowEdit(true)}
                  title={note}
                >
                  <p
                    className="text-black cursor-pointer text-start  "
                    onDoubleClick={() => setShowEdit(true)}
                  >
                    {note}
                  </p>
                </div>
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.startsWith(filterValue.toLowerCase());
        },
        size: 280,
        minSize: 150,
        maxSize: 300,
        grow: false,
      },
      {
        accessorKey: "type",
        header: "Type",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px] w-full items-center justify-center">
              <span
                className="ml-2 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Type
              </span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const type = row.original.type;
          return (
            <div className="w-full flex items-center justify-center">
              <span>
                {type === "Timer" ? (
                  <span className="text-green-600 font-medium">{type}</span>
                ) : (
                  <span className="text-orange-600 font-medium">{type}</span>
                )}
              </span>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";
          return cellValue.startsWith(filterValue.toLowerCase());
        },

        size: 65,
        minSize: 60,
        maxSize: 90,
        grow: false,
      },
      ...(auth?.user?.role === "Admin"
        ? [
            {
              accessorKey: "actions",
              header: "Actions",
              Cell: ({ cell, row }) => {
                const timerId = row.original._id;
                return (
                  <div className="flex items-center justify-center gap-3 w-full h-full">
                    <span
                      className="text-[1rem] cursor-pointer"
                      title="Edit this column"
                      onClick={() => {
                        setTimerId(timerId);
                        setIsOpen(true);
                      }}
                    >
                      <AiOutlineEdit className="h-5 w-5 text-cyan-600 " />
                    </span>

                    <span
                      className="text-[1rem] cursor-pointer"
                      title="Delete Task!"
                      onClick={() => handleDeleteTaskConfirmation(timerId)}
                    >
                      <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600 " />
                    </span>
                  </div>
                );
              },
              size: 60,
            },
          ]
        : []),
    ],
    // eslint-disable-next-line
    [auth, users]
  );

  // Display Time in Correct Day
  const renderTime = (startTime, endTime) => {
    if (!startTime) {
      return <span>No Start Time</span>;
    }

    // Convert startTime to Date object
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return <span>Invalid Start Time</span>;
    }

    // If endTime is not available, use the current time
    const end = endTime ? new Date(endTime) : new Date();
    if (isNaN(end.getTime())) {
      return <span>Invalid End Time</span>;
    }

    // Calculate the difference in seconds
    const differenceInSecondsTotal = differenceInSeconds(end, start);

    let formattedTime = "";

    if (differenceInSecondsTotal < 60) {
      // Display nothing if less than 1 minute
      return null;
    } else if (differenceInSecondsTotal < 3600) {
      const minutes = Math.floor(differenceInSecondsTotal / 60);
      formattedTime = `${minutes}m`; // Display in minutes if less than 1 hour
    } else {
      const hours = Math.floor(differenceInSecondsTotal / 3600);
      const minutes = Math.floor((differenceInSecondsTotal % 3600) / 60);
      formattedTime = `${hours}:${String(minutes).padStart(2, "0")}h`; // Display in hours and minutes if 1 hour or more
    }

    return (
      <div className="w-full flex items-center justify-center">
        <span>{formattedTime}</span>
      </div>
    );
  };

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);

    table.setGlobalFilter("");
    // table.resetColumnFilters();
  };

  const table = useMaterialReactTable({
    columns,
    data: timerData || [],
    enableStickyHeader: true,
    enableStickyFooter: true,
    // columnFilterDisplayMode: "popover",
    muiTableContainerProps: { sx: { maxHeight: "633px" } },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    // enableEditing: true,
    // state: { isLoading: loading },

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
        backgroundColor: "#f0f0f0",
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

    renderTopToolbarCustomActions: ({ table }) => {
      const handleClearFilters = () => {
        table.setColumnFilters([]);
        table.setGlobalFilter("");
      };

      return (
        <Box
          sx={{
            display: "flex",
            gap: "7px",
            padding: "2px",
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={handleExportData}
            // startIcon={<FileDownloadIcon />}
            className="w-[2rem] rounded-full"
          >
            <IoMdDownload className="h-5 w-5 text-gray-700" />
          </Button>
          <Button
            onClick={handleClearFilters}
            // startIcon={<ClearIcon />}
            className="w-[2rem] rounded-full"
          >
            <IoClose className="h-5 w-5 text-gray-700" />
          </Button>
        </Box>
      );
    },
  });

  return (
    <Layout>
      <div className=" relative w-full h-screen py-4 px-2 sm:px-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className=" text-xl sm:text-2xl font-semibold ">Timesheet</h1>
            <div className="flex items-center gap-2">
              <span
                className={` p-[2px] rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
                onClick={() => {
                  // setActive("All");
                  // setSelectedUser("");
                  // setSelectedComapany("");
                  // setSelectedDepartment("");
                  // setSelectedDay("");
                  // setFilterData("");
                  handleClearFilters();
                }}
                title="Clear filters"
              >
                <IoClose className="h-6 w-6  cursor-pointer" />
              </span>
            </div>
          </div>
          {/* Project Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setIsOpen(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Manual
            </button>
          </div>
        </div>
        {/* ---------------Filters---------- */}
        {/* <div className="flex items-center flex-wrap gap-2 mt">
          <div className="">
            <select
              value={selectedUser}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => {
                filterByDep(e.target.value);
                setSelectedUser(e.target.value);
              }}
              title="Filter by Users"
            >
              <option value="All">Employees</option>
              {users?.map((user, i) => (
                <option value={user?.name} key={i}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="">
            <select
              value={selectedCompany}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => setSelectedComapany(e.target.value)}
              title="Filter by Company"
            >
              <option value="All">Company</option>
              {users?.map((user, i) => (
                <option value={user?.name} key={i}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="">
            <select
              value={selectedDepartment}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => {
                filterByDep(e.target.value);
                setSelectedDepartment(e.target.value);
              }}
              title="Filter by Department"
            >
              <option value="All">Department</option>
              {departments?.map((department, i) => (
                <option value={department} key={i}>
                  {department}
                </option>
              ))}
            </select>
          </div>
          <div className="">
            <select
              value={selectedDay}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => setSelectedDay(e.target.value)}
              title="Filter by days"
            >
              <option value="All">-----</option>

              <option value="week">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
              onClick={() => {
                setActive("All");
                setSelectedUser("");
                setSelectedComapany("");
                setSelectedDepartment("");
                setSelectedDay("");
                setFilterData("");
                handleClearFilters();
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6  cursor-pointer" />
            </span>
          </div>
        </div> */}
        {/* -----------Tabledata--------------- */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-screen px-4 py-4">
            <Loader />
          </div>
        ) : (
          <div
            className={`w-full ${
              timerData.length >= 14 ? "min-h-[10vh]" : "min-h-[60vh]"
            } relative `}
          >
            <div className="h-full hidden1 overflow-y-scroll  relative">
              <MaterialReactTable table={table} />
            </div>
            <div className="w-full mt-0 2xl:mt-[-2rem] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6  lg:grid-cols-8 gap-4 2xl:gap-5">
              <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-500 hover:bg-green-600 transition-all duration-150 flex flex-col items-center justify-center text-white">
                <h4 className="text-[16px] font-medium">Monday</h4>
                <span className="text-[15px]">00:00</span>
              </div>
              <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-500 hover:bg-green-600 transition-all duration-150 flex flex-col items-center justify-center text-white">
                <h4 className="text-[16px] font-medium">Tuesday</h4>
                <span className="text-[15px]">00:00</span>
              </div>
              <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-500 hover:bg-green-600 transition-all duration-150 flex flex-col items-center justify-center text-white">
                <h4 className="text-[16px] font-medium">Wednesday</h4>
                <span className="text-[15px]">00:00</span>
              </div>
              <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-500 hover:bg-green-600 transition-all duration-150 flex flex-col items-center justify-center text-white">
                <h4 className="text-[16px] font-medium">Thursday</h4>
                <span className="text-[15px]">00:00</span>
              </div>
              <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-500 hover:bg-green-600 transition-all duration-150 flex flex-col items-center justify-center text-white">
                <h4 className="text-[16px] font-medium">Friday</h4>
                <span className="text-[15px]">00:00</span>
              </div>
              <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-500 hover:bg-green-600 transition-all duration-150 flex flex-col items-center justify-center text-white">
                <h4 className="text-[16px] font-medium">Saturday</h4>
                <span className="text-[15px]">00:00</span>
              </div>
              <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-500 hover:bg-green-600 transition-all duration-150 flex flex-col items-center justify-center text-white">
                <h4 className="text-[16px] font-medium">Sunday</h4>
                <span className="text-[15px]">00:00</span>
              </div>
              <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-orange-500 hover:bg-orange-600 transition-all duration-150 flex flex-col items-center justify-center text-white">
                <h4 className="text-[16px] font-medium">W-Total</h4>
                <span className="text-[15px]">00:00</span>
              </div>
            </div>
          </div>
        )}

        {/* -----------Add Task-------------- */}
        {isOpen && (
          <div className="fixed top-0 left-0 w-full h-[112vh] z-[999] bg-gray-300/70 flex items-center justify-center py-6  px-4">
            <AddTimerModal
              setIsOpen={setIsOpen}
              users={users}
              setTimerData={setTimerData}
              timerId={timerId}
              setTimerId={setTimerId}
              getAllTimeSheetData={getAllTimeSheetData}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
