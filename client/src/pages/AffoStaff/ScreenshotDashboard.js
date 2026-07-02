import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Timeline from "./Timeline";
import Summary from "./Summary";
import Activity from "./Activity";
import ScreenshotGallery from "./ScreenshotGallery";
import Filters from "./Filters";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { hasSubrole, isAdmin } from "../../utlis/checkPermission";
import toast from "react-hot-toast";

export default function ScreenshotDashboard() {
  const {
    auth: { user },
  } = useSelector((state) => state.auth);

  const { isUserAdmin, hasAllPermission } = useMemo(
    () => ({
      isUserAdmin: isAdmin(user) || false,
      hasAllPermission: hasSubrole(user, "Activity", "All Users") || false,
    }),
    [user],
  );

  const [timers, setTimers] = useState([]);
  const [totalWorkedTimeInMins, setTotalWorkedTimeInMins] = useState(0);

  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  // ---- NEW FILTER SYSTEM ----
  const [filterType, setFilterType] = useState("day"); // "day" | "range"

  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [startDate, setStartDate] = useState(dayjs().startOf("day"));
  const [endDate, setEndDate] = useState(dayjs().endOf("day"));

  const [isExporting, setIsExporting] = useState(false);

  // ---------- Fetch All Users ----------
  const getAllUsers = async () => {
    let url = `${process.env.REACT_APP_API_URL}/api/v1/user/get/active/team`;
    if (isUserAdmin || hasAllPermission) {
      url = `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`;
    }

    try {
      const { data } = await axios.get(url);

      setUsers(data.users);

      if (!selectedUser && data.users.length > 0)
        setSelectedUser(data.users[0]._id);
    } catch (error) {
      console.error("❌ Failed to load users:", error);
    }
  };

  // ---------- Fetch Timers ----------
  const fetchTimers = async () => {
    if (!selectedUser) return;

    try {
      let params = {};

      if (filterType === "day") {
        params.date = selectedDate.format("YYYY-MM-DD");
      } else {
        params.startDate = startDate.format("YYYY-MM-DD");
        params.endDate = endDate.format("YYYY-MM-DD");
      }

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/agent/timers/${selectedUser}?includeRunning=true`,
        { params },
      );

      if (data.success) {
        setTotalWorkedTimeInMins(parseInt(data.totalWorkedTimeInMins));
      }
    } catch (err) {
      console.error("❌ Failed to load timers:", err);
    }
  };

  // ---------- Fetch Screenshots ----------
  const fetchScreenshots = async () => {
    if (!selectedUser) return;

    setLoading(true);

    try {
      let params = {};

      if (filterType === "day") {
        params.date = selectedDate.format("YYYY-MM-DD");
      } else {
        params.startDate = startDate.format("YYYY-MM-DD");
        params.endDate = endDate.format("YYYY-MM-DD");
      }

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/agent/screenshot/${selectedUser}`,
        { params },
      );

      setScreenshots(data);
    } catch (err) {
      console.error("❌ Failed to load screenshots:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportActivity = async () => {
    if (isExporting) {
      return;
    }
    setIsExporting(true);
    try {
      const params =
        filterType === "day"
          ? { filterType, date: selectedDate.format("YYYY-MM-DD") }
          : {
              filterType,
              startDate: startDate.format("YYYY-MM-DD"),
              endDate: endDate.format("YYYY-MM-DD"),
            };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/agent/export-activity/${selectedUser}`,
        { params, responseType: "blob" },
      );

      // Try to pull the filename the backend set, fall back to a default
      const disposition = response.headers["content-disposition"];
      const match = disposition?.match(/filename="([^"]+)"/);
      const filename = match?.[1] || "Activity_Report.xlsx";

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      try {
        if (
          err.response?.data instanceof Blob &&
          err.response.data.type.includes("application/json")
        ) {
          const text = await err.response.data.text();
          const json = JSON.parse(text);

          toast.error(json.message || "Failed to export activity report.");
        } else {
          toast.error(err.message || "Failed to export activity report.");
        }
      } catch {
        toast.error("Failed to export activity report.");
      }

      // console.error("Error while exporting activity report:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // ---------- Initial Load ----------
  useEffect(() => {
    getAllUsers();
  }, []);

  // ---------- Refetch on filter changes ----------
  useEffect(() => {
    fetchScreenshots();
    fetchTimers();
  }, [selectedUser, selectedDate, startDate, endDate, filterType]);

  // ---------- Render Dashboard ----------
  return (
    <div className="space-y-6 bg-slate-50 min-h-full">
      <Filters
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        filterType={filterType}
        setFilterType={setFilterType}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        handleExportActivity={handleExportActivity}
        isExporting={isExporting}
      />

      {screenshots.length > 0 && (
        <>
          <div className="w-full flex gap-8 justify-center items-stretch mb-2 py-4 ">
            <Summary
              screenshots={screenshots}
              timers={timers}
              loading={loading}
              totalWorkedTimeInMins={totalWorkedTimeInMins}
              selectedDate={selectedDate}
              startDate={startDate}
              endDate={endDate}
              filterType={filterType}
            />
            <Activity
              screenshots={screenshots}
              loading={loading}
              filterType={filterType}
            />
          </div>

          <ScreenshotGallery screenshots={screenshots} loading={loading} />
        </>
      )}

      {screenshots.length === 0 && (
        <div className="flex justify-center items-center h-64">
          {loading ? (
            <div className="flex justify-center items-center gap-2 py-10">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce"></div>
            </div>
          ) : (
            <p>No screenshots found.</p>
          )}
        </div>
      )}
    </div>
  );
}
