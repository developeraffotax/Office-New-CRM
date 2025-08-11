import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
 
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import { MdOutlineRemoveCircle } from "react-icons/md";
import DraggableUserList from "../../utlis/DraggableUserList";
import { useSelector } from "react-redux";

export default function CompletedGoals({
  fetchGoals,
  setShow,
  setGoalId,
  setCompleteGoalsData,
  showJobHolderFilter
}) {
 
     const auth = useSelector((state => state.auth.auth));
  const [users, setUsers] = useState([]);
  const [goalsData, setGoalsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState([]);
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
    "Proposal Lead",
    "Proposal Client",
    "Total Lead",
    "Lead Won",
    "Lead Won Manual",
    "Affotax Clicks",
    "Affotax Impressions",
    "Job Prepared",
    "Job Review",
    "Job Filed",
    "Chargeable Time %",
    "Manual Goal",
  ];

  // -------Get All Goals-------
  const getAllGoals = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/fetch/complete/goals`
      );
      if (data) {
        if (auth.user.role.name === "Admin") {
          setGoalsData(data.goals);
        } else {
          const filteredGoals = data.goals.filter((goal) =>
            goal.usersList.some((user) => user._id === auth?.user?.id)
          );
          setGoalsData(filteredGoals);
        }
        // setGoalsData(data.goals);
        setCompleteGoalsData(data.goals);
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
        `${process.env.REACT_APP_API_URL}/api/v1/goals/fetch/complete/goals`
      );
      if (data) {
        // setGoalsData(data.goals);
        if (auth.user.role.name === "Admin") {
          setGoalsData(data.goals);
        } else {
          const filteredGoals = data.goals.filter((goal) =>
            goal.usersList.some((user) => user._id === auth?.user?.id)
          );
          setGoalsData(filteredGoals);
        }
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
      confirmButtonText: "Yes, reverse it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleCompleteGoal(goalId);
        Swal.fire("Progress!", "Goal status updated successfully.", "success");
      }
    });
  };

  const handleCompleteGoal = async (id) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/upadate/goals/status/${id}`,
        { status: "Progress" }
      );
      if (data) {
        getGoals();
        fetchGoals();
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

  const columns = useMemo(
    () => [
      {
        accessorKey: "jobHolder._id",
        id: "jobHolderId",
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
                  <option key={i} value={jobhold?.name}>
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
        // filterFn: "equals",
        // filterSelectOptions: users.map((jobhold) => jobhold._id),
        // filterVariant: "select",
        filterFn: (row, columnId, filterValue) => {

          const jobHolderName = row.original.jobHolder.name || "";
          return jobHolderName === filterValue;
        },
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
            case "Yesterday":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() - 1);
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
          "Today",
          "Yesterday",
          "Last 7 days",
          "Last 15 days",
          "Last 30 Days",
          "Last 60 Days",
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
            case "Yesterday":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() - 1);
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
          "Today",
          "Yesterday",
          "Last 7 days",
          "Last 15 days",
          "Last 30 Days",
          "Last 60 Days",
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
        size: 110,
        minSize: 80,
        maxSize: 130,
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
      //
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          return (
            <div className="flex items-center justify-center gap-3 w-full h-full">
              <span
                className=""
                title="Reverte Goal"
                onClick={() => {
                  handleupdateConfirmation(row.original._id);
                }}
              >
                <MdOutlineRemoveCircle className="h-6 w-6 cursor-pointer text-purple-500 hover:text-purple-600" />
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
        size: 100,
      },
      // Progress
      {
        accessorKey: "progress",
        minSize: 100,
        maxSize: 600,
        size: 450,
        grow: true,
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
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                <option value="20">0-20%</option>
                <option value="40">21-40%</option>
                <option value="60">41-60%</option>
                <option value="80">61-80%</option>
                <option value="100">81-100%</option>
                <option value="greater">Greater than 100%</option>
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const achievement = parseFloat(row.original.achievement) || 0;
          const initialAchievedCount =
            parseFloat(row.original.achievedCount) || 0;

          const [currentProgress, setCurrentProgress] = useState(0);

          const calculateProgress = () =>
            achievement > 0
              ? ((currentProgress / achievement) * 100).toFixed(2)
              : 0;

          const progressValue = calculateProgress();

          useEffect(() => {
            const interval = setInterval(() => {
              setCurrentProgress((prev) => {
                if (prev >= initialAchievedCount) {
                  clearInterval(interval);
                  return initialAchievedCount;
                }
                return prev + Math.max(initialAchievedCount / 20, 1);
              });
            }, 100);

            return () => clearInterval(interval);
          }, [initialAchievedCount]);

          return (
            <div className="w-full flex items-center justify-start h-[2.5rem] bg-gray-300 rounded-md overflow-hidden">
              <div className="bg-white border rounded-md p-1 shadow-md drop-shadow-md w-full h-full">
                <div
                  style={{
                    width: `${progressValue > 100 ? 100 : progressValue}%`,
                    background:
                      progressValue >= 100
                        ? "linear-gradient(90deg, #00E396, #00C853)"
                        : "linear-gradient(90deg, #FF4560, #FF8A65)",
                    transition: "width 0.4s ease-in-out",
                  }}
                  className={`h-full flex items-center justify-center ${
                    progressValue < 15 ? "text-black" : "text-white"
                  } font-semibold rounded-md shadow-md`}
                >
                  <span className="px-2 text-xs">{progressValue}%</span>
                </div>
              </div>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const achievement = parseFloat(row.original.achievement) || 0;
          const initialAchievedCount =
            parseFloat(row.original.achievedCount) || 0;

          const progressValue =
            achievement > 0 ? (initialAchievedCount / achievement) * 100 : 0;

          const ranges = {
            20: [0, 20],
            40: [21, 40],
            60: [41, 60],
            80: [61, 80],
            100: [81, 100],
          };

          if (filterValue === "greater") {
            return progressValue > 100;
          }

          const range = ranges[filterValue];
          if (!range) return true;

          const [min, max] = range;
          return progressValue >= min && progressValue <= max;
        },
        enableColumnFilter: true,
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

    setCompleteGoalsData(filteredRows);
  }, [table.getFilteredRowModel().rows]);


 


  return (
    <div className=" relative w-full h-[100%] overflow-y-auto ">
      {/* ---------Table Detail---------- */}
      <div className="w-full h-full">
        {loading ? (
          <div className="flex items-center justify-center w-full h-screen px-4 py-2">
            <Loader />
          </div>
        ) : (
          <div className="w-full min-h-[10vh] relative ">
             <div className="w-full  ">
                        {auth?.user?.role?.name === "Admin" && showJobHolderFilter && <DraggableUserList table={table} usersArray={users.map(el => el.name)} updateJobHolderCountMapFn={(map, totalCount) => {
                      
                                        for (const item of goalsData || []) {
                                            const holder = item.jobHolder.name ;
                                            map.set(holder, (map.get(holder) || 0) + 1);
                                            totalCount++;
                                          }
                      
                                          map.set("All", totalCount);
                                      
                                    } } listName={'goals'} filterColName="jobHolderId"  />}
            
                       </div>
                       <hr className="w-full h-[1px] bg-gray-300 my-2" />
            <div className="h-full hidden1 overflow-y-auto relative  ">
              <MaterialReactTable table={table} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
