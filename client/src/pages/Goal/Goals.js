import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import HandleGoalModal from "../../components/Goal/HandleGoalModal";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AiTwotoneDelete } from "react-icons/ai";
import { MdCheckCircle } from "react-icons/md";
import { MdOutlineModeEdit } from "react-icons/md";
import Swal from "sweetalert2";
import ReactApexChart from "react-apexcharts";
import CompletedGoals from "./CompletedGoals";
import ChartData from "./ChartData";
import { BsPieChartFill } from "react-icons/bs";
import { VscGraph } from "react-icons/vsc";

export default function Goals() {
  const { auth } = useAuth();
  const [show, setShow] = useState(false);
  const [goalId, setGoalId] = useState("");
  const [users, setUsers] = useState([]);
  const [goalsData, setGoalsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("progress");
  const [showGraph, setShowGraph] = useState(false);
  const [selectChart, setSelectChart] = useState("Line & Bar");
  const [formData, setFormData] = useState({
    subject: "",
    achievement: "",
    startDate: "",
    endDate: "",
    goalType: "",
    jobHolder: "",
  });
  const goalTypes = [
    "Increase Client",
    "Increase Fee",
    "Total Proposal",
    "Total Lead",
    "Lead Won",
  ];

  // -------Get All Proposal-------
  const getAllGoals = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/fetch/all/goals`
      );
      if (data) {
        setGoalsData(data.goals);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllGoals();
  }, []);

  const getGoals = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/fetch/all/goals`
      );
      if (data) {
        setGoalsData(data.goals);
      }
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
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access.some((item) => item?.permission?.includes("Goals"))
        ) || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  //   Update Data
  const handleUpdateData = async (goalId, updateData) => {
    if (!goalId) {
      toast.error("Goal id is required!");
      return;
    }

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/update/goal/${goalId}`,
        { ...updateData }
      );
      if (data?.success) {
        const updateGoal = data.goal;

        setGoalsData((prevData) =>
          prevData.filter((item) => item._id !== updateGoal._id)
        );
        if (filterData) {
          setFilterData((prevData) =>
            prevData.filter((item) => item._id !== updateGoal._id)
          );
        }
        setFormData({
          subject: "",
          achievement: "",
          startDate: "",
          endDate: "",
          goalType: "",
          jobHolder: "",
        });
        toast.success("Goal data updated!");
        getGoals();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // ---------Handle Delete Task-------------

  const handleDeleteGoalConfirmation = (goalId) => {
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
        handleDeleteGoal(goalId);
        Swal.fire("Deleted!", "Your goal has been deleted.", "success");
      }
    });
  };

  const handleDeleteGoal = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/delete/goals/${id}`
      );
      if (data) {
        getGoals();

        toast.success("Goal deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Complete Status
  const handleupdateConfirmation = (goalId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, complete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleCompleteGoal(goalId);
        Swal.fire("Deleted!", "Goal status updated successfully.", "success");
      }
    });
  };

  const handleCompleteGoal = async (id) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/upadate/goals/status/${id}`,
        { status: "completed" }
      );
      if (data) {
        getGoals();
        toast.success("Goal status updated!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //   --------------------Table Data --------------->
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };
  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "jobHolder._id",
        Header: ({ column }) => {
          const user = auth?.user?.name;

          //   useEffect(() => {
          //     column.setFilterValue(user);

          //     // eslint-disable-next-line
          //   }, []);

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
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {users?.map((jobhold, i) => (
                  <option key={i} value={jobhold?._id}>
                    {jobhold?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = row.original.jobHolder.name;
          const [localJobholder, setLocalJobholder] = useState(
            jobholder._id || ""
          );
          const [show, setShow] = useState(false);

          const handleChange = (e) => {
            const selectedValue = e.target.value;
            setLocalJobholder(selectedValue);

            setFormData((prevData) => ({
              ...prevData,
              jobHolder: localJobholder,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
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
                    <option value={jobHold?._id} key={i}>
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
        filterFn: "equals",
        filterSelectOptions: users.map((jobhold) => jobhold._id),
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 130,
        grow: false,
      },
      {
        accessorKey: "subject",
        header: "Subject",
        Header: ({ column }) => {
          return (
            <div className=" w-[350px] flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Subject
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-white border-gray-300 rounded-md border  outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const subject = row.original.subject;
          const [showEdit, setShowEdit] = useState(false);
          const [localSubject, setSubject] = useState(subject);

          const handleSubmit = (e) => {
            setFormData((prevData) => ({
              ...prevData,
              subject: localSubject,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
              subject: localSubject,
            });

            setShowEdit(false);
          };
          return (
            <div className="w-full h-full ">
              {showEdit ? (
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Enter Subject..."
                    value={localSubject}
                    onChange={(e) => setSubject(e.target.value)}
                    onBlur={(e) => handleSubmit(e.target.value)}
                    className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
                  />
                </form>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-start "
                  onDoubleClick={() => setShowEdit(true)}
                  title={subject}
                >
                  <p
                    className="text-black text-start font-medium"
                    onDoubleClick={() => setShowEdit(true)}
                  >
                    {subject}
                  </p>
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
        size: 400,
        minSize: 350,
        maxSize: 560,
        grow: false,
      },

      //   Start date
      {
        accessorKey: "startDate",
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
                Start Date
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
          const startDate = row.original.startDate;
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
              ...formData,
              startDate: newDate,
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
                  {startDate ? (
                    format(new Date(startDate), "dd-MMM-yyyy")
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
          "Custom date",
        ],
        filterVariant: "custom",
        size: 120,
        minSize: 90,
        maxSize: 120,
        grow: false,
      },
      //   End Date
      {
        accessorKey: "endDate",
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
                End Date
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
          const endDate = row.original.endDate;
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
              ...formData,
              endDate: newDate,
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
                  {endDate ? (
                    format(new Date(endDate), "dd-MMM-yyyy")
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
          "Custom date",
        ],
        filterVariant: "custom",
        size: 120,
        minSize: 90,
        maxSize: 120,
        grow: false,
      },
      {
        accessorKey: "goalType",
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
                Goal Type
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {goalTypes?.map((goal, i) => (
                  <option key={i} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const goalType = row.original.goalType;
          const [localJobholder, setLocalJobholder] = useState(goalType || "");
          const [show, setShow] = useState(false);

          const handleChange = (e) => {
            const selectedValue = e.target.value;
            setLocalJobholder(selectedValue);

            setFormData((prevData) => ({
              ...prevData,
              goalType: localJobholder,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
              goalType: selectedValue,
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
                  {goalTypes?.map((goal, i) => (
                    <option value={goal} key={i}>
                      {goal}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="w-full cursor-pointer"
                  onDoubleClick={() => setShow(true)}
                >
                  {goalType ? (
                    <span>{goalType}</span>
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </div>
              )}
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: goalTypes.map((goal) => goal),
        filterVariant: "select",
        size: 150,
        minSize: 80,
        maxSize: 170,
        grow: false,
      },
      // Target
      {
        accessorKey: "achievement",
        minSize: 60,
        maxSize: 80,
        size: 140,
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
                Target
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-white border-gray-300 rounded-md border  outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const achievement = row.original.achievement;
          const [show, setShow] = useState(false);
          const [localClientName, setLocalClientName] = useState(achievement);

          const handleSubmit = (e) => {
            e.preventDefault();
            setFormData((prevData) => ({
              ...prevData,
              achievement: localClientName,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
              achievement: localClientName,
            });

            setShow(false);
          };

          return (
            <div className="w-full px-1">
              {show ? (
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={localClientName}
                    autoFocus
                    onChange={(e) => setLocalClientName(e.target.value)}
                    className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
                  />
                </form>
              ) : (
                <div
                  onDoubleClick={() => setShow(true)}
                  className="cursor-pointer w-full flex items-center justify-center"
                >
                  {achievement ? (
                    achievement
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
      //Achieved
      {
        accessorKey: "achievedCount",
        minSize: 60,
        maxSize: 90,
        size: 140,
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
                Achieved
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer  rounded-md border bg-white border-gray-300 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const achievedCount = row.original.achievedCount;

          return (
            <div className="w-full flex items-center justify-center px-1">
              <div className="cursor-pointer rounded-full ">
                {achievedCount ? achievedCount : 0}
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
      //   Difference
      {
        accessorKey: "difference",
        minSize: 60,
        maxSize: 150,
        size: 100,
        grow: false,
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
                Outcome
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                <option value="positive">Exceeds</option>
                <option value="negative">Short</option>
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const achievement = parseFloat(row.original.achievement) || 0;
          const achievedCount = parseFloat(row.original.achievedCount) || 0;

          const difference = (achievedCount - achievement).toFixed(2);
          const isPositive = difference >= 0;

          return (
            <div className="w-full px-1 flex items-center justify-center">
              <div
                className={`cursor-pointer w-full text-center ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPositive ? `+${difference}` : difference}
              </div>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const achievement = parseFloat(row.original.achievement) || 0;
          const achievedCount = parseFloat(row.original.achievedCount) || 0;
          const difference = achievedCount - achievement;

          if (filterValue === "positive") {
            return difference >= 0;
          } else if (filterValue === "negative") {
            return difference < 0;
          }
          return true; // Show all if no filter is selected
        },
        filterVariant: "select",
      },

      // Progress
      {
        accessorKey: "progress",
        minSize: 100,
        maxSize: 250,
        size: 150,
        grow: false,
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
                Progress
              </span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const achievement = parseFloat(row.original.achievement) || 0;
          const achievedCount = parseFloat(row.original.achievedCount) || 0;

          const progress =
            achievement > 0
              ? ((achievedCount / achievement) * 100).toFixed(2)
              : 0;
          const progressValue = Math.min(Math.max(progress, 0), 100);

          // ApexCharts options
          const chartOptions = {
            chart: {
              type: "radialBar",
              height: 150,
            },
            plotOptions: {
              radialBar: {
                hollow: {
                  size: "50%",
                },
                dataLabels: {
                  name: {
                    show: false,
                  },
                  value: {
                    fontSize: "16px",
                    fontWeight: "600",

                    show: true,
                    formatter: function (val) {
                      return `${Math.round(val)}%`;
                    },
                    color: progressValue >= 100 ? "#00E396" : "#FF4560",
                    offsetY: 7,
                    offsetX: 0,
                  },
                },
              },
            },
            fill: {
              colors: progressValue >= 100 ? ["#00E396"] : ["#FF4560"],
            },
            series: [progressValue],
          };

          return (
            <div className="w-full flex items-center justify-center">
              <ReactApexChart
                options={chartOptions}
                series={[progressValue]}
                type="radialBar"
                height={130}
                className="flex items-center justify-center"
              />
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

      //
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          // console.log("Id:", row.original._id);
          return (
            <div className="flex items-center justify-center gap-3 w-full h-full">
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => {
                  setGoalId(row.original._id);
                  setShow(true);
                }}
                title="Edit Goal"
              >
                <MdOutlineModeEdit className="h-6 w-6 text-sky-600 " />
              </span>

              <span
                className=""
                title="Complete Goal"
                onClick={() => {
                  handleupdateConfirmation(row.original._id);
                }}
              >
                <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
              </span>
              <button
                type="button"
                onClick={() => handleDeleteGoalConfirmation(row.original._id)}
                title="Delete Goal!"
              >
                <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600" />
              </button>
            </div>
          );
        },
        size: 130,
      },
    ],
    // eslint-disable-next-line
    [users, auth, goalsData, filterData]
  );

  const table = useMaterialReactTable({
    columns,
    data: goalsData || [],
    enableStickyHeader: true,
    enableStickyFooter: true,
    muiTableContainerProps: { sx: { maxHeight: "840px" } },
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
  });

  useEffect(() => {
    const filteredRows = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    console.log("Filtered Data:", filteredRows);
    setFilterData(filteredRows);
  }, [table.getFilteredRowModel().rows]);

  return (
    <Layout>
      <div className=" relative w-full h-[100%] overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-semibold ">Goals</h1>

            <span
              className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
              onClick={() => {
                handleClearFilters();
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6  cursor-pointer" />
            </span>
            <span
              onClick={() => setShowGraph(!showGraph)}
              className="ml-[2rem] mb-1 p-1 rounded-md hover:shadow-md transition-all duration-300 cursor-pointer text-orange-500 hover:text-orange-600 bg-gray-200/60 hover:bg-gray-200/80 border"
            >
              <VscGraph className="h-6 w-6" />
            </span>
          </div>

          {/* ---------Template Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShow(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New Goal
            </button>
          </div>
        </div>
        {/* ----------Buttons------ */}
        <div className="flex items-center gap-5 mt-4">
          <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden mt-2 transition-all duration-300 w-fit">
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
              className={`py-1 flex items-center justify-center px-4 outline-none border-l-2 border-orange-500 transition-all duration-300 w-[6rem]  ${
                selectedTab === "complete"
                  ? "bg-orange-500 text-white"
                  : "text-black bg-gray-100 hover:bg-slate-200"
              }`}
              onClick={() => {
                setSelectedTab("complete");
              }}
            >
              Completed
            </button>
          </div>
        </div>
        <hr className="w-full h-[1px] bg-gray-300 my-4" />

        {/* ---------Table Detail---------- */}
        {selectedTab === "progress" ? (
          <div className="w-full h-full">
            {loading ? (
              <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                <Loader />
              </div>
            ) : (
              <div className="w-full min-h-[10vh] relative ">
                <div className="h-full hidden1 overflow-y-scroll relative">
                  <MaterialReactTable table={table} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <CompletedGoals setShow={setShow} setGoalId={setGoalId} />
        )}

        {/* --------Add Goals-------- */}
        {show && (
          <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
            <HandleGoalModal
              setShow={setShow}
              users={users}
              setGoalId={setGoalId}
              goalId={goalId}
              getGoals={getGoals}
            />
          </div>
        )}
        {/* ------------Graphic View setShowGraph-------- */}
        {showGraph && (
          <div className="absolute top-[0rem] right-0 w-[21rem] sm:w-[50%] h-full z-[999] bg-white flex  flex-col gap-4 py-4  px-4">
            <div className="inputBox">
              <select
                value={selectChart}
                onChange={(e) => setSelectChart(e.target.value)}
                className={`${style.input} w-full `}
              >
                <option value={"Line & Bar"}>Line & Bar</option>
                <option value={"Area Chart"}>Area Chart</option>
              </select>
            </div>
            <ChartData
              setShowGraph={setShowGraph}
              goalsData={filterData ? filterData : goalsData}
              selectChart={selectChart}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
