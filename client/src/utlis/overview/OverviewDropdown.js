"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function OverviewDropdown({ setShowDropdown }) {
  const auth = useSelector((state) => state.auth.auth);

  const access = useMemo(() => {
    return auth?.user?.role?.access?.map((r) => r.permission.toLowerCase()) ?? [];
  }, [auth]);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getOverview = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/overview`);
      if (res.data?.success) setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching overview data!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getOverview();
  }, []);

  const items = [
    { key: "tasks", label: "My Tasks", count: data?.tasks?.tasksLength ?? 0, link: "/tasks" },
    { key: "jobs", label: "My Jobs", count: data?.jobs?.jobsLength ?? 0, link: "/job-planning" },
    { key: "tickets", label: "My Tickets", count: data?.tickets?.ticketsLength ?? 0, link: "/tickets" },
    { key: "leads", label: "My Leads", count: data?.leads?.leadsLength ?? 0, link: "/leads" },
  ].filter((item) => access.includes(item.key));

return (
  <div className="absolute left-0 mt-2 w-80 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200 z-[9999] overflow-hidden">
    {/* Header */}
    <div className="px-4 py-2 bg-gray-100 border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700   tracking-wide">
        Quick Overview
      </h3>
    </div>

    <div className="p-3 grid gap-2">
      {items.map((item) => (
        <Link
          key={item.key}
          to={item.link}
          onClick={() => setShowDropdown(false)}
          className="block group"
        >
          <div className="flex justify-between items-center py-1 px-3 bg-gray-50/60 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-white transition-all duration-200">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                {item.label}
              </span>
               
            </div>

            <div className="flex items-center justify-center">
              <span className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-blue-100 text-blue-700 shadow-inner min-w-[2.5rem] text-center">
                {isLoading ? (
                  <AiOutlineLoading3Quarters className="animate-spin inline-block" />
                ) : (
                  item.count
                )}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

}
