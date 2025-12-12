import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Timeline from "./Timeline";
import Summary from "./Summary";
import Activity from "./Activity";
import ScreenshotGallery from "./ScreenshotGallery";
import Filters from "./Filters";

export default function ScreenshotDashboard() {
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

  // ---------- Fetch All Users ----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );

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
        { params }
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
        { params }
      );

      setScreenshots(data);
    } catch (err) {
      console.error("❌ Failed to load screenshots:", err);
    } finally {
      setLoading(false);
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
            <Activity screenshots={screenshots} loading={loading} />
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
