import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { style } from "./CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import socketIO from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

export default function Reminder({ setShowReminder, taskId, link }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  // Create Reminder
  const handleCreateReminder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/create/reminder`,
        { taskId, title, description, date, time, redirectLink: link }
      );

      if (data) {
        toast.success("Reminder created successfully!");
        setShowReminder(false);
        socketId.emit("reminder", {
          note: "New Reminder Added",
        });
      }
    } catch (error) {
      console.error("Error crete reminder:", error);
      toast.success(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" relative w-[21rem] sm:w-[40rem]  rounded-lg shadow-md bg-white">
      <div className="absolute right-[7rem] top-[-5rem] animate-shake z-10">
        <img
          src="/reminder.png"
          alt="reminder"
          className="h-[10rem] w-[10rem]"
        />
      </div>
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">Add Reminder</h1>
        <span
          onClick={() => {
            setShowReminder(false);
          }}
        >
          <IoClose className="h-7 w-7 cursor-pointer" />
        </span>
      </div>
      <form
        onSubmit={handleCreateReminder}
        className="  py-4 px-3 sm:px-4 mt-3"
      >
        <div className="flex flex-col gap-4">
          <div className="inputBox">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Title</span>
          </div>
          <div className="inputBox">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${style.input} w-full  resize-none`}
              style={{ height: "7rem" }}
            />
            <span>Description</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="inputBox">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${style.input} w-full `}
              />
              <span>Date</span>
            </div>
            <div className="inputBox">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`${style.input} w-full `}
              />
              <span>Time</span>
            </div>
          </div>

          <div className="flex items-center justify-end w-full">
            <button
              className={`${style.button1} text-[15px] `}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>Create</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
