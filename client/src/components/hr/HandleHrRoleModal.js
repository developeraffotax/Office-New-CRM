import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import axios from "axios";

export default function HandleHrRoleModal({
  
  setIshandleDepartment,
  fetchAllHrRoles,
  hrRole,
  setHrRole,
  getAllTasks,
}) {
  const [loading, setLoading] = useState(false);
  const [roleName, set_roleName] = useState(() => hrRole?.roleName || "");

  // //---------- Get Single Project-----------
  // const getSingleProject = async () => {
  //   try {
  //     const { data } = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/api/v1/department/detail/${departmentId}`
  //     );
  //     setDepartmentName(data?.department?.departmentName);
  //     const userList = data?.department?.users?.map((userObj) => userObj.user);
  //     setUserList(userList);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   getSingleProject();
  //   // eslint-disable-next-line
  // }, [departmentId]);

  // -----------Create / Update Task-------->
  const handleProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (hrRole) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/hrRole/edit/${hrRole?._id}`,
          { roleName: roleName  }
        );
        if (data?.success) {
          getAllTasks();
          setLoading(false);
          setHrRole(null);
          fetchAllHrRoles();
          set_roleName("");
         
          setIshandleDepartment(false);
          toast.success("Role Updated!");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/hrRole/create`,
          { roleName: roleName  }
        );
        if (data?.success) {
          setLoading(false);
           
          set_roleName("");
          
          setIshandleDepartment(false);
          toast.success("Role Created successfully!");
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };


  return (
    <div className="w-[21rem] sm:w-[34rem] rounded-md shadow border flex flex-col gap-4 bg-white">
      <div className=" flex items-center justify-between px-4 pt-2">
        <h1 className="text-[20px] font-semibold text-black">
          {hrRole ? "Update Role" : "Add Role"}
        </h1>
        <span
          className=" cursor-pointer"
          onClick={() => {
            setHrRole(null);
            setIshandleDepartment(false);
          }}
        >
          <IoClose className="h-6 w-6 " />
        </span>
      </div>
      <hr className="h-[1px] w-full bg-gray-400 " />
      <div className="w-full py-2 px-4">
        <form onSubmit={handleProject} className="w-full flex flex-col gap-4 ">
          <input
            type="text"
            placeholder="Role Name"
            required
            className={`${style.input} w-full`}
            value={roleName}
            onChange={(e) => set_roleName(e.target.value)}
          />

 
          <div className="flex items-center justify-end">
            <button
              className={`${style.button1} text-[15px] `}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>{hrRole ? "Update" : "Create"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
