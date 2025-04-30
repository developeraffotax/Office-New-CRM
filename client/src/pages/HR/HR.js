import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import HandleHRModal from "../../components/hr/HandleHRModal";
import HandleDepartmentModal from "../../components/hr/HandleDepartmentModal";
import { AiTwotoneDelete } from "react-icons/ai";
import { MdOutlineEdit, MdOutlineModeEdit } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import { RiEdit2Line } from "react-icons/ri";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { GrCopy } from "react-icons/gr";
import { TbLoader, TbLoader2 } from "react-icons/tb";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const updates_object_init = {
  title: "",
  department: "",
  category: "",
  software: "",
};

export default function HR() {
  const { auth } = useAuth();
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const initialLoad = useRef(true);
  const [isloading, setIsLoading] = useState(false);
  const [deparmentsData, setDepartmentData] = useState([]);
  const [ishandleDepartment, setIshandleDepartment] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const closeProject = useRef(null);
  const [showDepartment, setShowDepartment] = useState(false);
  const [copyDescription, setCopyDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [showcolumn, setShowColumn] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [copyLoad, setCopyLoad] = useState(false);
  const currentMonthIndex = new Date().getMonth();
  const [month, setMonth] = useState(currentMonthIndex);

  console.log("copyDescription:", copyDescription);

  useEffect(() => {
    if (userName && userName.length > 0) {
      const savedVisibility = JSON.parse(
        localStorage.getItem("visibileHrColumn")
      );

      if (savedVisibility) {
        setColumnVisibility(savedVisibility);
      } else {
        const initialVisibility = userName.reduce((acc, col) => {
          acc[col] = true;
          return acc;
        }, {});
        setColumnVisibility(initialVisibility);
      }
    }
  }, [userName]);

  const toggleColumnVisibility = (column) => {
    const updatedVisibility = {
      ...columnVisibility,
      [column]: !columnVisibility[column],
    };
    setColumnVisibility(updatedVisibility);
    localStorage.setItem("visibileHrColumn", JSON.stringify(updatedVisibility));
  };

  // --------------Get All Tasks---------->
  const getAllTasks = async () => {
    if (initialLoad.current) {
      setIsLoading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/hr/all/tasks`
      );
      setTaskData(data?.tasks);
    } catch (error) {
      console.log(error);
    } finally {
      if (initialLoad) {
        setIsLoading(false);
        initialLoad.current = false;
      }
    }
  };

  useEffect(() => {
    getAllTasks();
    // eslint-disable-next-line
  }, []);

  // ----------Fetch All Departments-------->
  const fetchAllDepartments = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/department/all`
      );
      setDepartmentData(data.departments);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllDepartments();
    // eslint-disable-next-line
  }, []);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );

      console.log("THE DAT IS >>>>>>>>>>>>>>>>>>>", data);
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access.some((item) => item?.permission?.includes("HR"))
        ) || []
      );

      setUserName(
        data?.users
          ?.filter((user) =>
            user.role?.access.some((item) => item?.permission?.includes("HR"))
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

  // -----------Copy Task-------->
  const handleCopyTask = async (id) => {
    setCopyLoad(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/hr/copy/task/${id}`
      );
      if (data) {
        getAllTasks();
        toast.success("Task copied successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setCopyLoad(false);
    }
  };

  // ------Close Departments------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        closeProject.current &&
        !closeProject.current.contains(event.target)
      ) {
        setShowDepartment(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------Delete Departments-------->
  const handleDeleteConfirmation = (did) => {
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
        deleteDepartment(did);
        Swal.fire("Deleted!", "Your deprtment has been deleted.", "success");
      }
    });
  };
  const deleteDepartment = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/department/delete/${id}`
      );
      if (data) {
        fetchAllDepartments();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  // ---------Delete Departments-------->
  const handleDeleteTaskConfirmation = (tid) => {
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
        deleteTask(tid);
        Swal.fire("Deleted!", "Your Task has been deleted.", "success");
      }
    });
  };
  const deleteTask = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/hr/remove/task/${id}`
      );
      if (data) {
        setTaskData((prevTasks) => prevTasks.filter((task) => task._id !== id));
        getAllTasks();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // Update User Status
  const updateUserStatus = async (taskId, statusId, status) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/hr/update/status/${taskId}`,
        { statusId, status }
      );
      if (data) {
        getAllTasks();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // BULK EDITING
  const [rowSelection, setRowSelection] = useState({});

  const [showEdit, setShowEdit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [updates, setUpdates] = useState(updates_object_init);

  const handle_on_change_update = (e) => {
    setUpdates((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  // -------Update Bulk ROWS------------->

  console.log(rowSelection, "ROW SLEECTION SSSSSS000");

  const updateBulkRows = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    console.log("Row Selection", rowSelection);

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/hr/update/bulk`,
        {
          rowSelection: Object.keys(rowSelection).filter(
            (id) => rowSelection[id] === true
          ),
          updates,
        }
      );

      if (data) {
        setUpdates(updates_object_init);
        toast.success("Rows Updated💚💚");
        getAllTasks();
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
      toast.error("Something went wrong!");
    } finally {
      setIsUpdating(false);
    }
  };

  // ---------------Table Detail------------->
  const columns = useMemo(
    () => [
      {
        accessorKey: "department.departmentName",
        minSize: 100,
        maxSize: 200,
        size: 170,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => column.setFilterValue("")}
              >
                Department
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {deparmentsData?.map((department) => (
                  <option
                    key={department?._id}
                    value={department?.departmentName || ""}
                  >
                    {department?.departmentName}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const department = row.original?.department?.departmentName || "N/A"; // Handle undefined
          return (
            <div className="w-full px-1">
              <span>{department}</span>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          if (!filterValue) return true;
          if (!cellValue) return false;
          return (
            cellValue.toString().toLowerCase() === filterValue.toLowerCase()
          );
        },
        filterSelectOptions: deparmentsData?.map(
          (dep) => dep?.departmentName || ""
        ),
        filterVariant: "select",
      },

      {
        accessorKey: "category",
        Header: ({ column }) => {
          return (
            <div className=" w-[130px] flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Category
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const category = row.original.category;

          return (
            <div className="w-full h-full ">
              <div
                className="w-full h-full flex items-center justify-start "
                title={category}
              >
                <span className="cursor-pointer text-start  ">{category}</span>
              </div>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";
          return cellValue.includes(filterValue.toLowerCase());
        },
        size: 180,
        minSize: 120,
        maxSize: 200,
        grow: false,
      },
      {
        accessorKey: "software",
        Header: ({ column }) => {
          return (
            <div className=" w-[130px] flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Software
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const software = row.original.software;

          return (
            <div className="w-full h-full ">
              <div
                className="w-full h-full flex items-center justify-start "
                title={software}
              >
                <span className="cursor-pointer text-start  ">{software}</span>
              </div>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";
          return cellValue.includes(filterValue.toLowerCase());
        },
        size: 180,
        minSize: 120,
        maxSize: 200,
        grow: false,
      },
      {
        accessorKey: "title",
        Header: ({ column }) => {
          return (
            <div className=" w-[480px] flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Task Detail
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const title = row.original.title || "";

          return (
            <div className="w-full h-full ">
              <div className="w-full h-full flex items-center justify-start ">
                <div
                  onClick={() => {
                    setShowDescription(true);
                    setCopyDescription(row.original?.description);
                  }}
                  className="px-1 w-full text-[14px] text-blue-600 cursor-pointer"
                >
                  {title.length > 65 ? `${title.slice(0, 65)}...` : title}
                </div>
              </div>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";
          return cellValue.includes(filterValue.toLowerCase());
        },
        size: 500,
        minSize: 350,
        maxSize: 560,
        grow: false,
      },
      // User List
      ...userName
        .filter((name) => columnVisibility[name])
        .map((name) => ({
          accessorKey: `${name}`,
          // Header: `${name}`,
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
                  {name}
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] w-[5.5rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            );
          },
          Cell: ({ row }) => {
            const matchedUser = row.original.users?.find(
              (u) => u?.user?.name === name
            );

            console.log("matchedUser:", matchedUser);

            const [isShow, setIsShow] = useState(false);
            const [status, setStatus] = useState(matchedUser?.status || "");

            const handleStatus = (value, statusId) => {
              setStatus(value);
              updateUserStatus(row.original._id, statusId, value);
              setIsShow(false);
            };
            return (
              <div className="w-full h-full">
                {!isShow ? (
                  <div
                    className={`text-center w-full h-full cursor-pointer ${
                      matchedUser?.status === "Yes"
                        ? "text-green-500"
                        : matchedUser?.status === "No"
                        ? "text-red-500"
                        : "text-white"
                    }`}
                    onDoubleClick={() => setIsShow(true)}
                  >
                    {matchedUser?.status || ""}
                  </div>
                ) : (
                  <select
                    value={status}
                    onChange={(e) =>
                      handleStatus(e.target.value, matchedUser?._id)
                    }
                    onBlur={() => setIsShow(false)}
                    className="font-normal w-full h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                  >
                    <option value="."></option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                )}
              </div>
            );
          },
          size: 100,
          minSize: 80,
          maxSize: 160,
          grow: false,
          filterFn: (row, columnId, filterValue) => {
            const status = row.original.users?.find(
              (u) => u?.user?.name === name
            )?.status;

            return status === filterValue || filterValue === "";
          },
          filterSelectOptions: ["Yes", "No"],
          filterVariant: "select",
        })),

      // <-----Action------>
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          return (
            <div className="flex items-center justify-center gap-2 w-full h-full">
              <span
                className=""
                title="Copy Task"
                onClick={() => {
                  handleCopyTask(row.original._id);
                }}
              >
                <GrCopy className="h-6 w-6 cursor-pointer text-sky-500 hover:text-sky-600" />
              </span>
              <span
                className=""
                title="Edit Task"
                onClick={() => {
                  setTaskId(row.original._id);
                  setShowAddTask(true);
                }}
              >
                <RiEdit2Line className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
              </span>
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => handleDeleteTaskConfirmation(row.original._id)}
                title="Delete Task!"
              >
                <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600 " />
              </span>
            </div>
          );
        },
        size: 110,
      },
    ],
    // eslint-disable-next-line
    [users, auth, taskData, deparmentsData, columnVisibility]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);

    table.setGlobalFilter("");
    // table.resetColumnFilters();
  };

  const table = useMaterialReactTable({
    columns,
    data: taskData || [],

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
        caption: {
          captionSide: "top",
        },
      },
    },
  });

  const renderColumnControls = () => (
    <div className="flex flex-col gap-3 bg-white rounded-md border p-4">
      {Object.keys(columnVisibility)?.map((column) => (
        <div key={column} className="flex items-center">
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
      ))}
    </div>
  );
  // -----------Handle Close Outsite
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        closeProject.current &&
        !closeProject.current.contains(event.target)
      ) {
        setShowDepartment(false);
        setShowColumn(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);






















       const [fLoading, setFLoading] = useState(false);


    // Import CSV File
    // --------------Import Job data------------>
    const importJobData = async (file) => {
      setFLoading(true);
      if (!file) {
        toast.error("File is required!");
        setFLoading(false);
        return;
      }
  
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/hr/import`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (data) {
          getAllTasks();
          toast.success("HR Tasks Data imported successfully!");
        }
      } catch (error) {
        console.error("Error importing data:", error);
        toast.error(
          error?.response?.data?.message || "Failed to import data"
        );
      } finally {
        setFLoading(false);
      }
    };






  return (
    <Layout>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex fles-start sm:items-center sm:justify-between flex-col sm:flex-row gap-4 ">
          <div className="flex items-center gap-4 justify-start ">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              HR
            </h1>

            <span
              className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400  hover:rotate-180 `}
              onClick={() => {
                handleClearFilters();
              }}
              title="Clear filters"
            >
              <IoClose className="h-4 sm:h-6 w-4 sm:w-6 text-white" />
            </span>

            <div className="flex justify-center items-center   ">
              <span
                className={` p-1 rounded-md hover:shadow-md   bg-gray-50 cursor-pointer border ${
                  showEdit &&
                  "bg-gradient-to-tr from-rose-800 via-[#f43f5e] to-[#fb923c] text-white"
                }`}
                onClick={() => {
                  setShowEdit(!showEdit);
                }}
                title="Edit Multiple Jobs"
              >
                <MdOutlineModeEdit className="h-6 w-6  cursor-pointer" />
              </span>
            </div>
          </div>

          {/* ---------Template Buttons */}
          <div className="flex items-center gap-4 sm:w-fit w-full justify-end sm:justify-normal">
            {/* Hide & Show */}
            <div className=" hidden sm:flex relative">
              <div
                className={` p-1 rounded-md hover:shadow-md bg-gray-50 cursor-pointer border ${
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
                <div
                  ref={closeProject}
                  className="absolute top-10 right-8 z-50 w-[12rem]"
                >
                  {renderColumnControls()}
                </div>
              )}
            </div>

            <form>
              <input
                type="file"
                name="file"
                onChange={(e) => importJobData(e.target.files[0])}
                accept=".csv, .xlsx"
                id="importTasksHR"
                className="hidden"
              />
              <label
                htmlFor="importTasksHR"
                className={`${
                  style.button1
                } !bg-gray-100 !shadow-none text-black hidden sm:flex  hover:bg-orange-500 text-[15px] bg-gradient-to-bl from-[#ffe4e6]  to-[#d8d8d8] ${
                  fLoading ? "cursor-not-allowed opacity-90" : ""
                }`}
                style={{ padding: ".4rem 1.1rem", color: "#000" }}
                title={"Import csv or excel file!"}
                onClick={(e) => fLoading && e.preventDefault()}
              >
                {fLoading ? (
                  <TbLoader className="h-6 w-6 animate-spin text-black" />
                ) : (
                  "Import"
                )}
              </label>
            </form>

            {/* ----------Months Filter--------- */}
            {/* <div className="relative">
              <select
                className="w-[8rem] p-[6px] rounded-md border border-gray-300 cursor-pointer outline-orange-500"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                <option value="">Select Month</option>
                {months.map((monthName, index) => (
                  <option key={index} value={index}>
                    {monthName}
                  </option>
                ))}
              </select>
            </div> */}
            {/* ----------All Departments--------- */}
            <div
              className=" hidden sm:flex items-center justify-between relative w-[10rem]  border-2 border-gray-200 rounded-md py-1 px-2  gap-1"
              onClick={() => setShowDepartment(!showDepartment)}
            >
              <span className="text-[15px] text-gray-900 cursor-pointer">
                Departments
              </span>
              <span
                onClick={() => setShowDepartment(!showDepartment)}
                className="cursor-pointer"
              >
                {!showDepartment ? (
                  <IoIosArrowDown className="h-5 w-5 text-black cursor-pointer" />
                ) : (
                  <IoIosArrowUp className="h-5 w-5 text-black cursor-pointer" />
                )}
              </span>
              {/* -----------Projects------- */}
              {showDepartment && (
                <div
                  ref={closeProject}
                  className="absolute top-9 right-[-3.5rem] flex flex-col gap-2 max-h-[16rem] overflow-y-auto hidden1 z-[99] border rounded-sm shadow-sm bg-gray-50 py-2 px-2 w-[14rem]"
                >
                  {deparmentsData &&
                    deparmentsData?.map((deprtment) => (
                      <div
                        key={deprtment._id}
                        className="w-full flex items-center justify-between gap-1 rounded-md bg-white border py-1 px-1 hover:bg-gray-100"
                      >
                        <p className="text-[13px] w-[8rem] ">
                          {deprtment?.departmentName}
                        </p>
                        <div className="flex items-center gap-1">
                          <span
                            onClick={() => {
                              setDepartmentId(deprtment._id);
                              setIshandleDepartment(true);
                            }}
                            title="Edit Department"
                          >
                            <MdOutlineEdit className="h-5 w-5 cursor-pointer hover:text-sky-500 transition-all duration-200" />
                          </span>
                          <span
                            title="Delete Delete"
                            onClick={() =>
                              handleDeleteConfirmation(deprtment._id)
                            }
                          >
                            <AiTwotoneDelete className="h-5 w-5 cursor-pointer hover:text-red-500 transition-all duration-200" />
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {/* --------- */}
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setIshandleDepartment(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Department
            </button>
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowAddTask(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Task
            </button>
          </div>
        </div>
        <hr className="w-full h-[1px] bg-gray-300 my-5" />
        {copyLoad && (
          <div className="pb-5">
            <div class="loader"></div>
          </div>
        )}

        {/* Update Bulk Jobs */}
        {showEdit && (
          <div className="w-full  p-4 ">
            <form
              onSubmit={updateBulkRows}
              className="w-full grid grid-cols-12 gap-4 max-2xl:grid-cols-8  "
            >
              <div className="">
                <select
                  name="department"
                  value={updates.department}
                  onChange={handle_on_change_update}
                  className={`${style.input} w-full`}
                >
                  <option value="empty">Department</option>
                  {deparmentsData?.map((el, i) => (
                    <option value={el._id} key={i}>
                      {el.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inputBox w-full">
                <input
                  name="category"
                  type="text"
                  value={updates.category}
                  onChange={handle_on_change_update}
                  className={`${style.input} w-full `}
                />
                <span>Category</span>
              </div>

              <div className="inputBox w-full">
                <input
                  name="software"
                  type="text"
                  value={updates.software}
                  onChange={handle_on_change_update}
                  className={`${style.input} w-full `}
                />
                <span>Software</span>
              </div>

              <div className="inputBox w-full">
                <input
                  name="title"
                  type="text"
                  value={updates.title}
                  onChange={handle_on_change_update}
                  className={`${style.input} w-full `}
                  // placeholder="Company Name"
                />
                <span>Title</span>
              </div>

              {users
                ?.filter((el) => columnVisibility[el.name])
                .map(({ name, _id }) => {
                  console.log("name is >>>>>", users);
                  console.log("updated xxx", updates);
                  return (
                    <div className="">
                      {/* <span>{name}</span> */}
                      <select
                        name={_id}
                        value={updates[_id]}
                        onChange={handle_on_change_update}
                        className={`${style.input} w-full`}
                      >
                        {/* <option value="empty">{name}</option> */}
                        <option value="">{name}</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  );
                })}

              <div className="w-full flex items-center justify-end  ">
                <button
                  className={`${style.button1} text-[15px] w-full  `}
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

        {/* -----------------Table Detail----------- */}
        <div className="w-full h-full">
          {isloading ? (
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

        {/* -----------------Handle HR Tasks--------------- */}
        {showAddTask && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-4 px-4 bg-gray-300/70 flex items-center justify-center">
            <div className="w-[50rem]">
              <HandleHRModal
                setShowAddTask={setShowAddTask}
                users={users}
                taskId={taskId}
                setTaskId={setTaskId}
                getAllTasks={getAllTasks}
                deparmentsData={deparmentsData}
              />
            </div>
          </div>
        )}
        {/* -----------------Handle Departments--------------- */}
        {ishandleDepartment && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-4 px-4 bg-gray-300/70 flex items-center justify-center">
            <div className="w-[32rem]">
              <HandleDepartmentModal
                setIshandleDepartment={setIshandleDepartment}
                users={users}
                departmentId={departmentId}
                setDepartmentId={setDepartmentId}
                fetchAllDepartments={fetchAllDepartments}
                getAllTasks={getAllTasks}
              />
            </div>
          </div>
        )}
        {/* -----------------template Details----------- */}
        {showDescription && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-4 px-4 bg-gray-300/70 flex items-center justify-center">
            <div className="flex flex-col gap-2 bg-white rounded-md shadow-md w-[55rem] max-h-[100vh] ">
              <div className="flex items-center justify-between px-4 pt-2">
                <h1 className="text-[20px] font-semibold text-black">
                  Task Detail
                </h1>
                <span
                  className=" cursor-pointer"
                  onClick={() => {
                    setCopyDescription("");
                    setShowDescription(false);
                  }}
                >
                  <IoClose className="h-6 w-6 " />
                </span>
              </div>
              <hr className="h-[1px] w-full bg-gray-400 " />
              <div className="px-4 w-full">
                <div
                  className=" py-4  px-4 w-full max-h-[80vh] text-[14px] overflow-y-auto cursor-pointer"
                  dangerouslySetInnerHTML={{ __html: copyDescription }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
