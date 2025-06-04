import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CgClose } from "react-icons/cg";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { TbLoader3 } from "react-icons/tb";
import { style } from "../../utlis/CommonStyle";

export default function Register({
  setIsOpen,
  getAllUsers,
  userId,
  setUserId,
  userData
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


  console.log("USERS ARE>>>💙💚💚💛💛", userData)
  const [juniors, setJuniors] = useState([])
  console.log("role:", role);
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
            juniors
          }
        );
        if (data) {
          getAllUsers();
          setIsloading(false);
          toast.success("User Updated");
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
          }
        );
        if (data) {
          getAllUsers();
          setIsloading(false);
          toast.success("User added");
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
      setIsloading(false);
    }
  };

  // Get User
  const getUser = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_user/${userId}`
      );
      setName(data?.user?.name);
      setEmail(data?.user?.email);
      setUsername(data?.user?.username);
      setPhone(data?.user?.phone);
      setAddress(data?.user?.address);
      setEmergency_contact(data?.user?.emergency_contact);
      setRole(data?.user?.role._id);
      setJuniors(data?.user?.juniors)
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();

    //eslint-disable-next-line
  }, [userId]);
  return (
    <div className="relative w-[40rem] py-4  bg-white rounded-lg mt-[10rem] sm:mt-0 ">
      <div className="flex items-center justify-between px-4 ">
        <h1 className="text-2xl font-semibold text-center mb-4">
          {userId ? "Update User" : "Add User"}
        </h1>
        <span
          className="absolute top-3 right-3 cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-150 flex items-center justify-center"
          onClick={() => {
            setIsOpen(false);
            setUserId("");
          }}
        >
          <CgClose className="h-5 w-5 text-black" />
        </span>
      </div>
      <hr className="h-[1px] w-full bg-gray-300" />
      <form onSubmit={handleSubmit} className="mt-6  px-4  ">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="" className="text-[1rem] font-[400] ">
              Name
            </label>
            <input
              type="text"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="py-2 px-3 border-2  text-[15px] outline-none border-gray-900 rounded-md shadow-md"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="" className="text-[1rem] font-[400] ">
              Enter your Email
            </label>
            <input
              type="email"
              placeholder="loginmail@gmail.com"
              required
              disabled={userId}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-2 px-3 border-2  text-[15px] outline-none border-gray-900 rounded-md shadow-md"
            />
          </div>

          {!userId && (
            <div className="flex flex-col gap-1">
              <label htmlFor="" className="text-[1rem] font-[400] ">
                Enter Password
              </label>
              <div className="relative w-full">
                <div
                  className="absolute top-2 right-2 z-10 cursor-pointer"
                  onClick={() => setIsShow(!isShow)}
                >
                  {!isShow ? (
                    <IoMdEyeOff size={25} className="cursor-pointer" />
                  ) : (
                    <IoMdEye size={25} className="cursor-pointer" />
                  )}
                </div>
                <input
                  type={!isShow ? "password" : "text"}
                  placeholder="password!@#%"
                  value={password}
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2 px-3 border-2  text-[15px] outline-none border-gray-900 rounded-md shadow-md"
                />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor="" className="text-[1rem] font-[400] ">
              User Name
            </label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="py-2 px-3 border-2  text-[15px] outline-none border-gray-900 rounded-md shadow-md"
            />
          </div>

          {/*  */}

          <div className="flex flex-col gap-1">
            <label htmlFor="" className="text-[1rem] font-[400] ">
              Phone
            </label>
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="py-2 px-3 border-2  text-[15px] outline-none border-gray-900 rounded-md shadow-md"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="" className="text-[1rem] font-[400] ">
              Emergency Contact
            </label>
            <input
              type="text"
              placeholder="Emergency Contact"
              required
              value={emergency_contact}
              onChange={(e) => setEmergency_contact(e.target.value)}
              className="py-2 px-3 border-2  text-[15px] outline-none border-gray-900 rounded-md shadow-md"
            />
          </div>

          {/*  */}

          <div className="flex flex-col gap-1">
            <label htmlFor="" className="text-[1rem] font-[400] ">
              Address
            </label>
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="py-2 px-3 border-2  text-[15px] outline-none border-gray-900 rounded-md shadow-md"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="" className="text-[1rem] font-[400] ">
              Role
            </label>
            <select
              className={`${style.input} h-[2.7rem] border-gray-900`}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Role</option>
              {userRoles?.map((role, i) => (
                <option value={role._id} className="capitalize" key={i}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>


          






        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mt-4 text-center">Select Team Members</h2>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3  bg-white rounded-xl  mt-2">

          {userData?.filter(el => el.isActive && userId !== el._id ).map(user => (
            <div key={user._id} className="">
              
              <label
                
                htmlFor={`junior-${user._id}`}
                className="text-sm font-medium text-gray-700 cursor-pointer  flex items-center gap-1 justify-start  bg-gray-50 shadow-sm   rounded-lg hover:bg-gray-100 transition-colors p-2"
              >

<input
                id={`junior-${user._id}`}
                type="checkbox"
                value={user._id}
                checked={juniors.includes(user._id)}
                onChange={e => {
                  const isChecked = e.target.checked;
                  setJuniors(prev =>
                    isChecked
                      ? [...prev, user._id]
                      : prev.filter(id => id !== user._id)
                  );
                }}
                className="accent-blue-600 w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
              />


                {user.name}
              </label>
            </div>
          ))}

        </div>





        {/*  */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className={`btn w-[8rem] ${
              isloading && "animate-pulse pointer-events-none"
            }`}
          >
            {isloading ? (
              <TbLoader3 className="h-5 w-5 animate-spin " />
            ) : (
              <span>{userId ? "Update" : "Submit"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
