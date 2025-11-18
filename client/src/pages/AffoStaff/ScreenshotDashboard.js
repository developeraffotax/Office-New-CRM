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

  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());

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

  const fetchTimers = async () => {
    if (!selectedUser) return;

    try {
      const isoDate = selectedDate.format("YYYY-MM-DD");

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/agent/timers/${selectedUser}`,
        { params: { date: isoDate } }
      );

      setTimers(data);
    } catch (err) {
      console.error("❌ Failed to load timers:", err);
    }
  };

  // ---------- Fetch Screenshots ----------
  const fetchScreenshots = async () => {
    if (!selectedUser) return;
    setLoading(true);

    try {
      const isoDate = selectedDate.format("YYYY-MM-DD"); // send as YYYY-MM-DD
      const params = { date: isoDate };
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

  // ---------- Initial Data ----------
  useEffect(() => {
    getAllUsers();
  }, []);
  useEffect(() => {
    fetchScreenshots();
    fetchTimers();
  }, [selectedUser, selectedDate]);

  // ---------- Render Dashboard ----------
  return (
    <div className="space-y-6    bg-slate-50 min-h-full">
      <Filters
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {screenshots.length > 0 && (
        <>
          <div className="w-full flex gap-8  justify-center items-stretch mb-2  py-4 ">
            <Summary
              screenshots={screenshots}
              timers={timers}
              loading={loading}
            />
            <Activity screenshots={screenshots} loading={loading} />
          </div>
          {/* <Timeline screenshots={screenshots} /> */}
          <ScreenshotGallery screenshots={screenshots} loading={loading} />
        </>
      )}

      {screenshots.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <p>
            {loading ? (
              <div className="flex justify-center items-center gap-2 py-10">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <svg
                  className="w-40 h-40 mb-1"
                  viewBox="0 0 300 300"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="150" cy="150" r="120" fill="#f3f4f6" />

                  <rect
                    x="95"
                    y="80"
                    width="110"
                    height="140"
                    rx="10"
                    fill="#e5e7eb"
                  />
                  <rect
                    x="115"
                    y="105"
                    width="70"
                    height="12"
                    rx="6"
                    fill="#d1d5db"
                  />
                  <rect
                    x="115"
                    y="135"
                    width="50"
                    height="12"
                    rx="6"
                    fill="#d1d5db"
                  />
                  <rect
                    x="115"
                    y="165"
                    width="40"
                    height="12"
                    rx="6"
                    fill="#d1d5db"
                  />

                  <circle
                    cx="200"
                    cy="105"
                    r="20"
                    fill="none"
                    stroke="#9ca3af"
                    stroke-width="5"
                  />
                  <line
                    x1="214"
                    y1="119"
                    x2="230"
                    y2="135"
                    stroke="#9ca3af"
                    stroke-width="5"
                    stroke-linecap="round"
                  />

                  <circle cx="70" cy="110" r="6" fill="#d1d5db" />
                  <circle cx="230" cy="180" r="8" fill="#e5e7eb" />
                  <rect
                    x="65"
                    y="185"
                    width="20"
                    height="8"
                    rx="4"
                    fill="#e5e7eb"
                  />
                  <rect
                    x="215"
                    y="75"
                    width="15"
                    height="6"
                    rx="3"
                    fill="#e5e7eb"
                  />
                </svg>

                <p className="text-base font-medium opacity-90 animate-pulse">
                  No screenshots found.
                </p>
              </div>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
