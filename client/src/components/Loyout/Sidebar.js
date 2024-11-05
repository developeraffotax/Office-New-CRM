"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineMenuFold } from "react-icons/ai";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { LuLayoutDashboard } from "react-icons/lu";
import { BsFileEarmarkText } from "react-icons/bs";
import { BsBriefcase } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { MdTaskAlt } from "react-icons/md";
import { LiaClipboardListSolid } from "react-icons/lia";
import ProfileModal from "../Modals/ProfileModal";
import { FaUsers } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { GoRepoTemplate } from "react-icons/go";
import { BiLayer } from "react-icons/bi";
import { FaRegCreditCard } from "react-icons/fa6";
import { LuClipboardSignature } from "react-icons/lu";
import { MdSecurity } from "react-icons/md";
import { RiSettings4Fill } from "react-icons/ri";
import { GoGoal } from "react-icons/go";
import { FaTasks } from "react-icons/fa";
import { LiaNetworkWiredSolid } from "react-icons/lia";

export default function Sidebar({ hide, setHide }) {
  const router = useNavigate();
  const { auth, setAuth, active, setActive } = useAuth();
  const navigate = useNavigate();
  const [isProfile, setIsProfile] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const user = auth?.user;

  useEffect(() => {
    const pathArray = window.location.pathname.split("/");
    const fileIdFromPath = pathArray[1];
    setActive(fileIdFromPath);

    // exlint-disable-next-line
  }, [setActive]);

  // Access
  // const hasAccess = (section) => {
  //   return user?.role?.access?.map((item) => item.permission === section);
  // };

  const hasAccess = (section) => {
    return user?.role?.access?.some((item) => item.permission === section);
  };

  // const handleLogout = () => {
  //   setAuth({ ...auth, user: null, token: "" });
  //   localStorage.removeItem("auth");
  //   navigate("/");
  // };

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
          {hasAccess("Dashboard") && (
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
          )}
          {/* 2 */}
          {hasAccess("MyList") && (
            <div
              className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
              onClick={() => {
                router("/all/lists");
              }}
            >
              <div
                className="adminbtn absolute h-full  sidebtn z-[20]"
                style={{
                  width: active === "all" && "100%",
                  background: `rgb(2, 68, 2)`,
                }}
              ></div>
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <LiaClipboardListSolid
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "all" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <LiaClipboardListSolid
                      className="h-5 w-5 cursor-pointer ml-2"
                      style={{ color: active === "all" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400]"
                      style={{ color: active === "all" && "#fff" }}
                    >
                      My Lists
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* 3 */}
          {hasAccess("Tasks") && (
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
                  <FaTasks
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "tasks" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <FaTasks
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
          )}
          {/* 4 */}
          {hasAccess("Jobs") && (
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
          )}
          {/* ------Ticket------ */}
          {hasAccess("Tickets") && (
            <div
              className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
              onClick={() => {
                router("/tickets");
              }}
            >
              <div
                className="adminbtn absolute h-full  sidebtn z-[20]"
                style={{
                  width: active === "tickets" && "100%",
                  background: `rgb(2, 68, 2)`,
                }}
              ></div>
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <BsFileEarmarkText
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "tickets" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <BsFileEarmarkText
                      className="h-5 w-5 cursor-pointer ml-2"
                      style={{ color: active === "tickets" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400]"
                      style={{ color: active === "tickets" && "#fff" }}
                    >
                      Tickets
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* --------Template------ */}
          {hasAccess("Templates") && (
            <div
              className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
              onClick={() => {
                router("/templates");
              }}
            >
              <div
                className="adminbtn absolute h-full  sidebtn z-[20]"
                style={{
                  width: active === "templates" && "100%",
                  background: `rgb(2, 68, 2)`,
                }}
              ></div>
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <GoRepoTemplate
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "templates" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <GoRepoTemplate
                      className="h-5 w-5 cursor-pointer ml-2"
                      style={{ color: active === "templates" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400] "
                      style={{ color: active === "templates" && "#fff" }}
                    >
                      Templates
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ---------Lead-------- */}
          {hasAccess("Leads") && (
            <div
              className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
              onClick={() => {
                router("/leads");
              }}
            >
              <div
                className="adminbtn absolute h-full  sidebtn z-[20]"
                style={{
                  width: active === "leads" && "100%",
                  background: `rgb(2, 68, 2)`,
                }}
              ></div>
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <BiLayer
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "leads" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <BiLayer
                      className="h-5 w-5 cursor-pointer ml-2"
                      style={{ color: active === "leads" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400] "
                      style={{ color: active === "leads" && "#fff" }}
                    >
                      Leads
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ---------Proposal----- */}
          {hasAccess("Proposals") && (
            <div
              className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
              onClick={() => {
                router("/proposals");
              }}
            >
              <div
                className="adminbtn absolute h-full  sidebtn z-[20]"
                style={{
                  width: active === "proposals" && "100%",
                  background: `rgb(2, 68, 2)`,
                }}
              ></div>
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <LuClipboardSignature
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "proposals" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <LuClipboardSignature
                      className="h-5 w-5 cursor-pointer ml-2"
                      style={{ color: active === "proposals" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400] "
                      style={{ color: active === "proposals" && "#fff" }}
                    >
                      Proposals
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ---------Goals----- */}
          {hasAccess("Goals") && (
            <div
              className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
              onClick={() => {
                router("/goals");
              }}
            >
              <div
                className="adminbtn absolute h-full  sidebtn z-[20]"
                style={{
                  width: active === "goals" && "100%",
                  background: `rgb(2, 68, 2)`,
                }}
              ></div>
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <GoGoal
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "goals" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <GoGoal
                      className="h-5 w-5 cursor-pointer ml-2"
                      style={{ color: active === "goals" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400] "
                      style={{ color: active === "goals" && "#fff" }}
                    >
                      Goals
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Timer Sheet */}
          {hasAccess("Timesheet") && (
            <div
              className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
              onClick={() => {
                router("/timesheet");
              }}
            >
              <div
                className="adminbtn absolute h-full  sidebtn z-[20]"
                style={{
                  width: active === "timesheet" && "100%",
                  background: `rgb(2, 68, 2)`,
                }}
              ></div>
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <SlCalender
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "timesheet" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <SlCalender
                      className="h-5 w-5 cursor-pointer ml-2"
                      style={{ color: active === "timesheet" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400]"
                      style={{ color: active === "timesheet" && "#fff" }}
                    >
                      TimeSheet
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Subscription */}
          {hasAccess("Subscription") && (
            <div
              className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
              onClick={() => {
                router("/subscriptions");
              }}
            >
              <div
                className="adminbtn absolute h-full  sidebtn z-[20]"
                style={{
                  width: active === "subscriptions" && "100%",
                  background: `rgb(2, 68, 2)`,
                }}
              ></div>
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <FaRegCreditCard
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "subscriptions" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <FaRegCreditCard
                      className="h-5 w-5 cursor-pointer ml-2"
                      style={{ color: active === "subscriptions" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400]"
                      style={{ color: active === "subscriptions" && "#fff" }}
                    >
                      Subscription
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/*  */}
          <hr className="my-1" />
          {hide ? (
            <h4 className="text-[16] font-semibold px-2 flex items-center gap-1">
              {" "}
              <span>
                <RiSettings4Fill className="h-7 w-7 text-gray-900" />
              </span>
            </h4>
          ) : (
            <h4 className="text-[16] font-semibold px-2 flex items-center gap-1">
              {" "}
              <span>
                <RiSettings4Fill className="h-7 w-7 text-gray-900" />
              </span>
              Settings
            </h4>
          )}
          {/* Workflow */}
          {hasAccess("Workflow") && (
            <div
              className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
              onClick={() => {
                router("/workflow");
              }}
            >
              <div
                className="adminbtn absolute h-full  sidebtn z-[20]"
                style={{
                  width: active === "workflow" && "100%",
                  background: `rgb(2, 68, 2)`,
                }}
              ></div>
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <LiaNetworkWiredSolid
                    className="h-6 w-6 cursor-pointer ml-2"
                    style={{ color: active === "workflow" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <LiaNetworkWiredSolid
                      className="h-6 w-6 cursor-pointer ml-2"
                      style={{ color: active === "workflow" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400]"
                      style={{ color: active === "workflow" && "#fff" }}
                    >
                      Workflow
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {hasAccess("Roles") && (
            <>
              <div
                className=" mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer shadow-sm shadow-gray-300 bg-gray-200  filter drop-shadow-md  overflow-hidden"
                onClick={() => {
                  router("/roles");
                }}
              >
                <div
                  className="adminbtn absolute h-full  sidebtn z-[20]"
                  style={{
                    width: active === "roles" && "100%",
                    background: `rgb(2, 68, 2)`,
                  }}
                ></div>
                <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                  {hide ? (
                    <MdSecurity
                      className="h-5 w-5 cursor-pointer ml-2"
                      style={{ color: active === "roles" && "#fff" }}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MdSecurity
                        className="h-5 w-5 cursor-pointer ml-2"
                        style={{ color: active === "roles" && "#fff" }}
                      />
                      <span
                        className="text-[14px] font-[400] "
                        style={{ color: active === "roles" && "#fff" }}
                      >
                        Roles
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {hasAccess("Users") && (
            <>
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
            </>
          )}
          {/* User Info */}
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
