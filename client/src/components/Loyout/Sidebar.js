"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineMenuFold } from "react-icons/ai";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { LuLayoutDashboard } from "react-icons/lu";
import { BsBell, BsFileEarmarkText } from "react-icons/bs";
import { BsBriefcase } from "react-icons/bs";
import { BsCashCoin } from "react-icons/bs";
import { GoGear } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { RiLogoutCircleLine } from "react-icons/ri";
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
          {/* {auth.user.access === undefined && auth.user.role !== "Admin" && ( )} */}
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

          {auth?.user?.access?.includes("ticket") && (
            <>
              {/* ------Ticket------ */}
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
              {/* --------Template------ */}
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
              {/* ---------Lead-------- */}
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
              {/* ---------Proposal----- */}
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
            </>
          )}

          {/* Timer Sheet */}
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
                <FaRegCreditCard
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "notifications" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <FaRegCreditCard
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "notifications" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "notifications" && "#fff" }}
                  >
                    Subscription
                  </span>
                </div>
              )}
            </div>
          </div>

          {/*  */}

          {auth.user.role === "Admin" && (
            <>
              <hr className="my-1" />
              <h4 className="text-[16] font-semibold px-2 flex items-center gap-1">
                {" "}
                <span>
                  <RiSettings4Fill className="h-7 w-7 text-gray-900 animate-spin" />
                </span>
                Settings
              </h4>{" "}
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
              {/* User Info */}
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
