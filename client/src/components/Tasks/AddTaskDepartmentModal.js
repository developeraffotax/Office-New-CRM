import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import axios from "axios";
 
 

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/tasks/department`
export default function AddTaskDepartmentModal({
  users,
  setOpenAddDepartment,
  getAllDepartments,
  departmentId,
  setDepartmentId,
  getTasks1 
}) {
  const [loading, setLoading] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [type, setType] = useState("");
  const [usersList, setUsersList] = useState([]);

  // ---------- Get Single Department -----------
  const getSingleDepartment = async () => {
    if (!departmentId) return;
    try {
      const { data } = await axios.get( `${API_URL}/${departmentId}` );
      if (data?.success) {
        setDepartmentName(data?.data?.departmentName || "");
        // setType(data?.data?.type || "");
        // setUsersList(data?.data?.users?.map((u) => u.user) || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch department details");
    }
  };

  useEffect(() => {
    getSingleDepartment();
     
  }, [departmentId]);

  // ----------- Create / Update Department -------->
  const handleDepartment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (departmentId) {
        const { data } = await axios.put(
          `${API_URL}/${departmentId}`,
          {
            departmentName,
            type,
            users: usersList.map((u) => ({ user: u._id })),
          }
        );
        if (data?.success) {
          toast.success("Department updated!");
         
        }
      } else {
        const { data } = await axios.post( `${API_URL}`,
          {
            departmentName,
            // type,
            // users: usersList.map((u) => ({ user: u._id })),
          }
        );
        if (data?.success) {
          toast.success("Department created!");
        }
      }

      setLoading(false);
      resetForm();
      getAllDepartments();
      setOpenAddDepartment(false);
      getTasks1(); // Refresh tasks after update
       
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Error saving department");
    }
  };

  // Add User
  // const handleAddUser = (user) => {
  //   if (!Array.isArray(usersList)) {
  //     setUsersList([user]);
  //     return;
  //   }
  //   if (usersList.some((existingUser) => existingUser._id === user._id)) {
  //     return toast.error("User already exists!");
  //   }
  //   setUsersList([...usersList, user]);
  // };

  // // Remove User
  // const handleRemoveUser = (id) => {
  //   setUsersList(usersList.filter((u) => u._id !== id));
  // };

  // Reset form after save/close
  const resetForm = () => {
    setDepartmentId("");
    setDepartmentName("");
    setType("");
    setUsersList([]);
  };

  return (
    <div className="w-[21rem] sm:w-[34rem] rounded-md shadow border flex flex-col gap-4 bg-white">
      <div className="flex items-center justify-between px-4 pt-2">
        <h1 className="text-[20px] font-semibold text-black">
          {departmentId ? "Update Department" : "Add Department"}
        </h1>
        <span
          className="cursor-pointer"
          onClick={() => {
            resetForm();
            setOpenAddDepartment(false);
          }}
        >
          <IoClose className="h-6 w-6" />
        </span>
      </div>
      <hr className="h-[1px] w-full bg-gray-400" />
      <div className="w-full py-2 px-4">
        <form onSubmit={handleDepartment} className="w-full flex flex-col gap-4">
          {/* Department Name */}
          <input
            type="text"
            placeholder="Department Name"
            required
            className={`${style.input} w-full`}
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
          />

          {/* Department Type */}
          {/* <input
            type="text"
            placeholder="Department Type (e.g. Finance, Tech)"
            className={`${style.input} w-full`}
            value={type}
            onChange={(e) => setType(e.target.value)}
          /> */}

          {/* Users List */}
          {/* {usersList?.length > 0 && (
            <div className="w-full flex items-center gap-4 flex-wrap border py-2 px-2 rounded-md border-gray-400">
              {usersList.map((user) => (
                <div
                  key={user?._id}
                  className="flex items-center gap-3 py-1 px-2 rounded-md text-white bg-purple-600"
                >
                  <span className="text-white text-[15px]">{user?.name}</span>
                  <span
                    className="cursor-pointer bg-red-500/50 p-[2px] rounded-full hover:bg-red-500"
                    onClick={() => handleRemoveUser(user?._id)}
                  >
                    <IoClose className="h-4 w-4" />
                  </span>
                </div>
              ))}
            </div>
          )} */}

          {/* User Selector */}
          {/* <select
            value=""
            className={`${style.input}`}
            onChange={(e) => handleAddUser(JSON.parse(e.target.value))}
          >
            <option>Select User</option>
            {users?.map((user) => (
              <option
                key={user._id}
                value={JSON.stringify({
                  _id: user._id,
                  name: user.name,
                  avatar: user.avatar,
                  role: user.role,
                })}
              >
                {user?.name}
              </option>
            ))}
          </select> */}

          {/* Submit */}
          <div className="flex items-center justify-end">
            <button
              className={`${style.button1} text-[15px]`}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>{departmentId ? "Update" : "Create"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
