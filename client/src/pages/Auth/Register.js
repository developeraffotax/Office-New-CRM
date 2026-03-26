import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CgClose } from "react-icons/cg";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { TbLoader3 } from "react-icons/tb";

export default function Register({
  setIsOpen,
  getAllUsers,
  userId,
  setUserId,
  userData,
}) {
  const [isloading, setIsloading] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [emergency_contact, setEmergency_contact] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [isTeamLead, setIsTeamLead] = useState(false);
  const [juniors, setJuniors] = useState([]);

  // Logic remains identical
  const getAllRoles = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/roles/fetch/all/roles`,
      );
      setUserRoles(data?.roles);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsloading(true);
    try {
      if (userId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/user/update/Profile/${userId}`,
          {
            name,
            email,
            password,
            username,
            phone,
            emergency_contact,
            address,
            role,
            juniors,
            isTeamLead,
          },
        );
        if (data) {
          getAllUsers();
          setIsloading(false);
          toast.success("User Updated Successfully");
          setIsOpen(false);
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/user/register/user`,
          {
            name,
            email,
            password,
            username,
            phone,
            emergency_contact,
            address,
            role,
            isTeamLead,
          },
        );
        if (data) {
          getAllUsers();
          setIsloading(false);
          toast.success("User registered successfully");
          setIsOpen(false);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setIsloading(false);
    }
  };

  const getUser = async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_user/${userId}`,
      );
      setName(data?.user?.name);
      setEmail(data?.user?.email);
      setUsername(data?.user?.username);
      setPhone(data?.user?.phone);
      setAddress(data?.user?.address);
      setEmergency_contact(data?.user?.emergency_contact);
      setRole(data?.user?.role._id);
      setJuniors(data?.user?.juniors || []);
      setIsTeamLead(data?.user?.isTeamLead || false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, [userId]);

  console.log("JUNIORS 🧡🧡🧡", userData);

  // Design Constants
  const labelStyle = "text-sm font-medium text-gray-700 mb-1.5";
  const inputStyle =
    "w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500";

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-gray-50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden border border-gray-300 font-inter animate-badge-pop">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shadow-sm border-gray-300 bg-gray-100">
        <h1 className="text-xl font-bold text-gray-800">
          {userId ? "Edit User Profile" : "Register New User"}
        </h1>
        <button
          onClick={() => {
            setIsOpen(false);
            setUserId("");
          }}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <CgClose className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Name */}
          <div className="flex flex-col">
            <label className={labelStyle}>Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="john@company.com"
              required
              disabled={!!userId}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Password */}
          {!userId && (
            <div className="flex flex-col">
              <label className={labelStyle}>Password</label>
              <div className="relative">
                <input
                  type={!isShow ? "password" : "text"}
                  placeholder="••••••••"
                  value={password}
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setIsShow(!isShow)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {!isShow ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Username */}
          <div className="flex flex-col">
            <label className={labelStyle}>Username</label>
            <input
              type="text"
              placeholder="jdoe_admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className={labelStyle}>Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Emergency Contact */}
          <div className="flex flex-col">
            <label className={labelStyle}>Emergency Contact</label>
            <input
              type="text"
              placeholder="Contact Number"
              required
              value={emergency_contact}
              onChange={(e) => setEmergency_contact(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Role */}
          <div className="flex flex-col">
            <label className={labelStyle}>Assign Role</label>
            <select
              className={inputStyle}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select a role</option>
              {userRoles?.map((r, i) => (
                <option value={r._id} key={i}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div className="flex flex-col col-span-2">
            <label className={labelStyle}>Physical Address</label>
            <input
              type="text"
              placeholder="City, Country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Team Lead Toggle */}
          <div className="md:col-span-2 flex items-center p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isTeamLead}
                onChange={() => setIsTeamLead((prev) => !prev)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-semibold text-gray-800">
                Set as Team Lead
              </span>
            </label>
          </div>
        </div>

        {/* Team Members Section */}
        {userId && (
          <div className=" pt-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-grow h-px bg-gray-200"></div>
              <h2 className="text-[11px] font-bold text-gray-600 uppercase tracking-widest px-3 py-1 rounded-full border border-gray-300">
                Team Members
              </h2>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {userData
                ?.filter((el) => el.isActive && userId !== el._id)
                .map((user) => {
                  const isSelected = juniors?.includes(user._id);

                  return (
                    <label
                      key={user._id}
                      className={`group relative flex items-center gap-3 p-2.5 rounded-full border transition-all duration-200 cursor-pointer select-none
          ${
            isSelected
              ? "bg-blue-50/50 border-blue-500 shadow-sm   "
              : "bg-white border-gray-300 hover:border-blue-200 hover:bg-gray-50/50 hover:shadow-sm"
          }`}
                    >
                      {/* Visual Indicator: Avatar/Initials Circle */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-bold tracking-tighter transition-colors
          ${
            isSelected
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
          }
        `}
                      >
                        {user?.avatar ? (
                          <img src={user?.avatar} alt={user.name} />
                        ) : (
                          <span>
                            {user.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        )}
                      </div>

                      {/* Text Content */}
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-[13px] font-semibold truncate transition-colors ${
                            isSelected ? "text-blue-900" : "text-gray-700"
                          }`}
                        >
                          {user.name}
                        </span>
                        {/* <span className="text-[10px] text-gray-400 leading-tight">Team Member</span> */}
                      </div>

                      {/* Hidden but functional checkbox */}
                      <input
                        type="checkbox"
                        className="sr-only" // Hidden for a cleaner look, the label handles the click
                        checked={isSelected}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setJuniors((prev) =>
                            isChecked
                              ? [...prev, user._id]
                              : prev?.filter((id) => id !== user._id),
                          );
                        }}
                      />
                    </label>
                  );
                })}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-8 pt-6 border-t border-gray-300 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isloading}
            className="min-w-[120px] flex items-center justify-center px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70"
          >
            {isloading ? (
              <TbLoader3 className="h-5 w-5 animate-spin" />
            ) : userId ? (
              "Update"
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
