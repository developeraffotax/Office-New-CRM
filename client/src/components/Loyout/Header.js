import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import { IoNotifications } from "react-icons/io5";
import { FaStopwatch20 } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useAuth } from "../../context/authContext";
import { format } from "timeago.js";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `#${(hash & 0x00ffffff).toString(16).padStart(6, "0")}`;
  return color;
};

const notifications = [
  {
    _id: "657c5a54114ec768357fb9b2",
    title: "New Order",
    message: "You have a new order from Introduction to Web Development",
    status: "unread",
    createdAt: "2023-12-15T13:53:24.301+00:00",
  },
  {
    _id: "657c5a54114ec768357fb9b2",
    title: "New Order",
    message: "You have a new order from Introduction to Web Development",
    status: "unread",
    createdAt: "2023-12-15T13:53:24.301+00:00",
  },
  {
    _id: "657c5a54114ec768357fb9b2",
    title: "New Order",
    message: "You have a new order from Introduction to Web Development",
    status: "unread",
    createdAt: "2023-12-15T13:53:24.301+00:00",
  },
];

export default function Header() {
  const [search, setSearch] = useState("");
  const { auth, setAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState([]);

  console.log(userInfo);

  const handleSearch = async () => {
    try {
    } catch (error) {
      console.log(error);
      toast.error("Error in search!");
    }
  };

  //    Get User Info
  const getUserInfo = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_user/${auth.user.id}`
      );
      setUserInfo(data?.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserInfo();

    // eslint-disable-next-line
  }, [auth.user]);

  // Color
  const userInitials = auth?.user?.name
    ? auth?.user?.name?.slice(0, 1).toUpperCase()
    : "";
  const backgroundColor = userInitials
    ? stringToColor(userInitials)
    : "orangered";

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/");
  };

  return (
    <div className="w-full h-[3.8rem] bg-gray-200 sticky top-0 left-0 z-[100] ">
      <div className="w-full h-full flex items-center justify-between sm:px-4 px-6 py-2">
        <Link to={"/dashboard"} className="">
          <img src="/logo.png" alt="Logo" className="h-[3.3rem] w-[8rem]" />
        </Link>
        {/* Search */}
        <div className=" hidden sm:flex">
          <form onSubmit={handleSearch} className="relative">
            <span className="absolute top-[.6rem] left-2 z-10">
              <IoSearch className="h-5 w-5 text-orange-500" />
            </span>
            <input
              type="search"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[20rem] h-[2.5rem] rounded-[2.5rem] pl-7 pr-3 outline-none border-[1.5px] border-gray-400 focus:border-orange-600"
            />
          </form>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="relative cursor-pointer m-2"
                onClick={() => setOpen(!open)}
              >
                <IoNotifications className="text-2xl container text-black " />
                <span className="absolute -top-2 -right-2 bg-orange-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
                  {notifications && notifications.length}
                </span>
              </div>
              {open && (
                <div className="w-[350px] min-h-[40vh] max-h-[60vh]  overflow-y-scroll  pb-2 shadow-xl  bg-gray-100 absolute z-[999] top-[2rem] right-[1.6rem] rounded">
                  <h5 className="text-[20px] text-center font-medium text-black  p-3 font-Poppins">
                    Notifications
                  </h5>
                  {notifications &&
                    notifications?.map((item, index) => (
                      <div
                        className="dark:bg-[#2d3a4ea1] bg-[#00000013] font-Poppins border-b dark:border-b-[#ffffff47] border-b-[#fff]"
                        key={index}
                      >
                        <div className="w-full flex items-center justify-between p-2">
                          <p className="text-black ">{item?.title}</p>
                          <p
                            className="text-black  cursor-pointer"
                            // onClick={() => updateNotificationData(item._id)}
                          >
                            Mark as read
                          </p>
                        </div>
                        <p className="p-2 text-gray-700  text-[14px]">
                          {item?.message}
                        </p>
                        <p className="p-2 text-black  text-[14px] ">
                          {format(item?.createdAt)}
                        </p>
                      </div>
                    ))}
                  {notifications.length === 0 && (
                    <div className="w-full h-[30vh] text-black   flex items-center justify-center">
                      Notification not received!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="relative">
            <div
              className="w-[2.6rem] h-[2.6rem] cursor-pointer relative rounded-full overflow-hidden flex items-center justify-center text-white border-2 border-orange-600"
              style={{ backgroundColor }}
              onClick={() => setShow(!show)}
            >
              {userInfo ? (
                <img src={userInfo?.avatar} alt={userInfo?.name?.slice(0, 1)} />
              ) : (
                <h3 className="text-[20px] font-medium uppercase">
                  {userInitials}
                </h3>
              )}
            </div>
            {/* Model */}
            {show && (
              <div className="absolute w-[14rem] top-[2.6rem] right-[1.3rem] z-[999] py-2 px-1 rounded-md rounded-tr-none shadow-sm bg-white border">
                <ul className="flex flex-col gap-2 w-full transition-all duration-200">
                  <Link
                    to={"/profile"}
                    className="font-medium text-[14px] w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
                  >
                    Profile
                  </Link>
                  <span
                    onClick={handleLogout}
                    className="font-medium text-[14px] w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
                  >
                    Logout
                  </span>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
