"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineMenuFold } from "react-icons/ai";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { LuLayoutDashboard } from "react-icons/lu";
import { BsBell, BsFileEarmarkText } from "react-icons/bs";
import { BsBriefcase } from "react-icons/bs";
import { BsCashCoin } from "react-icons/bs";
// import { TbBrandGoogleAnalytics } from "react-icons/tb";
// import { LiaUsersCogSolid } from "react-icons/lia";
// import { TbFileAnalytics } from "react-icons/tb";
import { GoGear } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { RiLogoutCircleLine } from "react-icons/ri";
import { MdTaskAlt } from "react-icons/md";
import { LiaClipboardListSolid } from "react-icons/lia";
import ProfileModal from "../Modals/ProfileModal";
import { FaUsers } from "react-icons/fa";

export default function Sidebar({ hide, setHide }) {
  const router = useNavigate();
  const { auth, setAuth, active, setActive } = useAuth();
  const navigate = useNavigate();
  const [isProfile, setIsProfile] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const pathArray = window.location.pathname.split("/");
    const fileIdFromPath = pathArray[1];
    setActive(fileIdFromPath);

    // exlint-disable-next-line
  }, [setActive]);

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/");
  };

  return (
    <div className="w-full h-screen py-2 ">
      <div className=" hidden sm:flex items-center justify-end pr-1 ">
        {hide ? (
          <AiOutlineMenuUnfold
            onClick={() => setHide(!hide)}
            className="h-5 w-5 cursor-pointer hover:text-orange-600 transition-all duration-150"
          />
        ) : (
          <AiOutlineMenuFold
            onClick={() => setHide(!hide)}
            className="h-5 w-5 cursor-pointer hover:text-orange-600 transition-all duration-150"
          />
        )}
      </div>
      {/*  */}
      <div className="relative w-full  py-3 h-screen pb-[2rem] overflow-y-auto message">
        <div className="relative w-full pb-[5rem]  flex flex-col gap-4 overflow-y-auto allMessages py-1 pr-1 message">
          {/* 1 */}
          <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/dashboard");
            }}
          >
            <div
              className="adminbtn absolute h-full sidebtn z-[20]" //
              style={{
                width: active === "dashboard" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
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
          {/* 2 */}
          <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/my_list");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "my_list" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <LiaClipboardListSolid
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "my_list" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <LiaClipboardListSolid
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "my_list" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "my_list" && "#fff" }}
                  >
                    My Lists
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* 3 */}
          <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/tasks");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "tasks" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <MdTaskAlt
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "tasks" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <MdTaskAlt
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "tasks" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "tasks" && "#fff" }}
                  >
                    Tasks
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* 4 */}
          <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/job-planning");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "job-planning" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <BsBriefcase
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "job-planning" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsBriefcase
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "job-planning" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "job-planning" && "#fff" }}
                  >
                    Jobs
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* 5 */}
          <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/blogs");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "blogs" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <BsFileEarmarkText
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "blogs" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsFileEarmarkText
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "blogs" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "blogs" && "#fff" }}
                  >
                    Tickets
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* 6 */}
          <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/notifications");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "notifications" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <BsBell
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "notifications" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsBell
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "notifications" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "notifications" && "#fff" }}
                  >
                    Leads
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* 7 */}
          <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/subscription");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "subscription" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <BsCashCoin
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "subscription" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsCashCoin
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "subscription" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400] "
                    style={{ color: active === "subscription" && "#fff" }}
                  >
                    Proposals
                  </span>
                </div>
              )}
            </div>
          </div>
          {/*  */}
          <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/subscription");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "subscription" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <BsCashCoin
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "subscription" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsCashCoin
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "subscription" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400] "
                    style={{ color: active === "subscription" && "#fff" }}
                  >
                    Sales
                  </span>
                </div>
              )}
            </div>
          </div>
          {/*  */}
          <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/subscription");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "subscription" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <BsCashCoin
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "subscription" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsCashCoin
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "subscription" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400] "
                    style={{ color: active === "subscription" && "#fff" }}
                  >
                    Templates
                  </span>
                </div>
              )}
            </div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <BsCashCoin
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "subscription" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsCashCoin
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "subscription" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400] "
                    style={{ color: active === "subscription" && "#fff" }}
                  >
                    Goals
                  </span>
                </div>
              )}
            </div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <BsCashCoin
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "subscription" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsCashCoin
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "subscription" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400] "
                    style={{ color: active === "subscription" && "#fff" }}
                  >
                    Subscription
                  </span>
                </div>
              )}
            </div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <BsCashCoin
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "subscription" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsCashCoin
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "subscription" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400] "
                    style={{ color: active === "subscription" && "#fff" }}
                  >
                    Recurring Tasks
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* HR */}

          {/* <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/user-analytics");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "user-analytics" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <LiaUsersCogSolid
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "user-analytics" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <LiaUsersCogSolid
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "user-analytics" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400] "
                    style={{ color: active === "user-analytics" && "#fff" }}
                  >
                    User Analytics
                  </span>
                </div>
              )}
            </div>
          </div> */}

          {/* 2 */}
          {/* <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/channel-analytics");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "channel-analytics" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <TbBrandGoogleAnalytics
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "channel-analytics" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <TbBrandGoogleAnalytics
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{
                      color: active === "channel-analytics" && "#fff",
                    }}
                  />
                  <span
                    className="text-[14px] font-[400] "
                    style={{
                      color: active === "channel-analytics" && "#fff",
                    }}
                  >
                    Channels Analytics
                  </span>
                </div>
              )}
            </div>
          </div> */}

          {/* 3 */}
          {/* <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/subscription-analytics");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "subscription-analytics" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <TbFileAnalytics
                  className="h-5 w-5 cursor-pointer ml-1"
                  style={{
                    color: active === "subscription-analytics" && "#fff",
                  }}
                />
              ) : (
                <div className="flex items-center gap-1">
                  <TbFileAnalytics
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{
                      color: active === "subscription-analytics" && "#fff",
                    }}
                  />
                  <span
                    className="text-[14px] font-[400] "
                    style={{
                      color: active === "subscription-analytics" && "#fff",
                    }}
                  >
                    Subscription Analytic
                  </span>
                </div>
              )}
            </div>
          </div> */}
          {/* 4 */}

          {/* <hr className="my-2" />
          <h4 className="text-[16] font-semibold px-2">Settings</h4> */}
          <div
            className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
            onClick={() => {
              router("/users");
            }}
          >
            <div
              className="adminbtn absolute h-full  sidebtn z-[20]"
              style={{
                width: active === "users" && "100%",
                background: `rgb(2, 68, 2)`,
              }}
            ></div>
            <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
              {hide ? (
                <FaUsers
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "users" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <FaUsers
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "users" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400] "
                    style={{ color: active === "users" && "#fff" }}
                  >
                    Users
                  </span>
                </div>
              )}
            </div>
          </div>

          {/*  */}
        </div>
      </div>
      {/* Profile Modal */}
      {isProfile && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-black/70 flex items-center justify-center py-6 px-4">
          <ProfileModal setIsProfile={setIsProfile} setIsActive={setIsActive} />
        </div>
      )}
    </div>
  );
}
