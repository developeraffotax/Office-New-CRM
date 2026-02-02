import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../../../redux/slices/authSlice";

const ProfileDropdown = ({ userInfo, show, setShow }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth.auth);

  const handleLogout = () => {
    dispatch(setAuth({ ...auth, user: null, token: "" }));
    localStorage.removeItem("auth");
    navigate("/");
  };

  return (
    <div className="relative">
      <div
        className="w-[2.6rem] h-[2.6rem] cursor-pointer relative rounded-full bg-sky-600 overflow-hidden flex items-center justify-center text-white border-2 border-orange-600"
        onClick={() => setShow(!show)}
      >
        {userInfo?.avatar ? (
          <img
            src={userInfo?.avatar ? userInfo?.avatar : "/profile1.jpeg"}
            alt={userInfo?.name?.slice(0, 1)}
          />
        ) : (
          <h3 className="text-[20px] font-medium uppercase">
            {userInfo?.name?.slice(0, 1)}
          </h3>
        )}
      </div>

      {show && (
        <div className="absolute w-[14rem] top-[2.6rem] right-[1.3rem] z-[999] py-2 px-1 rounded-md rounded-tr-none shadow-sm bg-white border">
          <ul className="flex flex-col gap-2 w-full transition-all duration-200">
            <Link
              to={"/employee/dashboard"}
              className="font-medium text-[16px] w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
            >
              Dashboard
            </Link>
            <Link
              to={"/profile"}
              className="font-medium text-[16px] w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
            >
              Profile
            </Link>
            <span
              onClick={handleLogout}
              className="font-medium text-[16px] w-full hover:bg-gray-200 hover:shadow-md rounded-md transition-all duration-200 cursor-pointer py-2 px-2"
            >
              Logout
            </span>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
