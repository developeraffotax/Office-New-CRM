import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import Register from "./Register";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { AiTwotoneDelete } from "react-icons/ai";
import Loader from "../../utlis/Loader";
import { useAuth } from "../../context/authContext";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { RiEdit2Line } from "react-icons/ri";
import Swal from "sweetalert2";

export default function Users() {
  const { auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const isActive = [true, false];

  // All Users
  const getAllUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all`
      );
      setUserData(data?.users);
      console.log("users", data?.users);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();

    //eslint-disable-next-line
  }, []);

  const getUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all`
      );
      setUserData(data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  // Get All Roles
  const getAllRoles = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/roles/fetch/all/roles`
      );
      setUserRoles(data?.roles);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllRoles();

    //eslint-disable-next-line
  }, []);

  //   Update Role
  const handleChange = (e, id) => {
    console.log("ROle", e.target.value, id);
    UpdateRole(e.target.value, id);
  };

  // Update User Role
  const UpdateRole = async (role, userId) => {
    if (!userId) return toast.error("User id  is missing!");
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/user/update_role/${userId}`,
        { role: role }
      );
      if (data?.success) {
        getUsers();
        toast.success(data?.message, { duration: 2000 });
      } else {
        toast.error(data?.message, { duration: 2000 });
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
    }
  };

  //   Update Status
  const handleStatusConfirmation = (userId, state) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${state === true ? "activate" : "blocked"} it!`,
    }).then((result) => {
      if (result.isConfirmed) {
        updateUserRole(userId, state);
        Swal.fire("Status!", "User status has been updated.", "success");
      }
    });
  };

  const updateUserRole = async (id, state) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/user/update/Profile/${id}`,
        { isActive: state }
      );
      if (data) {
        getUsers();
        toast.success("Role Updated", { duration: 2000 });
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  // Update Join Date
  const updateJoinDate = async (id, createdAt) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/user/update/Profile/${id}`,
        { createdAt: createdAt }
      );
      if (data) {
        getUsers();
        toast.success("Join date updated!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  // ---------Handle Delete Task-------------

  const handleDeleteConfirmation = (userId) => {
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
        handleDeleteUser(userId);
        Swal.fire("Deleted!", "User has been deleted.", "success");
      }
    });
  };

  const handleDeleteUser = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/user/delete_user/${id}`
      );
      if (data) {
        getUsers();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // -----------Handle Custom date filter------
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  //   -------------------Table Data------------->

  const columns = useMemo(
    () => [
      {
        accessorKey: "jobHolder",
        header: "Job Holder",
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
                Avatar
              </span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const avatar = row.original.avatar;
          console.log(row.original);

          return (
            <div className="w-full h-[2.4rem] flex items-center justify-center ">
              <div className="w-[2.4rem] h-[2.4rem] relative rounded-full overflow-hidden object-fill">
                <img
                  src={avatar ? avatar : "/profile1.jpeg"}
                  alt="avater"
                  className="w-full h-full object-fill rounded-full border border-orange-600"
                />
              </div>
            </div>
          );
        },
        filterFn: "equals",

        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 130,
        grow: false,
      },
      {
        accessorKey: "name",
        size: 140,
        minSize: 80,
        maxSize: 180,
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
                Employee Name
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const name = row.original.name;

          return (
            <div className="w-full">
              <div className="w-full cursor-pointer">
                <span>{name}</span>
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
        accessorKey: "username",
        minSize: 100,
        maxSize: 200,
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
                User Name
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const username = row.original.username;

          return (
            <div className="w-full px-1">
              <div className="cursor-pointer w-full">
                <span className="font-medium">{username}</span>
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
        accessorKey: "email",
        minSize: 100,
        maxSize: 200,
        size: 190,
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
                Email
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const email = row.original.email;

          return (
            <div className="w-full px-1">
              <div className="cursor-pointer w-full">
                <span className="font-medium">{email}</span>
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
        accessorKey: "phone",
        minSize: 100,
        maxSize: 200,
        size: 120,
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
                Phone Number
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const phone = row.original.phone;

          return (
            <div className="w-full px-1">
              <div className="cursor-pointer w-full">
                <span className="font-medium">{phone}</span>
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
        accessorKey: "emergency_contact",
        minSize: 100,
        maxSize: 200,
        size: 120,
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
                E.Contact
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const emergency_contact = row.original.emergency_contact;

          return (
            <div className="w-full px-1">
              <div className="cursor-pointer w-full">
                <span className="font-medium">{emergency_contact}</span>
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
        accessorKey: "address",
        minSize: 100,
        maxSize: 400,
        size: 300,
        grow: true,
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
                Address
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const address = row.original.address;

          return (
            <div className="w-full px-1">
              <div className="cursor-pointer w-full" title={address}>
                <span className="font-medium">{address}</span>
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
      //   Role
      {
        accessorKey: "role.name",
        minSize: 120,
        maxSize: 250,
        size: 220,
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
                Roles
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {userRoles.map((role) => (
                  <option value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const role = row.original.role;

          return (
            <div className="w-full ">
              <select
                className={`${style.input} h-[2.5rem] w-full border border-orange-200`}
                onChange={(e) => handleChange(e, row.original?._id)}
                value={role?._id || ""}
              >
                {userRoles?.map((role, i) => (
                  <option value={role?._id} className="capitalize" key={i}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          return (cellValue || "").toString() === filterValue.toString();
        },
        filterSelectOptions: userRoles?.map((role) => role.name),
        filterVariant: "select",
      },
      {
        accessorKey: "isActive",
        minSize: 70,
        maxSize: 200,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          useEffect(() => {
            column.setFilterValue(true);

            // eslint-disable-next-line
          }, []);
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
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                <option value={true}>Active</option>
                <option value={false}>Blocked</option>
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const status = row.original.isActive;

          const updateStatus = (userId, state) => {
            handleStatusConfirmation(userId, state);
          };

          return (
            <div className="w-full items-center justify-center px-1">
              <div className="cursor-pointer w-full">
                {status === true ? (
                  <button
                    className={`${style.btn} bg-green-500 hover:bg-green-600`}
                    style={{ background: "green" }}
                    onClick={() => updateStatus(row.original?._id, false)}
                  >
                    Active
                  </button>
                ) : (
                  <button
                    className={`${style.btn} bg-red-500 hover:bg-red-600`}
                    style={{ background: "red" }}
                    onClick={() => updateStatus(row.original?._id, true)}
                  >
                    Blocked
                  </button>
                )}
              </div>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: isActive?.map((active) => active),
        filterVariant: "select",
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
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Joining Date
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
          const createdAt = row.original.createdAt;
          const [date, setDate] = useState(() => {
            const cellDate = new Date(
              cell.getValue() || "2024-09-20T12:43:36.002+00:00"
            );
            return cellDate.toISOString().split("T")[0];
          });

          const [showStartDate, setShowStartDate] = useState(false);

          const handleDateChange = (newDate) => {
            setDate(newDate);
            updateJoinDate(row.original._id, newDate);
            setShowStartDate(false);
          };

          return (
            <div className="w-full flex  ">
              {!showStartDate ? (
                <p
                  onDoubleClick={() => setShowStartDate(true)}
                  className="w-full"
                >
                  {createdAt ? (
                    format(new Date(createdAt), "dd-MMM-yyyy")
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
            // Handle Year-Month format
            const [year, month] = filterValue.split("-");
            const cellYear = cellDate.getFullYear().toString();
            const cellMonth = (cellDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            return year === cellYear && month === cellMonth;
          }

          // Other filter cases
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          switch (filterValue) {
            case "Today":
              return cellDate.toDateString() === today.toDateString();

            case "Tomorrow":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              return cellDate.toDateString() === tomorrow.toDateString();

            case "Last 7 days":
              const in7Days = new Date(today);
              in7Days.setDate(today.getDate() - 7);
              return cellDate >= in7Days && cellDate < today;

            case "Last 15 days":
              const in15Days = new Date(today);
              in15Days.setDate(today.getDate() - 15);
              return cellDate >= in15Days && cellDate < today;

            case "Last 30 Days":
              const in30Days = new Date(today);
              in30Days.setDate(today.getDate() - 30);
              return cellDate >= in30Days && cellDate < today;

            case "Last 60 Days":
              const in60Days = new Date(today);
              in60Days.setDate(today.getDate() - 60);
              return cellDate >= in60Days && cellDate < today;

            case "Last 12 months":
              const lastYear = new Date(today);
              lastYear.setFullYear(today.getFullYear() - 1);
              return cellDate >= lastYear && cellDate < today;

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
          "Last 60 Days",
          "Last 12 months",
          "Custom date",
        ],

        filterVariant: "custom",
        size: 120,
        minSize: 90,
        maxSize: 110,
        grow: false,
      },

      {
        accessorKey: "updatedAt",
        Header: ({ column }) => {
          return (
            <div className="w-full flex flex-col gap-[2px]">
              <span className="cursor-pointer ">Last Date</span>
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const updatedAt = row.original.updatedAt;
          const [date, setDate] = useState(() => {
            const cellDate = new Date(
              cell.getValue() || "2024-09-20T12:43:36.002+00:00"
            );
            return cellDate.toISOString().split("T")[0];
          });

          const [showStartDate, setShowStartDate] = useState(false);

          const handleDateChange = async (updateDate) => {
            setDate(updateDate);

            try {
              const { data } = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/v1/user/update/Profile/${row.original._id}`,
                { updatedAt: updateDate }
              );
              if (data) {
                getUsers();
                toast.success("Resignation date updated!");
              }
            } catch (error) {
              console.log(error);
              toast.error("Something went wrong!");
            }

            setShowStartDate(false);
          };

          return (
            <div
              className={`w-full   ${
                row.original.isActive === false ? "flex" : "hidden"
              }  `}
            >
              {!showStartDate ? (
                <p
                  onDoubleClick={() => setShowStartDate(true)}
                  className="w-full"
                >
                  {updatedAt ? (
                    format(new Date(updatedAt), "dd-MMM-yyyy")
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

        filterVariant: "custom",
        size: 120,
        minSize: 90,
        maxSize: 110,
        grow: false,
      },

      // Duration
      {
        accessorKey: "Durations",
        Header: ({ column }) => {
          return (
            <div className="w-full flex flex-col gap-[2px]">
              <span
                className="cursor-pointer"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Duration
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                placeholder="Search durations..."
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const status = row.original.isActive;
          const createdAt = new Date(row.original.createdAt);
          const lastUpdate = new Date(row.original.updatedAt);
          const today = new Date();

          const calculateDuration = (startDate, endDate) => {
            const diffInMs = endDate - startDate;
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

            if (diffInDays < 30) return `${Math.round(diffInDays)} days`;
            if (diffInDays < 365) {
              const months = (diffInDays / 30).toFixed(1);
              return `${months} months`;
            }
            const years = (diffInDays / 365).toFixed(1);
            return `${years} years`;
          };

          const endDate = status ? today : lastUpdate;
          const duration = calculateDuration(createdAt, endDate);

          return (
            <div className="w-full flex">
              <p className="w-full font-medium">
                {duration ? (
                  `${duration}`
                ) : (
                  <span className="text-white">.</span>
                )}
              </p>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const createdAt = new Date(row.original.createdAt);
          const today = new Date();

          if (!createdAt || !today || !filterValue) return false;

          const calculateDuration = (startDate, endDate) => {
            const diffInMs = endDate - startDate;
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

            if (diffInDays < 30) return `${Math.round(diffInDays)} days`;
            if (diffInDays < 365) {
              const months = (diffInDays / 30).toFixed(1);
              return `${months} months`;
            }
            const years = (diffInDays / 365).toFixed(1);
            return `${years} years`;
          };

          const duration = calculateDuration(createdAt, today);
          // Check if filterValue matches any difference as a substring
          const match = duration.toString().includes(filterValue);

          return match;
        },
        size: 100,
        minSize: 90,
        maxSize: 110,
        grow: false,
      },

      // <-----Action------>
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          return (
            <div className="flex items-center justify-center gap-4 w-full h-full">
              <span
                className=""
                title="Edit User"
                onClick={() => {
                  setUserId(row.original?._id);
                  setIsOpen(true);
                }}
              >
                <RiEdit2Line className="h-5 w-5 cursor-pointer text-sky-500 hover:text-sky-600" />
              </span>
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => handleDeleteConfirmation(row.original?._id)}
                title="Delete User!"
              >
                <AiTwotoneDelete className="h-5 w-5 text-pink-500 hover:text-pink-600 " />
              </span>
            </div>
          );
        },
        size: 90,
      },
    ],
    // eslint-disable-next-line
    [auth, userData]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
  };

  const table = useMaterialReactTable({
    columns,
    data: userData || [],
    enableStickyHeader: true,
    enableStickyFooter: true,
    muiTableContainerProps: { sx: { maxHeight: "800px" } },
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
        border: "1px solid rgb(193, 183, 173, 0.8)",
        caption: {
          captionSide: "top",
        },
      },
    },
  });

  return (
    <Layout>
      <div className=" relative w-full h-[100%] py-4 px-2 sm:px-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              User's
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
              className={`${style.button1} text-[15px] `}
              onClick={() => setIsOpen(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New User
            </button>
          </div>
        </div>
        <hr className="w-full h-[1px] bg-gray-300 my-4" />

        {/* ---------Table Detail---------- */}
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

        {/* ------Add/Update User--- */}
        {isOpen && (
          <div className="fixed top-[4rem] h-[100%] sm:top-0 left-0 w-full z-[99990] overflow-y-scroll bg-gray-100/70 flex items-center justify-center py-6 px-4">
            <Register
              setIsOpen={setIsOpen}
              getAllUsers={getUsers}
              userId={userId}
              setUserId={setUserId}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
