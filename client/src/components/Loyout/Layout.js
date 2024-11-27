import React, { useEffect, useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { useAuth } from "../../context/authContext";
import Spinner from "../../utlis/Spinner";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { IoCloseCircleOutline } from "react-icons/io5";
import axios from "axios";
import { Link } from "react-router-dom";
import socketIO from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

export default function Layout({ children }) {
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);
  const { auth } = useAuth();
  const [reminder1, setReminder1] = useState(null);
  const [reminder2, setReminder2] = useState(null);
  const [reminder3, setReminder3] = useState(null);
  const [reminderData, setReminderData] = useState(false);

  // Fetch reminders
  const getReminders = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/fetch/reminder`
      );
      const reminders = data.reminders;
      setReminderData(reminders);
      setReminder1(reminders[0] || null);
      setReminder2(reminders[1] || null);
      setReminder3(reminders[2] || null);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  // Delete reminder
  const deleteReminder = async (id, setReminderFn) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/delete/reminder/${id}`
      );
      setReminderFn(null);
      socketId.emit("reminder", {
        note: "New Reminder Added",
      });
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  useEffect(() => {
    getReminders();
  }, []);

  useEffect(() => {
    socketId.on("newReminder", () => {
      getReminders();
    });

    return () => {
      socketId.off("newReminder", getReminders);
    };
    // eslint-disable-next-line
  }, [socketId]);

  if (!auth?.token) {
    return <Spinner />;
  }

  const renderNotification = (reminder, setReminderFn) => {
    if (!reminder) return null;
    return (
      <div className="absolute bottom-4 bg-white border border-gray-200 right-2 z-[999] w-[20rem] sm:w-[25rem] rounded-md shadow-md drop-shadow-md min-h-[6rem] mb-4">
        <span
          className="cursor-pointer absolute top-2 right-2 z-10"
          onClick={() => deleteReminder(reminder._id, setReminderFn)}
        >
          <IoCloseCircleOutline className="text-[26px] text-gray-500 hover:text-gray-700" />
        </span>
        <h5 className=" relative text-[20px] text-start font-medium rounded-md text-white bg-orange-600  p-3 font-Poppins">
          Reminders
          <div className="absolute right-[8rem] top-[-3rem] animate-shake z-10">
            <img
              src="/reminder.png"
              alt="reminder"
              className="h-[7rem] w-[7rem]"
            />
          </div>
        </h5>
        <div className="flex flex-col gap-1">
          <p className="p-3 text-sm text-gray-900 font-semibold">
            {reminder.title}
          </p>
          <p className="p-3 text-sm text-gray-700">{reminder.description}</p>
        </div>
        <Link
          to={reminder.redirectLink}
          className="text-blue-500 text-sm underline p-3 block"
        >
          Go to Task
        </Link>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[111vh] overflow-hidden flex flex-col ">
      <Header reminderData={reminderData} deleteReminder={deleteReminder} />
      <div className=" w-full flex-1 gap-1 flex h-[100%]  fixed top-[3.8rem] left-[0rem] z-[1] overflow-hidden">
        {!show && (
          <div className=" flex sm:hidden  absolute top-2 left-3">
            <IoMenu
              onClick={() => setShow(true)}
              size={25}
              className="hover:text-blue-500 transition-all duration-150"
            />
          </div>
        )}
        <div
          className={`hidden sm:flex  transition-all duration-200 ${
            hide ? "w-[5rem]" : "w-[13rem]"
          }`}
        >
          <Sidebar hide={hide} setHide={setHide} />
        </div>
        {show && (
          <div className=" absolute top-0 left-0 flex  bg-white sm:hidden z-20 w-[13rem] pt-[2rem]  border-r-[2px]  border-gray-600">
            <div className="absolute top-2 right-3">
              <IoClose
                onClick={() => setShow(false)}
                size={25}
                className="hover:text-blue-500 transition-all duration-150"
              />
            </div>
            <Sidebar />
          </div>
        )}
        <div className="flex-[1.8] border-r-red-500  w-full h-[100%] pb-[3rem] pt-[2.5rem] overflow-y-auto hidden1   sm:pt-0 border-l-[2px]  ">
          {children}
        </div>
      </div>

      {/* Notification */}
      {/* Reminder Notifications */}
      {renderNotification(reminder1, setReminder1)}
      {renderNotification(reminder2, setReminder2)}
      {renderNotification(reminder3, setReminder3)}
      {/* <div className="absolute bottom-4 bg-white border border-gray-200 right-2 z-[999]  w-[20rem] sm:w-[25rem] rounded-md shadow-md drop-shadow-md min-h-[6rem]">
        <span
          className="cursor-pointer absolute top-2 right-2 z-10"
          onClick={() => deleteReminder()}
        >
          <IoCloseCircleOutline className="text-[26px] text-white" />
        </span>
        <h5 className=" relative text-[20px] text-start font-medium rounded-md text-white bg-orange-600  p-3 font-Poppins">
          Reminders
          <div className="absolute right-[8rem] top-[-3rem] animate-shake z-10">
            <img
              src="/reminder.png"
              alt="reminder"
              className="h-[7rem] w-[7rem]"
            />
          </div>
        </h5>
      </div> */}
    </div>
  );
}
