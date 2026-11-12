import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useSelector } from "react-redux";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { RiEdit2Line } from "react-icons/ri";
import Swal from "sweetalert2";
import UserLabelModal from "../../components/user/UserLabelModal";
import QuickAccess from "../../utlis/QuickAccess";
import { LuDatabase, LuFilter } from "react-icons/lu";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { isAdmin } from "../../utlis/isAdmin";
import OverviewForPages from "../../utlis/overview/OverviewForPages";
import { Link } from "react-router-dom";
import { HiOutlineDotsVertical, HiOutlineUserGroup } from "react-icons/hi";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  columnOrderingOptions,
  headCellHoverSx,
} from "../../utlis/columnOrdering";
import {
  getSavedColumnOrder,
  usePersistedColumnOrder,
} from "../../hooks/usePersistedColumnOrder";
import { FiPlus } from "react-icons/fi";

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
const COLUMN_ORDER_KEY = "users:column_order";
const COLUMN_VISIBILITY_KEY = "users:column_visibility";
const DEPARTMENT_ORDER_KEY = "users:department_order";

// ---------------------------------------------------------------------------
// Columns shown in the "View settings" popover (id must match the column id)
// ---------------------------------------------------------------------------
const COLUMN_OPTIONS = [
  { id: "avatar", label: "Avatar" },
  { id: "name", label: "Employee Name" },
  { id: "username", label: "User Name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone Number" },
  { id: "emergency_contact", label: "E.Contact" },
  { id: "address", label: "Address" },
  { id: "role", label: "Roles" },
  { id: "Team", label: "Team" },
  { id: "isActive", label: "Status" },
  { id: "createdAt", label: "Joining Date" },
  { id: "updatedAt", label: "Last Date" },
  { id: "Durations", label: "Duration" },
  { id: "Data", label: "Department" },
  { id: "actions", label: "Actions" },
];

const getSavedColumnVisibility = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(COLUMN_VISIBILITY_KEY));
    return saved && typeof saved === "object" && !Array.isArray(saved)
      ? saved
      : {};
  } catch {
    return {};
  }
};

// ---------------------------------------------------------------------------
// Draggable department chips (order saved to localStorage by name)
// ---------------------------------------------------------------------------
const readSavedOrder = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSavedOrder = (key, names) => {
  try {
    localStorage.setItem(key, JSON.stringify(names));
  } catch (err) {
    console.log(err);
  }
};

// Saved order first (only names that still exist), then any new ones
const mergeWithSavedOrder = (items, saved) => {
  const existing = new Set(items);
  const ordered = saved.filter((name) => existing.has(name));

  const savedSet = new Set(saved);
  const fresh = items.filter((name) => !savedSet.has(name));

  return [...ordered, ...fresh];
};

