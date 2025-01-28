"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import MainLayout from "@/app/components/layout/MainLayout";
import { IoSearch } from "react-icons/io5";
import { IoAddOutline } from "react-icons/io5";
import { AiFillDelete } from "react-icons/ai";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { CiCircleChevLeft } from "react-icons/ci";
import { CiCircleChevRight } from "react-icons/ci";
import { IoCloseCircle } from "react-icons/io5";
import Loader from "@/app/utils/Loader";
import Image from "next/image";
import { BsFillChatDotsFill } from "react-icons/bs";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import UserModal from "@/app/components/users/UserModal";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const types = [
  "End User",
  "Dealer",
  "Builder",
  "Owners",
  "Designers",
  "Constructors",
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [active, setActive] = useState("All");
  const [rowSelection, setRowSelection] = useState({});
  const initialLoad = useRef(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [userId, setUserId] = useState("");
  const [isUser, setIsUser] = useState(false);

  console.log("rowSelection:", rowSelection);

  // Get All Users
  const fetchUsers = async () => {
    if (initialLoad.current) {
      setLoading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/all`
      );

      if (data) {
        setUsers(data.users);
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (initialLoad.current) {
        setLoading(false);
        initialLoad.current = false;
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilterUsers(users);
  }, [users]);

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
    filterData(value, active);
  };

  // -------------Handle filtering by tabs and search---------------
  const filterData = (search = searchValue, statusFilter = active) => {
    let filtered = users;

    if (statusFilter === "All" && !search) {
      setFilterUsers(users);
      return;
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((user) => user.category === statusFilter);
    }

    if (search) {
      const lowercasedSearch = search.toLowerCase();

      filtered = filtered.filter((user) => {
        const { name = "", email = "", category = "", experience = "" } = user;

        return (
          name.toLowerCase().includes(lowercasedSearch) ||
          email.toLowerCase().includes(lowercasedSearch) ||
          category.toLowerCase().includes(lowercasedSearch) ||
          experience.toLowerCase().includes(lowercasedSearch)
        );
      });
    }

    setFilterUsers(filtered);
  };

  const handleTabClick = (tab) => {
    setActive(tab);
    filterData(searchValue, tab);
  };

  // ----------------Pegination----------->
  const totalPages = Math.ceil(filterUser.length / itemsPerPage);

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Get the current page data
  const paginatedData = filterUser.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update Status/Role
  const updateUser = async (id, status, role) => {
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/update/profile/${id}`,
        {
          role,
          user_Status: status,
        }
      );
      if (data) {
        setFilterUsers((prev) =>
          prev.map((item) => (item._id === id ? data : item))
        );
        fetchUsers();
        toast.success("User updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  // Handle Delete User
  const handleDeleteConfirmation = (id) => {
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
        handleDeleteUser(id);
      }
    });
  };

  const handleDeleteUser = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/deleteUser/${id}`
      );
      if (data) {
        setFilterUsers(filterUsers.filter((user) => user._id !== id));
        toast.success("User deleted successfully!");
        fetchUsers();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  // Delete All Users

  const handleDeleteAllConfirmation = () => {
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
        handleDeleteAllUsers();
      }
    });
  };

  const handleDeleteAllUsers = async () => {
    if (!rowSelection) {
      return toast.error("Please select at least one user to delete.");
    }

    const userIdsArray = Object.keys(rowSelection);

    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/deleteAllUsers`,
        { userIds: userIdsArray }
      );
      if (data) {
        toast.success("All users deleted successfully!");
        fetchUsers();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        minSize: 50,
        maxSize: 220,
        size: 150,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">Name</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const avatar = row.original?.profileImage;

          return (
            <div className="cursor-pointer text-[12px] text-black w-full h-full flex items-center gap-1">
              <div className=" w-[2rem] h-[2rem] relative rounded-full bg-sky-600 overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <Image
                    src={avatar ? avatar : "/profile.png"}
                    layout="fill"
                    alt={"Avatar"}
                    className="w-full h-full"
                  />
                ) : (
                  <h3 className="text-[18px] font-medium text-white uppercase">
                    {row.original?.name?.slice(0, 1)}
                  </h3>
                )}
              </div>
              <span className="text-[13px] text-black font-medium">
                {row.original?.name}
              </span>
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
        accessorKey: "category",
        minSize: 80,
        maxSize: 150,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">Category</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const category = row.original?.category;

          return (
            <div className="flex items-center justify-start cursor-pointer text-[13px] text-black w-full h-full">
              {category}
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
        accessorKey: "email",
        minSize: 100,
        maxSize: 520,
        size: 220,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">Email</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const email = row.original?.email;

          return (
            <div className="flex items-center justify-start cursor-pointer text-[13px] text-black w-full h-full">
              {email}
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
        accessorKey: "projects",
        minSize: 60,
        maxSize: 100,
        size: 80,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">Projects</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const projects = row.original?.projects;

          return (
            <div className="flex items-center justify-start cursor-pointer text-[13px] text-black w-full h-full">
              {projects}
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
        accessorKey: "experience",
        minSize: 60,
        maxSize: 100,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">Experience</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const experience = row.original?.experience;

          return (
            <div className="flex items-center justify-start cursor-pointer text-[13px] text-black w-full h-full">
              {experience}
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
        accessorKey: "ratings",
        minSize: 60,
        maxSize: 100,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">ratings</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const ratings = row.original?.ratings;

          return (
            <div className="flex items-center justify-start cursor-pointer text-[13px] text-black w-full h-full">
              {ratings}
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
        accessorKey: "user_Status",
        minSize: 80,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">STATUS</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const status = row.original.user_Status;
          const [userStatus, setUserStatus] = useState(status);
          const [show, setShow] = useState(false);

          const handleUpdate = async (value) => {
            setUserStatus(value);
            updateUser(row.original._id, value, "");
          };

          return (
            <div className="w-full h-full">
              {!show ? (
                <div
                  onDoubleClick={() => setShow(true)}
                  className="flex items-center justify-start cursor-pointer text-[12px] text-black w-full h-full"
                >
                  <button
                    className={` py-[.35rem] px-4 rounded-[2rem] capitalize  ${
                      status === "complete"
                        ? " bg-green-200 hover:bg-green-300 text-green-900"
                        : status === "pending"
                        ? " bg-gray-200 hover:bg-gray-300 text-gray-900"
                        : " bg-red-200 hover:bg-red-300 text-red-900"
                    }  hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]`}
                  >
                    {status}
                  </button>
                </div>
              ) : (
                <select
                  value={userStatus}
                  onChange={(e) => handleUpdate(e.target.value)}
                  onBlur={() => setShow(false)}
                  className="w-full border rounded-md p-1 text-black text-[14px]"
                >
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                  <option value="cancel">Cancel</option>
                </select>
              )}
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
        accessorKey: "role",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">Role</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const role = cell.getValue();
          const [userRole, setUserRole] = useState(role);
          const [show, setShow] = useState(false);

          const handleUpdate = async (value) => {
            setUserRole(value);
            updateUser(row.original._id, "", value);
          };

          return (
            <div className="w-full h-full">
              {!show ? (
                <div
                  onDoubleClick={() => setShow(true)}
                  className="flex items-center justify-start cursor-pointer text-[12px] text-black w-full h-full"
                >
                  {role === "admin" ? (
                    <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-sky-600 bg-sky-200 hover:bg-sky-300 text-sky-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                      Admin
                    </button>
                  ) : (
                    <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-green-600 bg-green-200 hover:bg-green-300 text-green-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                      User
                    </button>
                  )}
                </div>
              ) : (
                <select
                  value={userRole}
                  onChange={(e) => handleUpdate(e.target.value)}
                  onBlur={() => setShow(false)}
                  className="w-full border rounded-md p-1 text-black text-[14px]"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              )}
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
        accessorKey: "status",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">Role</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const status = cell.getValue();
          const [userRole, setUserRole] = useState(status);
          const [show, setShow] = useState(false);

          const handleUpdate = async (value) => {
            setUserRole(value);
            try {
              const { data } = await axios.put(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/update/profile/${row.original._id}`,
                {
                  status: value,
                }
              );
              if (data) {
                setFilterUsers((prev) =>
                  prev.map((item) =>
                    item._id === row.original._id ? data : item
                  )
                );
                fetchUsers();
                toast.success("Status updated");
              }
            } catch (error) {
              console.log("Error update status");
            } finally {
              setShow(false);
            }
          };

          return (
            <div className="w-full h-full">
              {!show ? (
                <div
                  onDoubleClick={() => setShow(true)}
                  className="flex items-center justify-start cursor-pointer text-[12px] text-black w-full h-full"
                >
                  {status === true ? (
                    <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-green-600 bg-green-200 hover:bg-green-300 text-green-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                      Active
                    </button>
                  ) : (
                    <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-red-600 bg-red-200 hover:bg-red-300 text-red-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                      Blocked
                    </button>
                  )}
                </div>
              ) : (
                <select
                  value={userRole}
                  onChange={(e) => handleUpdate(e.target.value)}
                  onBlur={() => setShow(false)}
                  className="w-full border rounded-md p-1 text-black text-[14px]"
                >
                  <option value="true">Active</option>
                  <option value="false">Blocked</option>
                </select>
              )}
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
        accessorKey: "Actions",
        minSize: 100,
        maxSize: 140,
        size: 130,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">ACTIONS</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const status = row.original.status;
          const [userStatus, setUserStatus] = useState(status);

          const handleUpdate = async (value) => {
            setUserStatus(value);
            alert(value);
            try {
              const { data } = await axios.put(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/update/role/${row.original._id}`,
                { status: value }
              );
              if (data) {
                fetchUsers();
              }
            } catch (error) {
              console.log(error);
              toast.error(error.response?.data?.message);
            }
          };
          return (
            <div className="flex items-center justify-center gap-2 cursor-pointer text-[12px] text-black w-full h-full">
              <span className="p-1 bg-[#442622]   rounded-full transition-all duration-300 hover:scale-[1.05]">
                <BsFillChatDotsFill className="text-[16px] text-white" />
              </span>

              <span
                onClick={() => {
                  setIsUser(true);
                  setUserId(row.original._id);
                }}
                className="p-1 bg-sky-500 hover:bg-sky-600 rounded-full transition-all duration-300 hover:scale-[1.03]"
              >
                <MdModeEditOutline className="text-[16px] text-white" />
              </span>
              {/* <span
                onClick={() => handleUpdate(!status)}
                className={`p-1  ${
                  userStatus
                    ? "bg-sky-200 hover:bg-sky-300"
                    : "bg-green-200 hover:bg-green-300"
                }  rounded-full transition-all duration-300 hover:scale-[1.03] cursor-pointer`}
              >
                {userStatus ? (
                  <MdNotInterested className="text-[16px] text-sky-500 hover:text-sky-600" />
                ) : (
                  <FaCheckDouble className="text-[14px] text-green-600 hover:text-green-700" />
                )}
              </span> */}
              <span
                onClick={() => handleDeleteConfirmation(row.original._id)}
                className="p-1 bg-red-200 hover:bg-red-300   rounded-full transition-all duration-300 hover:scale-[1.03]"
              >
                <MdDelete className="text-[16px] text-red-500 hover:text-red-600" />
              </span>
            </div>
          );
        },
      },
    ],
    [users]
  );

  const table = useMaterialReactTable({
    columns,
    data: paginatedData,
    getRowId: (row) => row._id,
    enableStickyHeader: true,
    enableStickyFooter: false,
    columnFilterDisplayMode: "popover",
    muiTableContainerProps: {
      sx: (theme) => ({
        minHeight: {
          xs: "330px",
          sm: "350px",
          md: "330px",
          lg: "400px",
          xl: "500px",
        },
        maxHeight: {
          xs: "350px",
          sm: "380px",
          md: "400px",
          lg: "500px",
          xl: "800px",
        },
      }),
    },

    enableColumnActions: false,
    enableColumnFilters: true,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: false,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    // enableEditing: true,
    // state: { isLoading: isLoading },

    enablePagination: false,
    initialState: {
      pagination: { pageSize: 20 },
      pageSize: 20,
      density: "compact",
    },

    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "12px",
        backgroundColor: "#442622",
        color: "#fff",
        padding: ".7rem 0.3rem",
      },
      // Override the icons (sorting, filtering) color to white
      sx: {
        "& .MuiTableSortLabel-icon": {
          color: "#fff",
        },
        "& .MuiSvgIcon-root": {
          color: "#fff",
        },
      },
    },

    muiTableColumnFilterProps: {
      style: {
        color: "#fff",
        backgroundColor: "#442622",
        border: "1px solid #fff",
      },
    },
  });

  return (
    <MainLayout title="Users - Sync AI">
      <div className="w-full h-[100%] rounded-md flex flex-col gap-4 py-3 px-2 sm:px-4 bg-[#fff] overflow-hidden">
        <div className="flex items-start sm:items-end justify-between flex-col md:flex-row gap-4 ">
          <div className="flex items-center gap-4 md:gap-[5rem]">
            <h1 className=" text-lg sm:text-2xl 3xl:text-3xl font-semibold text-texth1 uppercase">
              Users
            </h1>
            <div className="relative w-[13rem] sm:w-[15rem] rounded-lg h-[2.2rem] sm:h-[2.4rem] bg-gray-100 ">
              <span className="absolute right-2 top-[5px] z-30 text-gray-400 hover:text-customBrown p-1 hover:bg-gray-200 rounded-lg ">
                <IoSearch className="h-5 w-5 cursor-pointer" />
              </span>
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-full border-none bg-transparent active:outline outline-customBrown rounded-lg pl-2 pr-5 text-[14px]"
              />
            </div>
          </div>
          {/* Pegination */}
          <div className="w-full md:w-fit flex items-center justify-end  ">
            <div className="flex items-center gap-3 justify-end sm:justify-normal w-full sm:w-fit">
              <span>
                {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <CiCircleChevLeft
                  onClick={() => handlePageChange("prev")}
                  className={`text-[27px] text-red-500 hover:text-red-600 ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                />
                <CiCircleChevRight
                  onClick={() => handlePageChange("next")}
                  className={`text-[27px] text-red-500 hover:text-red-600 ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                />
              </div>
              <span>
                <IoCloseCircle
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  size={25}
                  className={` text-red-500 hover:text-red-600 transition-all duration-300 ${
                    currentPage === 1 ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                />
              </span>
            </div>
          </div>
        </div>
        {/* Type of users */}
        <div className="w-full flex items-start justify-between flex-col md:flex-row gap-4">
          <div className="w-full overflow-x-auto py-1 px-1 sm:px-0 sm:py-0 shidden">
            <div className=" relative flex items-center gap-3 sm:gap-4 w-full overflow-x-auto shidden ">
              {/* All Users Button */}
              <button
                className={`min-w-[6.5rem] sm:w-[7.5rem] h-[2.1rem] sm:h-[2.3rem] text-[13px] 2xl:text-[15px] rounded-lg transition-all duration-300 ease-in-out ${
                  active === "All"
                    ? "bg-customBrown text-white"
                    : "bg-gray-50 text-customBrown border-2 border-customBrown hover:bg-gray-100"
                }`}
                onClick={() => handleTabClick("All")}
              >
                All Users
              </button>

              {/* Dynamic User Types Buttons */}
              {types?.map((type, index) => (
                <button
                  key={index}
                  className={`min-w-[6.5rem] sm:w-[7.5rem] h-[2.1rem] sm:h-[2.3rem] text-[14px] 2xl:text-[16px] rounded-lg transition-all duration-300 ease-in-out ${
                    active === type
                      ? "bg-customBrown text-white"
                      : "bg-gray-50 text-customBrown border-2 border-customBrown hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabClick(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {/*  */}
          <div className="flex items-center w-full md:w-fit justify-end gap-5 ">
            <span
              disabled={Object.keys(rowSelection).length === 0}
              onClick={() => handleDeleteAllConfirmation()}
            >
              <AiFillDelete
                className={`h-5 w-5 cursor-pointer transition-all duration-300 ease-in-out ${
                  Object.keys(rowSelection).length > 0
                    ? "text-red-500 hover:text-red-600"
                    : "text-customBrown cursor-not-allowed"
                }`}
              />
            </span>
            <button
              onClick={() => setIsUser(true)}
              className={`w-[6.5rem] sm:w-[7.5rem] flex items-center justify-center h-[2.1rem] sm:h-[2.3rem] text-[14px] 2xl:text-[16px] rounded-lg transition-all duration-300 ease-in-out bg-customBrown text-white gap-1 `}
            >
              <IoAddOutline className="h-4 w-4" /> Add New
            </button>
          </div>
        </div>
        <div className=" flex overflow-x-auto w-full h-[90%] overflow-y-auto mt-3 pb-4 ">
          {loading ? (
            <div className="flex items-center justify-center w-full h-screen px-4 py-4">
              <Loader />
            </div>
          ) : (
            <div className="w-full min-h-[20vh] relative">
              <div className="h-full overflow-y-scroll shidden relative">
                <MaterialReactTable table={table} />
              </div>
            </div>
          )}
        </div>

        {/* ----------------Handle Modals--------------- */}
        {isUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto px-2 sm:p-4 bg-white/75 bg-blend-luminosity ">
            <div className="w-[38rem]">
              <UserModal
                setShowAddUser={setIsUser}
                userId={userId}
                setUserId={setUserId}
                fetchUsers={fetchUsers}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
