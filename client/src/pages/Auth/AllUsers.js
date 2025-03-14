import React, { useEffect, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { style } from "../../utlis/CommonStyle";
import { GoPlus } from "react-icons/go";
import Register from "./Register";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { BsThreeDotsVertical } from "react-icons/bs";
import { TbLoader3 } from "react-icons/tb";
import { MdDeleteForever } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import Loader from "../../utlis/Loader";
import { LuPencil } from "react-icons/lu";

export default function AllUsers() {
  const [isOpen, setIsOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [index, setIndex] = useState("");
  const [userRoles, setUserRoles] = useState([]);

  // Get all Users
  const getAllUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(data?.users);
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

  const handleChange = (e, id) => {
    console.log("ROle", e.target.value, id);
    UpdateRole(e.target.value, id);
  };

  const columns = [
    {
      field: "Type",
      headerName: "Avatar",
      flex: 0.2,
      renderCell: (params) => {
        console.log(params);
        return (
          <>
            <div className="relative w-[3rem] h-[3rem] object-fill p-1">
              <img
                src={
                  params?.row?.avatar ? params?.row?.avatar : "/profile1.jpeg"
                }
                layout="fill"
                objectFit="contain"
                className="w-full h-full rounded-full border border-gray-500"
                alt="Icon"
              />
            </div>
          </>
        );
      },
    },
    { field: "Name", headerName: "Name", flex: 0.3 },
    { field: "Email", headerName: "Email", flex: 0.3 },
    { field: "phone", headerName: "Phone", flex: 0.2 },
    { field: "emer_contact", headerName: "Emergency Contact", flex: 0.2 },
    { field: "address", headerName: "Address", flex: 0.3 },
    {
      field: "role",
      headerName: "Role",
      flex: 0.3,
      renderCell: (params) => {
        console.log(params);
        return (
          <>
            <select
              className={`${style.input} h-[2.5rem] w-full border-gray-900`}
              onChange={(e) => handleChange(e, params.row.id)}
              value={params?.row.role._id || ""}
            >
              {userRoles?.map((role, i) => (
                <option value={role._id} className="capitalize" key={i}>
                  {role.name}
                </option>
              ))}
            </select>
          </>
        );
      },
    },

    { field: "created_at", headerName: "Created At", flex: 0.3 },

    {
      field: "  ",
      headerName: "Actions",
      flex: 0.3,
      renderCell: (params) => {
        return (
          <>
            <div className="flex items-center gap-3 mt-3 ">
              <span
                onClick={() => {
                  handleDelete(params.row.id);
                  setIndex(params.row.id);
                }}
              >
                {deleting && index === params.row.id ? (
                  <TbLoader3 className="h-4 w-4 animate-spin" />
                ) : (
                  <AiOutlineDelete
                    className="text-red-500 hover:text-red-600 cursor-pointer"
                    size={20}
                  />
                )}
              </span>
              <span
                onClick={() => {
                  setIndex(params.row.id);
                  setIsOpen(true);
                }}
              >
                <LuPencil
                  className="text-gray-700 hover:text-green-900 cursor-pointer"
                  size={20}
                />
              </span>
            </div>
          </>
        );
      },
    },
  ];

  const rows = [];

  if (users && Array.isArray(users)) {
    users.forEach((user) => {
      if (user) {
        const formattedDate = format(new Date(user?.createdAt), "dd-MM-yyyy");
        const fileObject = {
          id: user._id,
          Type: user?.fileType,
          Name: user?.name,
          Email: user?.email,
          avatar: user?.avatar,
          phone: user?.phone ? user?.phone : "N/A",
          emer_contact: user?.emergency_contact
            ? user?.emergency_contact
            : "N/A",
          address: user?.address ? user?.address : "N/A",
          role: user?.role ? user?.role : "N/A",
          active: user?.active,
          created_at: formattedDate,
        };

        rows.push(fileObject);
      }
    });
  }

  //---------------------Delete User---------------
  const handleDelete = async (userId) => {
    setDeleting(true);
    if (!userId) return toast.error("User id  is missing!");
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/user/delete_user/${userId}`
      );
      if (data?.success) {
        getAllUsers();
        setDeleting(false);
        toast.success(data?.message, { duration: 2000 });
      } else {
        setDeleting(false);
        toast.error(data?.message, { duration: 2000 });
      }
    } catch (error) {
      console.log(error);
      setDeleting(false);
      toast.error("Something went wrong!");
    }
  };

  // Update User Role
  const UpdateRole = async (role, userId) => {
    setDeleting(true);
    if (!userId) return toast.error("User id  is missing!");
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/user/update_role/${userId}`,
        { role: role }
      );
      if (data?.success) {
        getAllUsers();
        toast.success(data?.message, { duration: 2000 });
      } else {
        toast.error(data?.message, { duration: 2000 });
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
      setDeleting(false);
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Layout>
      <div className="w-full h-full py-4 px-4">
        <div className="flex items-center justify-between">
          <h1 className=" text-2xl sm:text-3xl font-semibold ">All Users</h1>
          <button
            className={`${style.button1}`}
            onClick={() => setIsOpen(true)}
          >
            <GoPlus className="h-5 w-5 text-white " /> Add User
          </button>
        </div>
        <hr className="my-5 bg-gray-300 w-full h-[2px]" />

        <div className="">
          <div className="w-full px-2 sm:px-4 message overflow-y-auto ">
            {loading ? (
              <Loader />
            ) : (
              <div className="w-full h-[85vh] pb-[4rem] overflow-auto message mt-[1rem] sm:mt-0">
                <Box
                  m="40px 0 0 0"
                  height="80vh"
                  width="98%"
                  boxShadow=".3rem .3rem .4rem rgba(0,0,0,.3)"
                  filter="drop-shadow(0rem 0rem .6rem .1rem rgb(0, 149, 255))"
                  overflow={"auto"}
                  className="overflow-auto message hidden sm:block"
                  sx={{
                    "& .MuiDataGrid-root": {
                      border: `2px solid #777`,
                      outline: "none",
                    },
                    "& .css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon": {
                      color: "#000",
                    },
                    "& .MuiDataGrid-sortIcon": {
                      color: "#000",
                    },
                    "& .MuiDataGrid-row": {
                      color: "#000",
                      borderBottom: `2px solid ${"#047857"}`,
                    },
                    "& .MuiTablePagination-root": {
                      color: "#000",
                    },
                    "& .MuiDataGrid-cell": {
                      borderBottom: "none",
                    },
                    "& .name-column--cell": {
                      color: "#000",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#047857",
                      color: "#000",
                      borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                      backgroundColor: "#F2F0F0",
                    },
                    "& .MuiDataGrid-footerContainer": {
                      backgroundColor: "#777",
                      color: "#fff",
                      borderBottom: "none",
                    },
                    "& .MuiCheckbox-root": {
                      color: "#047857",
                    },
                    "& .MuiCheckbox-root:nth-child(1)": {
                      color: "#000",
                    },
                    "& .MuiDataGrid--toolbarContainer .MuiButton-text": {
                      color: `#fff !important`,
                    },
                  }}
                >
                  <DataGrid
                    class="light:text-black dark:text-white "
                    rows={rows}
                    columns={columns}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 15 },
                      },
                    }}
                    pageSizeOptions={[5, 10, 20, 50]}
                    checkboxSelection
                  />
                </Box>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add New User */}
      {isOpen && (
        <div className="fixed top-[4rem] h-[100%] sm:top-0 left-0 w-full z-[99990] overflow-y-scroll bg-gray-100/70 flex items-center justify-center py-6 px-4">
          <Register
            setIsOpen={setIsOpen}
            getAllUsers={getAllUsers}
            userId={index}
          />
        </div>
      )}
    </Layout>
  );
}