const reorderList = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const DraggableDepartmentChips = ({
  departments = [],
  activeDepartment = "",
  onSelect,
  storageKey = DEPARTMENT_ORDER_KEY,
}) => {
  const [savedOrder, setSavedOrder] = useState(() => readSavedOrder(storageKey));

  const names = useMemo(
    () => [...new Set(departments.map((d) => d?.name).filter(Boolean))],
    [departments]
  );

  const orderedNames = useMemo(
    () => mergeWithSavedOrder(names, savedOrder),
    [names, savedOrder]
  );

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const reordered = reorderList(
      orderedNames,
      source.index,
      destination.index
    );

    setSavedOrder(reordered);
    writeSavedOrder(storageKey, reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="user-departments" direction="horizontal">
        {(dropProvided) => (
          <ul
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            className="flex items-center gap-2 list-none"
          >
            {orderedNames.map((name, index) => (
              <Draggable key={name} draggableId={name} index={index}>
                {(dragProvided, snapshot) => (
                  <li
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    onClick={() => onSelect(name)}
                    className={`${
                      activeDepartment === name
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    } px-2 py-1 rounded-md !cursor-pointer m-0 select-none ${
                      snapshot.isDragging ? "shadow-lg" : ""
                    }`}
                  >
                    {name}
                  </li>
                )}
              </Draggable>
            ))}
            {dropProvided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default function Users() {
  const auth = useSelector((state) => state.auth.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const isActive = [true, false];
  const [labelData, setLabelData] = useState([]);
  const [showLabel, setShowLabel] = useState(false);

  const [showDepartmentFilter, setShowDepartmentFilter] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [teamsData, setTeamsData] = useState([]);



  // --- Actions menu ---
const [actionsOpen, setActionsOpen] = useState(false);
const actionsRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (actionsRef.current && !actionsRef.current.contains(e.target)) {
      setActionsOpen(false);
    }
  };
  if (actionsOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [actionsOpen]);





  // Column visibility (saved locally)
  const [showColumnControls, setShowColumnControls] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState(
    getSavedColumnVisibility
  );
  const boxRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        COLUMN_VISIBILITY_KEY,
        JSON.stringify(columnVisibility)
      );
    } catch {}
  }, [columnVisibility]);

  const toggleColumnVisibility = (columnId) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: prev[columnId] === false, // hidden -> visible, otherwise -> hidden
    }));
  };

  const showAllColumns = () => setColumnVisibility({});

  // Close the View settings popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setShowColumnControls(false);
      }
    };

    if (showColumnControls) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnControls]);

  // All Users
  const getAllUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all`
      );
      setUserData(data?.users);

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

  //   Get All Labels
  const getDatalabel = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/user/labels`
      );
      if (data) {
        setLabelData(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDatalabel();

    // eslint-disable-next-line
  }, []);

  // Get All Teams
  const getAllTeams = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/team/get_all`
      );
      if (data) {
        setTeamsData(data.teams);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTeams();

    // eslint-disable-next-line
  }, []);

  //   Update Role
  const handleChange = (e, id) => {
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

  // Update User Team
  const handleUserTeam = async (userId, teamId) => {
    if (!userId) return toast.error("User id is missing!");
    try {
      const { data } = teamId
        ? await axios.put(
            `${process.env.REACT_APP_API_URL}/api/v1/team/add_user/${userId}`,
            { teamId }
          )
        : await axios.put(
            `${process.env.REACT_APP_API_URL}/api/v1/team/remove_user/${userId}`
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
  // addDatalabel
  // -------------------Handle Label---------->
  const handleDataLabel = async (userId, labelId) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/user/label/${userId}`,
        { labelId }
      );
      if (data) {
        getUsers();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const setColumnFromOutsideTable = (colKey, filterVal) => {
    const col = table.getColumn(colKey);
    if (!col) return;

    return col.setFilterValue(filterVal);
  };

  // Department chip click: toggle on/off
  const handleDepartmentSelect = (departmentName) => {
    const newValue = departmentFilter === departmentName ? "" : departmentName;
    setDepartmentFilter(newValue);
    setColumnFromOutsideTable("Data", newValue);
  };

  //   -------------------Table Data------------->

  const columns = useMemo(
    () => [
      {
        id: "avatar",
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
        id: "role",
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
                  <option value={role.name} key={role._id}>
                    {role.name}
                  </option>
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
      //   Team
      {
        id: "Team",
        accessorKey: "team",
        minSize: 120,
        maxSize: 220,
        size: 180,
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
                Team
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {teamsData?.map((team) => (
                  <option value={team.name} key={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const team = row.original.team;

          return (
            <div className="w-full ">
              <select
                className={`${style.input} h-[2.5rem] w-full border border-orange-200`}
                onChange={(e) =>
                  handleUserTeam(row.original?._id, e.target.value)
                }
                value={team?._id || ""}
              >
                <option value="">No Team</option>
                {teamsData?.map((team) => (
                  <option value={team?._id} key={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const teamName = row.original?.team?.name || "";
          return teamName === filterValue;
        },
        filterSelectOptions: teamsData?.map((team) => team.name),
        filterVariant: "select",
      },
      {
        accessorKey: "isActive",
        minSize: 70,
        maxSize: 200,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          // NOTE: the default "Active" filter now lives in the table's
          // initialState (columnFilters), so hiding/showing this column
          // no longer resets the filter.
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
        // String compare: the default filter is boolean `true`, while the
        // dropdown sends "true"/"false" strings.
        filterFn: (row, columnId, filterValue) =>
          String(row.getValue(columnId)) === String(filterValue),
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
            <div className={`w-full flex flex-col gap-[2px] `}>
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
      // Data Label
      {
        id: "Data",
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
                Department
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {labelData?.map((label, i) => (
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
          const jobLabel = row.original.data || {};
          const { name, color, _id } = jobLabel;

          const handleLabelChange = (labelName) => {
            const selectedLabel = labelData.find(
              (label) => label._id === labelName
            );
            if (selectedLabel) {
              handleDataLabel(row.original._id, labelName);
            } else {
              handleDataLabel(row.original._id, "");
            }
            setShow(false);
          };

          return (
            <div className="w-full flex items-start ">
              {show ? (
                <select
                  value={_id || ""}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full h-[2rem] rounded-md border-none outline-none"
                >
                  <option value=".">Select Label</option>
                  {labelData?.map((label, i) => (
                    <option value={label?._id} key={i}>
                      {label?.name}
                    </option>
                  ))}
                </select>
              ) : (
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
              )}
            </div>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const labelName = row.original?.data?.name || "";
          return labelName === filterValue;
        },

        filterVariant: "select",
        filterSelectOptions: labelData.map((label) => label.name),
        size: 150,
        minSize: 100,
        maxSize: 210,
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
    [auth, userData, labelData, teamsData]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");

    setDepartmentFilter("");
  };

 

// ---------------------------------------------------------------------------
// Inside the Users component
// ---------------------------------------------------------------------------

const table = useMaterialReactTable({
  columns,
  data: userData || [],

  enableStickyHeader: true,
  enableStickyFooter: true,
  muiTableContainerProps: { sx: { maxHeight: "900px" } },

  enableColumnActions: false,
  enableColumnFilters: false,
  enableSorting: false,
  enableGlobalFilter: true,
  enableRowNumbers: true,
  enableColumnResizing: true,
  enableTopToolbar: true,
  enableBottomToolbar: true,
  enablePagination: true,

  // ---------- Your custom column ordering ----------
  ...columnOrderingOptions,          // ← enableColumnOrdering + custom drag icon + styles

  initialState: {
    pagination: { pageSize: 20 },
    density: "compact",
    columnFilters: [{ id: "isActive", value: true }],
    // restore saved order (or undefined → MRT uses default order)
    columnOrder: getSavedColumnOrder(COLUMN_ORDER_KEY),
  },

  // column visibility (you already have this)
  state: {
    columnVisibility,
  },
  onColumnVisibilityChange: setColumnVisibility,

  // head cell styles + hover to show drag handle
  muiTableHeadCellProps: {
    style: {
      fontWeight: "600",
      fontSize: "14px",
      backgroundColor: "#E5E7EB",
      color: "#000",
      padding: ".7rem 0.3rem",
    },
    sx: {
      ...headCellHoverSx,               // ← shows the drag handle on hover
      position: "relative",             // needed so the absolute drag handle positions correctly
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
      border: "1px solid rgba(203, 201, 201, 0.5)",
    },
  },

  // Optional safety: hide the big toolbar drop zone (reduces rare crashes)
  positionToolbarDropZone: "none",
});

// Persist the order whenever the user reorders columns
const { resetColumnOrder } = usePersistedColumnOrder(table, COLUMN_ORDER_KEY);

  // ---------------- View settings (column controls) ----------------
  const renderColumnControls = () => (
    <section className="w-[420px] rounded-lg bg-white border border-slate-200 shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b">
        <h3 className="text-sm font-semibold text-slate-800">View settings</h3>
        <button
          type="button"
          onClick={showAllColumns}
          className="text-xs font-medium text-orange-600 hover:underline cursor-pointer"
        >
          Show all
        </button>
      </header>

      {/* Columns */}
      <section className="px-5 py-4">
        <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
          Columns
        </h4>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 list-none m-0 p-0">
          {COLUMN_OPTIONS.map(({ id, label }) => (
            <li key={id} className="list-none m-0">
              <label
                className="flex items-center justify-between rounded-md px-2 py-1.5
                           text-sm text-slate-700 cursor-pointer
                           hover:bg-slate-50 transition"
              >
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={columnVisibility[id] !== false}
                  onChange={() => toggleColumnVisibility(id)}
                  className="h-4 w-4 accent-orange-600"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );

  return (
    <>
     <div className="relative w-full h-full flex flex-col py-4 px-2 sm:px-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            <span className="mt-2">
              <QuickAccess />
            </span>
            {isAdmin(auth) && (
              <span className=" ">
                {" "}
                <OverviewForPages />{" "}
              </span>
            )}

            <span
              className={` p-1 rounded-md hover:shadow-md bg-gray-50 mb-1  cursor-pointer border ${
                showDepartmentFilter && "bg-orange-500 text-white "
              }  `}
              onClick={() => {
                setShowDepartmentFilter(!showDepartmentFilter);
              }}
              title="Filter by Department"
            >
              <LuFilter className="h-6 w-6  cursor-pointer " />
            </span>

            {/* Show / hide columns */}
            <div className="relative" ref={boxRef}>
              <span
                className={` p-1 rounded-md hover:shadow-md bg-gray-50 mb-1 cursor-pointer border inline-flex ${
                  showColumnControls && "bg-orange-500 text-white"
                }`}
                onClick={() => setShowColumnControls((prev) => !prev)}
                title="Show / Hide Columns"
              >
                {showColumnControls ? (
                  <GoEyeClosed className="text-[22px]" />
                ) : (
                  <GoEye className="text-[22px]" />
                )}
              </span>

              {showColumnControls && (
                <div className="absolute top-full left-0 mt-2 z-[99] max-h-[80vh] overflow-y-auto">
                  {renderColumnControls()}
                </div>
              )}
            </div>
          </div>
 
{/* ---------Template Buttons + Actions Menu (Jobs style) */}
<div className="flex items-center gap-2">
  {/* Actions dropdown */}
  <div className="relative" ref={actionsRef}>
    <button
      type="button"
      onClick={() => setActionsOpen((prev) => !prev)}
      className="p-2 transition-all duration-200 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm active:scale-95 flex items-center gap-1"
      title="More actions"
    >
      <HiOutlineDotsVertical className="w-5 h-5" />
    </button>

    {actionsOpen && (
      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-150">
        {/* Section */}
        <div className="p-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Management
          </div>

          <Link
            to="/teams"
            onClick={() => setActionsOpen(false)}
            className="group flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            <HiOutlineUserGroup className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
            <span>Manage Teams</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setShowLabel(true);
              setActionsOpen(false);
            }}
            className="group flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition-colors text-left"
          >
            <LuDatabase className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
            <span>Add Data</span>
          </button>
        </div>
      </div>
    )}
  </div>

  {/* Primary Action Button – same style as Jobs "Add Client" */}
  <button
    onClick={() => setIsOpen(true)}
    className="group relative flex items-center justify-center gap-2 px-4 py-2 text-[14px] font-[500] 
               text-white bg-orange-500 rounded-lg shadow-md shadow-orange-200
               hover:bg-orange-600 hover:shadow-orange-300
               active:transform active:scale-95 transition-all duration-150"
  >
    <FiPlus className="w-4 h-4 transition-transform group-hover:rotate-90" />
    New User
  </button>
</div>




        </div>

        {showDepartmentFilter && (
          <div className="flex items-center gap-4 my-3">
            <DraggableDepartmentChips
              departments={labelData}
              activeDepartment={departmentFilter}
              onSelect={handleDepartmentSelect}
            />
          </div>
        )}

        {/* <hr className="w-full h-[1px] bg-gray-300 my-4" /> */}

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
          <div className="fixed top-[4rem] h-[100%] sm:top-0 left-0 w-full z-[99990] overflow-y-scroll bg-gray-500/70 backdrop-blur-sm flex items-center justify-center py-6 px-4">
            <Register
              userData={userData}
              setIsOpen={setIsOpen}
              getAllUsers={getUsers}
              userId={userId}
              setUserId={setUserId}
            />
          </div>
        )}
      </div>

      {/* ---------------Add Data label------------- */}
      {showLabel && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
          <UserLabelModal
            setShowLabel={setShowLabel}
            getDatalabel={getDatalabel}
          />
        </div>
      )}
    </>
  );
}