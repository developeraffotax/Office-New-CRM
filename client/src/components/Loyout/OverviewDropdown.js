"use client";
import { useState, useRef, useEffect, useMemo } from "react";

import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { CiViewTimeline } from "react-icons/ci";
import {
  MdOutlineTaskAlt,
  MdOutlineWorkOutline,
  MdConfirmationNumber,
} from "react-icons/md";
import { useSelector } from "react-redux";

export default function OverviewDropdown() {
  const auth = useSelector((state) => state.auth.auth);
   
 

  const access = useMemo(() => {

    if (auth.user) {
      return  auth.user.role.access.map((role) => role.permission.toLowerCase());
    }


  }, [auth])


  console.log(access, "the access from overview dropdown");
 

  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  const [data, setData] = useState(null);

  const getOverview = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/overview`
      );

      console.log(data, "the overview data");

      if (data?.success) {
        setData(data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in getting overview data!");
    }
  };

  useEffect(() => {
    getOverview();
  }, []);

 



  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="relative inline-block mt-2" ref={wrapperRef}>
      {/* Trigger Button */}
      <button onClick={() => setShowDropdown((prev) => !prev)} title="Quick Overview">
        <CiViewTimeline
          className={`w-7 h-7    transition-all duration-200   ${
            showDropdown ? "  text-orange-600 " : "  text-black"
          }`}
        />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-72 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50/60">
            Quick Overview
          </div>

          <div className="divide-y divide-gray-100">
            {/* Section Template */}
            {[
              {
                key: "tasks",
                title: "Tasks",
                icon: <MdOutlineTaskAlt className="w-4 h-4 text-blue-500" />,
                items: [
                  {
                    label: "Active",
                    count: data?.tasks?.tasksLength ?? 0,
                    color: "blue",
                    link: "/tasks",
                  },
                  {
                    label: "Completed",
                    count: data?.tasks?.completedTasksLength ?? 0,
                    color: "green",
                    link: "/tasks?completed=true",
                  },
                ],
              },
              {
                key: "jobs",
                title: "Jobs",
                icon: (
                  <MdOutlineWorkOutline className="w-4 h-4 text-purple-500" />
                ),
                items: [
                  {
                    label: "Active",
                    count: data?.jobs?.jobsLength ?? 0,
                    color: "blue",
                    link: "/job-planning",
                  },
                  {
                    label: "Completed",
                    count: data?.jobs?.completedJobsLength ?? 0,
                    color: "green",
                    link: "/job-planning?completed=true",
                  },
                ],
              },
              {
                key: "tickets",
                title: "Tickets",
                icon: (
                  <MdConfirmationNumber className="w-4 h-4 text-orange-500" />
                ),
                items: [
                  {
                    label: "Active",
                    count: data?.tickets?.ticketsLength ?? 0,
                    color: "blue",
                    link: "/tickets",
                  },
                  {
                    label: "Completed",
                    count: data?.tickets?.completedTicketsLength ?? 0,
                    color: "green",
                    link: "/tickets/complete",
                  },
                ],
              },
            ]
              // ✅ filter sections based on role access
              .filter((section) => access.includes(section.key))
              .map((section) => (
                <div key={section.title} className="p-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </h4>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <Link
                        key={item.label}
                        to={item.link}
                        onClick={() => setShowDropdown(false)}
                      >
                        <li className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer m-0">
                          <span className="text-gray-800 text-sm">
                            {item.label}
                          </span>
                          <span
                            className={`px-3 py-1 text-sm font-bold rounded-lg shadow-sm
                  ${
                    item.color === "blue"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }
                `}
                          >
                            {item.count}
                          </span>
                        </li>
                      </Link>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
