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
import { format } from "date-fns";
import { GrCopy } from "react-icons/gr";
import { AiTwotoneDelete } from "react-icons/ai";

// CSV Configuration
const csvConfig = mkConfig({
  filename: "full_table_data",
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  showTitle: true,
  title: "Exported Tasks Table Data",
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
});

export default function TimeSheet() {
  const { auth } = useAuth();
  const [timerData, setTimerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCompany, setSelectedComapany] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [active, setActive] = useState("");
  console.log("selectedUser:", selectedUser);

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

  // -----------Download in CSV------>
  const flattenData = (data) => {
    return data.map((row) => ({
      projectName: row.project.projectName,
      projectId: row.project?._id,
      jobHolder: row.jobHolder,
      task: row.task,
      hours: row.hours,
      startDate: row.startDate,
      deadline: row.deadline || "",
      status: row.status || "",
      lead: row.lead || "",
      estimate_Time: row.estimate_Time || "",
    }));
  };

  const handleExportData = () => {
    const csvData = flattenData(timerData);
    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
  };

  // --------------Table Data--------->
  const columns = useMemo(
    () => [
      {
        accessorKey: "project.createdAt",
        header: "Date",
        minSize: 70,
        maxSize: 150,
        size: 90,
        grow: true,
        Cell: ({ cell, row }) => {
          const date = row.original.createdAt;
          // console.log("Date", date);

          return (
            <div className="w-full flex items-center justify-center">
              <span>{format(new Date(date), "dd-MMM-yyyy")}</span>
            </div>
          );
        },
        filterFn: "equals",
        // filterSelectOptions: allProjects?.map(
        //   (project) => project?.projectName
        // ),
        filterVariant: "select",
      },
      {
        accessorKey: "jobHolder",
        header: "Job Holder",
        Cell: ({ cell, row }) => {
          const jobholder = cell.getValue();

          return (
            <select
              value={jobholder || ""}
              className="w-full h-[2rem] rounded-md border-none  outline-none"
              // onChange={(e) =>
              //   updateTaskJLS(row.original?._id, e.target.value, "", "")
              // }
            >
              <option value="empty"></option>
              {/* {users?.map((jobHold, i) => (
                <option value={jobHold?.name} key={i}>
                  {jobHold.name}
                </option>
              ))} */}
            </select>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((jobhold) => jobhold.name),
        filterVariant: "select",
        size: 90,
        minSize: 80,
        maxSize: 130,
        grow: true,
      },
      {
        accessorKey: "task",
        header: "Tasks",
        Cell: ({ cell, row }) => {
          const task = row.original.task;
          const [allocateTask, setAllocateTask] = useState(task);
          const [showEdit, setShowEdit] = useState(false);

          useEffect(() => {
            setAllocateTask(row.original.task);
          }, [row.original]);

          const updateAllocateTask = (task) => {
            // updateAlocateTask(row.original._id, allocateTask, "", "");
            setShowEdit(false);
          };
          return (
            <div className="w-full h-full ">
              {showEdit ? (
                <input
                  type="text"
                  placeholder="Enter Task..."
                  value={allocateTask}
                  onChange={(e) => setAllocateTask(e.target.value)}
                  onBlur={(e) => updateAllocateTask(e.target.value)}
                  className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-start "
                  onDoubleClick={() => setShowEdit(true)}
                >
                  <p
                    className="text-sky-500 cursor-pointer text-start hover:text-sky-600 "
                    onDoubleClick={() => setShowEdit(true)}
                    // onClick={() => {
                    //   setTaskID(row.original._id);
                    //   setProjectName(row.original.project.projectName);
                    //   setShowDetail(true);
                    // }}
                  >
                    {allocateTask}
                  </p>
                </div>
              )}
            </div>
          );
        },
        filterFn: "equals",
        filterVariant: "select",
        size: 360,
        minSize: 200,
        maxSize: 400,
        grow: true,
      },
    ],
    // eslint-disable-next-line
    [auth]
  );

  const table = useMaterialReactTable({
    columns,
    data: timerData,
    enableStickyHeader: true,
    enableStickyFooter: true,
    columnFilterDisplayMode: "popover",
    muiTableContainerProps: { sx: { maxHeight: "820px" } },
    enableColumnActions: false,
    enableColumnFilters: true,
    enableSorting: true,
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
      <div className=" relative w-full min-h-screen py-4 px-2 sm:px-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-semibold ">Timesheet</h1>
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
        <div className="flex items-center flex-wrap gap-2 mt">
          {/* ------------Filter By User ---------*/}
          <div className="">
            <select
              value={selectedUser}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => setSelectedUser(e.target.value)}
              title="Filter by Users"
            >
              <option value="All">Filter By Employees</option>
              {users?.map((user, i) => (
                <option value={user?.name} key={i}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          {/* ------------Filter By Company Name----------- */}
          <div className="">
            <select
              value={selectedCompany}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => setSelectedComapany(e.target.value)}
              title="Filter by Company"
            >
              <option value="All">Filter By Company</option>
              {users?.map((user, i) => (
                <option value={user?.name} key={i}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          {/* ------------Filter By Department Name----------- */}
          <div className="">
            <select
              value={selectedDepartment}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => setSelectedDepartment(e.target.value)}
              title="Filter by Department"
            >
              <option value="All">Filter By Department</option>
              {users?.map((user, i) => (
                <option value={user?.name} key={i}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          {/* ------------Filter By Days----------- */}
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
                setSelectedComapany(false);
                setSelectedDepartment(false);
                setSelectedDay(false);
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6  cursor-pointer" />
            </span>
          </div>
        </div>
        {/* -----------Tabledata--------------- */}
        <div className="w-full min-h-[10vh] relative -mt-[10px] ">
          <div className="h-full hidden1 overflow-y-scroll relative">
            <MaterialReactTable table={table} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
