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
    <div className="space-y-6 p-6  bg-slate-50">
      <Filters
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading screenshots...</p>
        </div>
      ) : (
        <>
          {
            screenshots.length > 0 && (
              <>
              <div className="w-full flex gap-8  justify-center items-stretch mb-2  py-4 ">
                <Summary screenshots={screenshots} timers={timers} />
          <Activity screenshots={screenshots} />
              </div>
          <Timeline screenshots={screenshots} />
          <ScreenshotGallery screenshots={screenshots} /></>)
          }

          {screenshots.length === 0 && (
            <div className="flex justify-center items-center h-64">
              <p>No screenshots found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
