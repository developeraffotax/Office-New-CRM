import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import toast from "react-hot-toast";
import axios from "axios";
import { FaSpinner } from "react-icons/fa6";
import { Style } from "@/app/utils/CommonStyling";

const types = [
  "End User",
  "Dealer",
  "Builder",
  "Owners",
  "Designers",
  "Constructors",
];

export default function UserModal({
  setShowAddUser,
  userId,
  setUserId,
  fetchUsers,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [user_Status, setUser_Status] = useState("pending");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);

  // Get User Details
  const getUserDetails = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/userDetail/${userId}`
      );

      console.log("Data:", data);

      if (data) {
        setName(data.user.name);
        setEmail(data.user.email);
        setPassword(data.user.password);
        setCategory(data.user.category);
        setExperience(data.user.experience);
        setUser_Status(data.user.user_Status);
        setRole(data.user.role);
        setStatus(data.user.status);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (userId) {
        const { data } = await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/update/profile/${userId}`,
          {
            name,
            email,
            password,
            category,
            experience,
            user_Status,
            role,
            status,
          }
        );
        if (data) {
          fetchUsers();
          toast.success("User updated successfully!");
          setShowAddUser(false);
        }
      } else {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/addUser`,
          {
            name,
            email,
            password,
            category,
            experience,
            user_Status,
            role,
            status,
          }
        );

        if (data) {
          fetchUsers();
          toast.success("User added successfully!");
          setShowAddUser(false);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
      setUserId("");
      setName("");
      setEmail("");
      setPassword("");
      setCategory("");
      setExperience("");
      setUser_Status("");
      setRole("");
      setStatus(false);
    }
  };
  return (
    <div className="w-full bg-white rounded-md overflow-hidden shadow min-h-[15rem] max-h-[99%] flex flex-col">
      <div className="flex items-center justify-between bg-customBrown px-4 py-2 sm:py-3 ">
        <h3 className="text-lg font-medium text-white">
          {userId ? "Edit User" : "Add User"}
        </h3>
        <span
          onClick={() => {
            setUserId("");
            setShowAddUser(false);
          }}
          className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer "
        >
          <CgClose className="text-[18px]" />
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-4 py-2 mt-4 h-full w-full "
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Name<span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="Full Name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Email<span className="text-red-700">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="example@gmail.com"
            />
          </div>
          {!userId && (
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-gray-700">
                Password<span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${Style.input} w-full`}
                placeholder="123@abc"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Category<span className="text-red-700">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${Style.input} w-full`}
            >
              <option value="">Select Category</option>
              {types.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Experience
            </label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="5"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              User Status
            </label>
            <select
              value={user_Status}
              onChange={(e) => setUser_Status(e.target.value)}
              className={`${Style.input} w-full`}
            >
              <option value="">Select User Status</option>
              <option value="pending">Pending</option>
              <option value="complete">Complete</option>
              <option value="cancel">Cancel</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${Style.input} w-full`}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          {userId && (
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${Style.input} w-full`}
              >
                <option value="">Select Status</option>
                <option value="true">Active</option>
                <option value="false">In Active</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end w-full pb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setUserId("");
                setShowAddUser(false);
              }}
              type="button"
              className="w-[6rem] py-[.3rem] text-[14px] rounded-sm border-2 border-red-600 text-red-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.03] transition-all duration-300 "
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="w-[6rem] py-[.4rem] text-[14px] flex items-center justify-center rounded-sm bg-customBrown hover:shadow-md hover:scale-[1.03] transition-all duration-300 text-white"
            >
              {loading ? (
                <span>
                  <FaSpinner className="h-5 w-5 text-white animate-spin" />
                </span>
              ) : (
                <span>{userId ? "Save" : "SUBMIT"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
