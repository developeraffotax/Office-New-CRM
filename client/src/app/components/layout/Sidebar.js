"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineMenuFold } from "react-icons/ai";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaUsers } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { LuWarehouse } from "react-icons/lu";
import { AiFillProduct } from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import { MdNotificationsActive } from "react-icons/md";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { BsChatRightText } from "react-icons/bs";
import { RiCoupon4Line } from "react-icons/ri";
import { useAuth } from "@/app/context/authContext";
import Image from "next/image";
import { IoLogOut } from "react-icons/io5";
import { IoSettings } from "react-icons/io5";

export default function Sidebar({ hide, setHide }) {
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState("");

  useEffect(() => {
    const pathArray = window.location.pathname.split("/");
    const fileIdFromPath = pathArray[1];
    setActive(fileIdFromPath ? fileIdFromPath : "dashboard");

    // exlint-disable-next-line
  }, [setActive]);

  const logout = async () => {
    localStorage.removeItem("auth");
    setAuth({ ...auth, user: null, token: "" });
    router.push("/");
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] py-2 border-r border-gray-200 bg-white text-black">
      <div className="relative w-full h-[calc(100vh-10.5vh)] sm:h-[calc(100vh-7.5vh)]  overflow-y-auto scroll-smooth py-3 pb-[2rem] shidden">
        <div className="flex flex-col gap-3 ">
          {/* 1 */}
          {/* <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "dashboard" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "dashboard" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300`}
            >
              {hide ? (
                <LuLayoutDashboard
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "dashboard" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <LuLayoutDashboard
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "dashboard" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "dashboard" && "#fff" }}
                  >
                    Dashboard
                  </span>
                </div>
              )}
            </div>
          </div>
          <hr className="w-full h-[1px] bg-gray-400" /> */}
          {/* user */}
          <div
            className={` relative h-[2.8rem] 3xl:h-[3rem]  cursor-pointer hover:shadow-md   shadow-gray-300 filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/users");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "users"
                  ? "bg-gradient-to-r from-[#f1dac1] via-[#fff] via-25% to-[#fff] text-customBrown"
                  : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-gradient-to-r from-[#f1dac1] via-[#fff] via-25% to-[#fff]  transition-all duration-300 hover:border`}
            >
              {hide ? (
                <FaUsers
                  className="h-6 w-6 cursor-pointer ml-2"
                  style={{ color: active === "users" ? "#443022" : "#8a8aa8" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <FaUsers
                    className="h-6 w-6 cursor-pointer ml-2"
                    style={{
                      color: active === "users" ? "#443022" : "#8a8aa8",
                    }}
                  />
                  <span
                    className="text-[16px] 3xl:text-[18px] font-[500]"
                    style={{
                      color: active === "users" ? "#443022" : "#8a8aa8",
                    }}
                  >
                    Users
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Projects */}
          <div
            className={` relative h-[2.8rem] 3xl:h-[3rem]  cursor-pointer hover:shadow-md   shadow-gray-300 filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/projects");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "projects"
                  ? "bg-gradient-to-r from-[#f1dac1] via-[#fff] via-25% to-[#fff] text-customBrown"
                  : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-gradient-to-r from-[#e0be99] via-[#fff] via-25% to-[#fff]  transition-all duration-300 hover:border`}
            >
              {hide ? (
                <AiFillProduct
                  className="h-6 w-6 cursor-pointer ml-2"
                  style={{
                    color: active === "projects" ? "#443022" : "#8a8aa8",
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <AiFillProduct
                    className="h-6 w-6 cursor-pointer ml-2"
                    style={{
                      color: active === "projects" ? "#443022" : "#8a8aa8",
                    }}
                  />
                  <span
                    className="text-[16px] 3xl:text-[18px] font-[500]"
                    style={{
                      color: active === "projects" ? "#443022" : "#8a8aa8",
                    }}
                  >
                    Projects
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div
            className={` relative h-[2.8rem] 3xl:h-[3rem]  cursor-pointer hover:shadow-md   shadow-gray-300 filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/products");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "products"
                  ? "bg-gradient-to-r from-[#f1dac1] via-[#fff] via-25% to-[#fff] text-customBrown"
                  : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-gradient-to-r from-[#e0be99] via-[#fff] via-25% to-[#fff]  transition-all duration-300 hover:border`}
            >
              {hide ? (
                <LuWarehouse
                  className="h-6 w-6 cursor-pointer ml-2"
                  style={{
                    color: active === "products" ? "#443022" : "#8a8aa8",
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <LuWarehouse
                    className="h-6 w-6 cursor-pointer ml-2"
                    style={{
                      color: active === "products" ? "#443022" : "#8a8aa8",
                    }}
                  />
                  <span
                    className="text-[16px] 3xl:text-[18px] font-[500]"
                    style={{
                      color: active === "products" ? "#443022" : "#8a8aa8",
                    }}
                  >
                    Products
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div
            className={` relative h-[2.8rem] 3xl:h-[3rem]  cursor-pointer hover:shadow-md   shadow-gray-300 filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/messages");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "messages"
                  ? "bg-gradient-to-r from-[#f1dac1] via-[#fff] via-25% to-[#fff] text-customBrown"
                  : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-gradient-to-r from-[#e0be99] via-[#fff] via-25% to-[#fff]  transition-all duration-300 hover:border`}
            >
              {hide ? (
                <BiSolidMessageSquareDetail
                  className="h-6 w-6 cursor-pointer ml-2"
                  style={{
                    color: active === "messages" ? "#443022" : "#8a8aa8",
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BiSolidMessageSquareDetail
                    className="h-6 w-6 cursor-pointer ml-2"
                    style={{
                      color: active === "messages" ? "#443022" : "#8a8aa8",
                    }}
                  />
                  <span
                    className="text-[16px] 3xl:text-[18px] font-[500]"
                    style={{
                      color: active === "messages" ? "#443022" : "#8a8aa8",
                    }}
                  >
                    Messages
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div
            className={` relative h-[2.8rem] 3xl:h-[3rem]  cursor-pointer hover:shadow-md   shadow-gray-300 filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/notifications");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "notifications"
                  ? "bg-gradient-to-r from-[#f1dac1] via-[#fff] via-25% to-[#fff] text-customBrown"
                  : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-gradient-to-r from-[#e0be99] via-[#fff] via-25% to-[#fff]  transition-all duration-300 hover:border`}
            >
              {hide ? (
                <MdNotificationsActive
                  className="h-6 w-6 cursor-pointer ml-2"
                  style={{
                    color: active === "notifications" ? "#443022" : "#8a8aa8",
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <MdNotificationsActive
                    className="h-6 w-6 cursor-pointer ml-2"
                    style={{
                      color: active === "notifications" ? "#443022" : "#8a8aa8",
                    }}
                  />
                  <span
                    className="text-[16px] 3xl:text-[18px] font-[500]"
                    style={{
                      color: active === "notifications" ? "#443022" : "#8a8aa8",
                    }}
                  >
                    Notification
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div
            className={` relative h-[2.8rem] 3xl:h-[3rem]  cursor-pointer hover:shadow-md   shadow-gray-300 filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/settings");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "settings"
                  ? "bg-gradient-to-r from-[#f1dac1] via-[#fff] via-25% to-[#fff] text-customBrown"
                  : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-gradient-to-r from-[#e0be99] via-[#fff] via-25% to-[#fff]  transition-all duration-300 hover:border`}
            >
              {hide ? (
                <IoSettings
                  className="h-6 w-6 cursor-pointer ml-2"
                  style={{
                    color: active === "settings" ? "#443022" : "#8a8aa8",
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <IoSettings
                    className="h-6 w-6 cursor-pointer ml-2"
                    style={{
                      color: active === "settings" ? "#443022" : "#8a8aa8",
                    }}
                  />
                  <span
                    className="text-[16px] 3xl:text-[18px] font-[500]"
                    style={{
                      color: active === "settings" ? "#443022" : "#8a8aa8",
                    }}
                  >
                    Settings
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Auth Profile */}
      <div className="w-full flex items-center justify-between sticky bottom-1 left-0 z-50 px-2 ">
        <div className="flex items-center gap-2">
          <div className="relative w-[2.7rem] h-[2.7rem] bg-gray-200 rounded-md">
            <Image
              src={
                auth?.user?.profileImage
                  ? auth?.user?.profileImage
                  : "/profile.png"
              }
              alt="user"
              className="rounded-full"
              width={50}
              height={50}
              layout="responsive"
              objectFit="cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-customBrown ">
              {auth?.user?.name}
            </span>
            <span className="text-[11px] font-medium text-gray-600 uppercase text-center">
              {auth?.user?.role}
            </span>
          </div>
        </div>
        {/* Logout */}
        <span>
          <IoLogOut
            className="h-6 w-6 cursor-pointer text-gray-600 hover:text-customBrown"
            onClick={logout}
          />
        </span>
      </div>
    </div>
  );
}
