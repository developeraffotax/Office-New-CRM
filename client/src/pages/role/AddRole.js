import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";

export default function AddRole({
  setShow,
  roleId,
  setRoleId,
  getRole,
  roleName,
  setRoleName,
}) {
  const [name, setName] = useState();
  const [loading, setLoading] = useState(false);

  //   Handle Add Role
  const handleRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (roleId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/roles/update/role/${roleId}`,
          { name }
        );
        if (data) {
          getRole();
          setLoading(false);
          setShow(false);
          setName("");
          setRoleName("");
          toast.success("Role update successfully!");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/roles/create/role`,
          { name }
        );
        if (data) {
          getRole();
          setLoading(false);
          setShow(false);
          setName("");
          setRoleName("");
          toast.success("Role created successfully!");
        }
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    setName(roleName);
  }, [roleId, roleName]);

  return (
    <div className=" w-[21rem] sm:w-[28rem] max-h-[105vh] mt-[3rem] hidden1 overflow-y-auto rounded-lg shadow-md bg-white">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-xl font-semibold">
          {roleId ? "Update Update" : "Add Role"}
        </h1>
        <span
          onClick={() => {
            setShow(false);
            setRoleId("");
            setRoleName("");
          }}
        >
          <IoClose className="h-7 w-7 cursor-pointer" />
        </span>
      </div>
      <form
        onSubmit={handleRole}
        className="  py-4 px-3 sm:px-4 mt-3 flex flex-col gap-4 w-full"
      >
        <div className="inputBox">
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${style.input} w-full `}
          />
          <span>Role Name</span>
        </div>
        <div className="flex items-center justify-end ">
          <button
            disabled={loading}
            className={`${style.button1} text-[15px] `}
            type="submit"
            style={{ padding: ".4rem 1rem" }}
          >
            {loading ? (
              <TbLoader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <span>{roleId ? "Update" : "Create"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
