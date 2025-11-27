import React, { useEffect, useState } from "react";
import { AiOutlineMenuFold } from "react-icons/ai";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { LuLayoutDashboard } from "react-icons/lu";
import { BsFileEarmarkText } from "react-icons/bs";
import { BsBriefcase } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";

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
import { BiMessageError } from "react-icons/bi";
import { LuClock2 } from "react-icons/lu";


import axios from "axios";
import { MdCalendarMonth } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { FaUserTie } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { setActive } from "../../redux/slices/authSlice";
import {
  selectJobAssignedCount,
  selectTaskAssignedCount,
  selectTicketAssignedCount,
  selectTicketReceivedCount,
} from "../../redux/slices/notificationSlice";

export default function Sidebar({ hide, setHide }) {
  const router = useNavigate();

  const auth = useSelector((state) => state.auth.auth);
  const dispatch = useDispatch();
  const active = useSelector((state) => state.auth.active);

  const taskCount = useSelector(selectTaskAssignedCount);
  const jobCount = useSelector(selectJobAssignedCount);

  const ticketAssignedCount = useSelector(selectTicketAssignedCount);
  const ticketReceivedCount = useSelector(selectTicketReceivedCount);

  const [isProfile, setIsProfile] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const user = auth?.user;
  const [ticketNitification, setTicketNotification] = useState([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const pathArray = location.pathname.split("/");
    const fileIdFromPath = pathArray[1]; // index stays the same
    if (fileIdFromPath) {
      dispatch(setActive(fileIdFromPath));
    }
  }, [location.pathname, dispatch]);

  const hasAccess = (section) => {
    return user?.role?.access?.some((item) => item.permission === section);
  };

  const fetchTicketNotification = async () => {
    if (!auth) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/notification/ticket/notification/${auth.user.id}`
      );
      if (data) {
        setTicketNotification(data.notifications);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTicketNotification();
  }, [auth]);

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
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "dashboard"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black  hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden `}
              onClick={() => {
                router("/dashboard");
                dispatch(setActive("dashboard"));
              }}
            >
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <LuLayoutDashboard
                    className="h-6 w-6 cursor-pointer ml-2"
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
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "all"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/all/lists");
                dispatch(setActive("all"));
              }}
            >
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <LiaClipboardListSolid
                    className="h-6 w-6 cursor-pointer ml-2"
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
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  
                ${
                  active === "tasks"
                    ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                    : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
                } filter overflow-hidden`}
              onClick={() => {
                router("/tasks");
                dispatch(setActive("tasks"));
              }}
            >
              <div className="relative w-full h-full flex items-center justify-between px-3 z-30 bg-transparent">
                {/* Left side - Icon & Text */}
                {hide ? (
                  <FaTasks
                    className="h-6 w-6 cursor-pointer"
                    style={{ color: active === "tasks" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <FaTasks
                      className="h-5 w-5 cursor-pointer"
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

                {/* Right side - Count badge */}
                {taskCount > 0 && (
                  <span
                    title="New Assigned Tasks"
                    className={`w-[20px] h-[20px] text-[12px]  font-semibold rounded-full flex items-center justify-center
                    ${
                      active === "tasks"
                        ? "bg-white text-orange-600"
                        : "bg-orange-600 text-white"
                    }`}
                  >
                    {taskCount || 0}
                  </span>
                )}
              </div>
            </div>
          )}
          {/* 4 */}
          {hasAccess("Jobs") && (
            <div
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "job-planning"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/job-planning");
                dispatch(setActive("job-planning"));
              }}
            >
              <div className="relative w-full h-full flex items-center justify-between px-3 z-30 bg-transparent">
                {hide ? (
                  <BsBriefcase
                    className="h-6 w-6 cursor-pointer ml-2"
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

                {/* Right side - Count badge */}
                {jobCount > 0 && (
                  <span
                    title="New Assigned Jobs"
                    className={`w-[20px] h-[20px] text-[12px]  font-semibold rounded-full flex items-center justify-center
                    ${
                      active === "job-planning"
                        ? "bg-white text-orange-600"
                        : "bg-orange-600 text-white"
                    }`}
                  >
                    {jobCount || 0}
                  </span>
                )}
              </div>
            </div>
          )}



          {/* ---------Lead-------- */}
          {hasAccess("Leads") && (
            <div
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "leads"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/leads");
                dispatch(setActive("leads"));
              }}
            >
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <BiLayer
                    className="h-6 w-6 cursor-pointer ml-2"
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




          
          {/* --------Template------ */}
          {hasAccess("Templates") && (
            <div
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "templates"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/templates");
                dispatch(setActive("templates"));
              }}
            >
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <GoRepoTemplate
                    className="h-6 w-6 cursor-pointer ml-2"
                    style={{ color: active === "templates" && "#fff" }}
                  />
                ) : (
                  <div className=" relative flex items-center gap-2">
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



          {/* ------Ticket------ */}
          {hasAccess("Tickets") && (
            <div
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "tickets"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/tickets");
                dispatch(setActive("tickets"));
              }}
            >
              <div className="relative w-full h-full flex items-center justify-between px-2 z-30 bg-transparent">
                {hide ? (
                  <BsFileEarmarkText
                    className="h-6 w-6 cursor-pointer ml-2"
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
                    {/* {ticketNitification.length > 0 && (
                      <span className=" bg-orange-600 rounded-full w-[24px] h-[24px] text-[13px] text-white flex items-center justify-center ">
                        {ticketNitification && ticketNitification.length}
                      </span>
                    )} */}
                  </div>
                )}

                {/* Right side - Count badge */}

                <div className="flex items-center gap-1 ">
                  {ticketReceivedCount > 0 && (
                    <span
                      title="New Received Tickets"
                      className={`w-[20px] h-[20px] text-[12px]  font-semibold rounded-full flex items-center justify-center
                    ${
                      active === "tickets"
                        ? "bg-white text-blue-500"
                        : "bg-blue-500 text-white"
                    }`}
                    >
                      {ticketReceivedCount || 0}
                    </span>
                  )}

                  {ticketAssignedCount > 0 && (
                    <span
                      title="New Assigned Tickets"
                      className={`w-[20px] h-[20px] text-[12px]  font-semibold rounded-full flex items-center justify-center
                    ${
                      active === "tickets"
                        ? "bg-white text-orange-600"
                        : "bg-orange-600 text-white"
                    }`}
                    >
                      {ticketAssignedCount || 0}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}


          
          
          {/* ---------Proposal----- */}
          {hasAccess("Proposals") && (
            <div
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "proposals"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/proposals");
                dispatch(setActive("proposals"));
              }}
            >
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <LuClipboardSignature
                    className="h-6 w-6 cursor-pointer ml-2"
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
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "goals"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/goals");
                dispatch(setActive("goals"));
              }}
            >
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
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "timesheet"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/timesheet");
                dispatch(setActive("timesheet"));
              }}
            >
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <SlCalender
                    className="h-6 w-6 cursor-pointer ml-2"
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
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "subscriptions"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/subscriptions");
                dispatch(setActive("subscriptions"));
              }}
            >
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <FaRegCreditCard
                    className="h-6 w-6 cursor-pointer ml-2"
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

          {/* HR */}
          {hasAccess("HR") && (
            <>
              <div
                className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                  active === "hr"
                    ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                    : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
                }   filter   overflow-hidden`}
                onClick={() => {
                  router("/hr/tasks");
                  dispatch(setActive("hr"));
                }}
              >
                <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                  {hide ? (
                    <FaUserTie
                      className="h-6 w-6 cursor-pointer ml-2"
                      style={{ color: active === "hr" && "#fff" }}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaUserTie
                        className="h-5 w-5 cursor-pointer ml-2"
                        style={{ color: active === "hr" && "#fff" }}
                      />
                      <span
                        className="text-[14px] font-[400] "
                        style={{ color: active === "hr" && "#fff" }}
                      >
                        HR
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/*  */}
          {(hasAccess("Workflow") ||
            hasAccess("Roles") ||
            hasAccess("Users")) && <hr className="my-1" />}
          {hide ? (
            <>
              {(hasAccess("Workflow") ||
                hasAccess("Roles") ||
                hasAccess("Users")) && (
                <h4 className="text-[16] font-semibold px-2 flex items-center gap-1">
                  {" "}
                  <span>
                    <RiSettings4Fill className="h-7 w-7 text-gray-900" />
                  </span>
                </h4>
              )}
            </>
          ) : (
            <>
              {(hasAccess("Workflow") ||
                hasAccess("Roles") ||
                hasAccess("Users")) && (
                <h4
                  className={`text-[16px] font-semibold px-4 py-2 flex items-center justify-between transition-all cursor-pointer rounded-e-3xl ${
                    isSettingsOpen
                      ? "bg-orange-200"
                      : "bg-gray-100 hover:bg-orange-200 text-gray-800"
                  }`}
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                >
                  <div className="flex items-center gap-2">
                    <RiSettings4Fill className="h-6 w-6 text-gray-900" />
                    <span>Settings</span>
                  </div>

                  {/* Rotating Arrow */}
                  <IoIosArrowDown
                    className={`h-4 w-4 text-gray-700 transform transition-transform duration-300 ${
                      isSettingsOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </h4>
              )}
            </>
          )}

          {/* Meeting */}
          {isSettingsOpen && hasAccess("Meeting") && (
            <div
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "meetings"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden `}
              onClick={() => {
                router("/meetings");
                dispatch(setActive("meetings"));
              }}
            >
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <MdCalendarMonth
                    className="h-6 w-6 cursor-pointer ml-2"
                    style={{ color: active === "meetings" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <MdCalendarMonth
                      className="h-6 w-6 cursor-pointer ml-2"
                      style={{ color: active === "meetings" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400]"
                      style={{ color: active === "meetings" && "#fff" }}
                    >
                      Meeting
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Workflow */}
          {isSettingsOpen && hasAccess("Workflow") && (
            <div
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "workflow"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/workflow");
                dispatch(setActive("workflow"));
              }}
            >
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
          {/* Complaints */}
          {isSettingsOpen && hasAccess("Complaints") && (
            <div
              className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                active === "complaints"
                  ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                  : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
              }   filter   overflow-hidden`}
              onClick={() => {
                router("/complaints");
                dispatch(setActive("complaints"));
              }}
            >
              <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                {hide ? (
                  <BiMessageError
                    className="h-6 w-6 cursor-pointer ml-2"
                    style={{ color: active === "complaints" && "#fff" }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <BiMessageError
                      className="h-6 w-6 cursor-pointer ml-2"
                      style={{ color: active === "complaints" && "#fff" }}
                    />
                    <span
                      className="text-[14px] font-[400]"
                      style={{ color: active === "complaints" && "#fff" }}
                    >
                      Complaints
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/*  */}
          {isSettingsOpen && hasAccess("Roles") && (
            <>
              <div
                className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                  active === "roles"
                    ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                    : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
                }   filter   overflow-hidden`}
                onClick={() => {
                  router("/roles");
                  dispatch(setActive("roles"));
                }}
              >
                <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                  {hide ? (
                    <MdSecurity
                      className="h-6 w-6 cursor-pointer ml-2"
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

          {/* User Info */}
          {isSettingsOpen && hasAccess("Users") && (
            <>
              <div
                className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                  active === "users"
                    ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                    : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
                }   filter   overflow-hidden`}
                onClick={() => {
                  router("/users");
                  dispatch(setActive("users"));
                }}
              >
                <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                  {hide ? (
                    <FaUsers
                      className="h-6 w-6 cursor-pointer ml-2"
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
          {isSettingsOpen && (auth?.user?.role?.name === "Admin") && (
            <>
              <div
                className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                  active === "activity"
                    ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                    : "bg-gray-100 text-black hover:bg-orange-200 transition-all duration-300"
                }   filter   overflow-hidden`}
                onClick={() => {
                  router("/activity");
                  dispatch(setActive("activity"));
                }}
              >
                <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                  <div className="flex items-center gap-2">
                     
                      <LuClock2
                        className="h-5 w-5 cursor-pointer ml-2"
                        style={{ color: active === "activity" && "#fff" }}
                      />
                      <span
                        className="text-[14px] font-[400] "
                        style={{ color: active === "activity" && "#fff" }}
                      >
                        Activity
                      </span>
                    </div>
                </div>
              </div>
            </>
          )}















          {/* Template Editor */}
          {/* {hasAccess("Editor") && (
            <>
              <div
                className={`mainbtn relative h-[2.6rem] rounded-r-3xl cursor-pointer  ${
                  active === "editor"
                    ? "bg-orange-600 text-white drop-shadow-md shadow-md shadow-gray-300"
                    : "bg-gray-100 text-black  hover:bg-orange-200 transition-all duration-300"
                }   filter   overflow-hidden`}
                onClick={() => {
                  router("/editor/templates");
                }}
              >
                <div className="relative w-full h-full flex items-center px-2 z-30 bg-transparent">
                  {hide ? (
                    <MdDesignServices
                      className="h-6 w-6 cursor-pointer ml-2"
                      style={{ color: active === "editor" && "#fff" }}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MdDesignServices
                        className="h-5 w-5 cursor-pointer ml-2"
                        style={{ color: active === "editor" && "#fff" }}
                      />
                      <span
                        className="text-[14px] font-[400] "
                        style={{ color: active === "editor" && "#fff" }}
                      >
                        Editor
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )} */}

          {/* End */}
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
