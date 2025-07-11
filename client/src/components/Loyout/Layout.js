import React, { useEffect, useRef, useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { useAuth } from "../../context/authContext";
import Spinner from "../../utlis/Spinner";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { IoCloseCircleOutline } from "react-icons/io5";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import Draggable from "react-draggable";
import socketIO from "socket.io-client";
import toast from "react-hot-toast";
import { CgList } from "react-icons/cg";
import OverdueModal from "../../utlis/OverdueModal";


const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

export default function Layout({ children }) {
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);
  const { auth } = useAuth();
  const [reminderData, setReminderData] = useState([]);
  const [snoozeTimers, setSnoozeTimers] = useState({});
  const hours = [2, 3, 4, 5, 6, 7];
  const colors = [
    "bg-red-500 hover:bg-red-600",
    "bg-green-700 hover:bg-perple-800",
    "bg-lime-500 hover:bg-lime-600",
    "bg-yellow-500 hover:bg-yellow-600",
    "bg-indigo-500 hover:bg-indigo-600",
    "bg-orange-500 hover:bg-orange-600",
  ];
  const [showQuickList, setShowQuickList] = useState(false);
  const [quickListData, setQuickListData] = useState("");
  const [editId, setEditId] = useState("");

  // Security
  const secureKey = process.env.REACT_APP_SECURE_KEY;
  if (!secureKey || secureKey !== "salman@affotax") {
    document.body.innerHTML = "<h1>Unauthorized key access !</h1>";
    throw new Error("Unauthorized key access!");
  }


     const isInitialMount = useRef(true);
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const location = useLocation(); 


  const fetchRunningTimer = async () => {
    console.log("IN THE FETCH RUNNING TIMER", location.pathname);
    try {
      
      const {data} = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/timer/running-timer/${auth?.user?.id}`);

      const { _id, startTime, endTime, isRunning } = data.timer;

      console.log("Timer:", data.timer);

      if (startTime && !endTime) {
        setIsRunning(isRunning);
        const timeElapsed = Math.floor(
          (new Date() - new Date(startTime)) / 1000
        );
        setElapsedTime(timeElapsed);
      }

    } catch (error) {
      console.log(error)
    }

  }



useEffect(() => {

  const timer_running_in = localStorage.getItem('timer_in')

  if(location.pathname !== timer_running_in) {
    if (isInitialMount.current) {
      fetchRunningTimer();
      isInitialMount.current = false;
    }
    // console.log(isRunning)
  
    if (isRunning) {
      // console.log("INSIDE THE RUNNING VLOVKK")
      const hours = Math.floor(elapsedTime / 3600)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((elapsedTime % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (elapsedTime % 60).toString().padStart(2, "0");
      // setTime(`${hours}:${minutes}:${seconds}`);
      document.title = `${hours}:${minutes}:${seconds} ⏱`;
    } else {
      document.title = "Affotax-CRM";
    }


  }

  

}, [isRunning, elapsedTime]);

    // ---------Timer-------
    useEffect(() => {
      let intervalId;

      if (isRunning) {
        intervalId = setInterval(() => {
          setElapsedTime((prevTime) => prevTime + 1);
        }, 1000);
      }

      return () => clearInterval(intervalId);
    }, [isRunning]);






















  // Fetch reminders
  const getReminders = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/fetch/reminder`
      );
      // setReminderData(data.reminders);
      const currentTime = new Date();
      const activeReminders = data.reminders.filter((reminder) => {
        const [hours, minutes] = reminder.time.split(":").map(Number);
        const reminderTime = new Date(reminder.date);
        reminderTime.setHours(hours, minutes, 0);
        return reminderTime <= currentTime;
      });
      setReminderData(activeReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  // useEffect(() => {
  //   getReminders();
  // }, []);

  useEffect(() => {
    getReminders();
    // Load snoozed reminders from localStorage
    const snoozedReminders =
      JSON.parse(localStorage.getItem("snoozedReminders")) || [];
    const now = Date.now();

    const stillSnoozed = [];

    snoozedReminders.forEach(({ reminder, snoozeUntil }) => {
      if (snoozeUntil <= now) {
        // If the snooze time has passed, show the reminder
        setReminderData((prev) => [...prev, reminder]);
      } else {
        // If the reminder is still snoozed, keep it in the array and set a timeout
        const timeLeft = snoozeUntil - now;
        stillSnoozed.push({ reminder, snoozeUntil });

        const timer = setTimeout(() => {
          setReminderData((prev) => [...prev, reminder]);
          removeSnoozeFromStorage(reminder._id);
        }, timeLeft);

        setSnoozeTimers((prev) => ({
          ...prev,
          [reminder._id]: timer,
        }));
      }
    });

    // Update localStorage with reminders still snoozed
    localStorage.setItem("snoozedReminders", JSON.stringify(stillSnoozed));

    getReminders();

    socketId.on("newReminder", () => {
      getReminders();
    });

    return () => {
      socketId.off("newReminder");
      Object.values(snoozeTimers).forEach(clearTimeout);
    };
  }, []);

  const deleteReminder = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/delete/reminder/${id}`
      );
      setReminderData((prev) => prev.filter((reminder) => reminder._id !== id));
      socketId.emit("reminder", {
        note: "Reminder Deleted",
      });
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const snoozeReminder = (reminderId, duration) => {
    const reminder = reminderData.find((r) => r._id === reminderId);
    setReminderData((prev) => prev.filter((r) => r._id !== reminderId));

    const snoozeUntil = Date.now() + duration;
    addSnoozeToStorage(reminder, snoozeUntil);

    const timer = setTimeout(() => {
      setReminderData((prev) => [...prev, reminder]);
      removeSnoozeFromStorage(reminderId);
    }, duration);

    setSnoozeTimers((prev) => ({
      ...prev,
      [reminderId]: timer,
    }));
  };

  const addSnoozeToStorage = (reminder, snoozeUntil) => {
    const snoozedReminders =
      JSON.parse(localStorage.getItem("snoozedReminders")) || [];
    snoozedReminders.push({ reminder, snoozeUntil });
    localStorage.setItem("snoozedReminders", JSON.stringify(snoozedReminders));
  };

  const removeSnoozeFromStorage = (reminderId) => {
    const snoozedReminders =
      JSON.parse(localStorage.getItem("snoozedReminders")) || [];
    const updatedReminders = snoozedReminders.filter(
      ({ reminder }) => reminder._id !== reminderId
    );
    localStorage.setItem("snoozedReminders", JSON.stringify(updatedReminders));
  };

  // Get Quick List
  const getQuickList = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/quicklist/get/quicklist`
      );
      setQuickListData(data.quickList.description);
      setEditId(data.quickList._id);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getQuickList();
  }, [auth]);

  // Update Quick List
  const updateQuickList = async (e) => {
    e.preventDefault();
    setShowQuickList(false);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/quicklist/update/quicklist/${editId}`,
        { description: quickListData }
      );
      if (data) {
        getQuickList();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // const createQuickList = async (e) => {
  //   e.preventDefault();
  //   setShowQuickList(false);
  //   try {
  //     const { data } = await axios.post(
  //       `${process.env.REACT_APP_API_URL}/api/v1/quicklist/create/quicklist`,
  //       { description: quickListData }
  //     );
  //     if (data) {
  //       getQuickList();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error?.response?.data?.message);
  //   }
  // };

  // ----------------verify token-------------
  if (!auth?.token) {
    return <Spinner />;
  }

  const renderNotification = (reminder) => {
    if (!reminder) return null;
    return (
      <Draggable handle=".drag-handle">
        <div
          className="fixed inset-0 flex items-center justify-center z-[999]"
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{ pointerEvents: "all" }}
            className="relative bg-white border border-gray-200 z-[999] w-[20rem] sm:w-[29rem] rounded-md shadow-md drop-shadow-md min-h-[6rem] mb-4"
          >
            <span
              className="cursor-pointer absolute top-2 right-2 z-[9999]"
              onClick={() => deleteReminder(reminder._id)}
            >
              <IoCloseCircleOutline className="text-[26px] text-white hover:text-sky-500" />
            </span>
            <h5 className="drag-handle cursor-move relative text-[20px] text-start font-medium rounded-tl-md rounded-tr-md text-white bg-orange-600 p-3 font-Poppins">
              Reminders
              <div className="absolute right-[8rem] top-[-3rem] animate-shake z-10">
                <img
                  src="/reminder.png"
                  alt="reminder"
                  className="h-[7rem] w-[7rem]"
                />
              </div>
            </h5>
            <div className="flex flex-col gap-1 p-3">
              <p className=" text-sm text-gray-900 font-semibold">
                {reminder.title}
              </p>
              <div className="mx-h-[18rem] overflow-y-auto w-full overflow-hidden">
                <div
                  dangerouslySetInnerHTML={{
                    __html: reminder.description,
                  }}
                  className="whitespace-pre-wrap break-words px-2 py-2 w-full"
                ></div>
              </div>
            </div>
            <Link
              to={reminder.redirectLink}
              className="text-blue-500 hover:text-blue-600 text-sm underline p-3 block"
            >
              Go to Page
            </Link>
            <div className="flex items-center gap-2 flex-wrap p-3">
              <button
                className="bg-blue-500 text-[13px] text-white px-3 py-1 rounded hover:bg-blue-600"
                onClick={() => {
                  snoozeReminder(reminder._id, 5 * 60 * 1000);
                  deleteReminder(reminder._id);
                }}
              >
                Snooze 5m
              </button>
              <button
                className="bg-green-500 text-[13px] text-white px-3 py-1 rounded hover:bg-green-600"
                onClick={() => {
                  snoozeReminder(reminder._id, 15 * 60 * 1000);
                  deleteReminder(reminder._id);
                }}
              >
                Snooze 15m
              </button>
              <button
                className="bg-pink-500 text-[13px] text-white px-3 py-1 rounded hover:bg-pink-600"
                onClick={() => {
                  snoozeReminder(reminder._id, 30 * 60 * 1000);
                  deleteReminder(reminder._id);
                }}
              >
                Snooze 30m
              </button>
              <button
                className="bg-purple-500 text-[13px] text-white px-3 py-1 rounded hover:bg-purple-600"
                onClick={() => {
                  snoozeReminder(reminder._id, 60 * 60 * 1000);
                  deleteReminder(reminder._id);
                }}
              >
                Snooze 60m
              </button>
              {hours.map((hour, index) => (
                <button
                  key={hour}
                  className={`text-[13px] text-white px-3 py-1 rounded ${
                    colors[index % colors.length]
                  }`}
                  onClick={() => {
                    snoozeReminder(reminder._id, hour * 60 * 60 * 1000);
                    deleteReminder(reminder._id);
                  }}
                >
                  Snooze {hour}h
                </button>
              ))}
            </div>
          </div>
        </div>
      </Draggable>
    );
  };

  return (
<>
    <OverdueModal />
    <div className="relative w-full h-[111vh] overflow-hidden flex flex-col ">
      <Header
        reminderData={reminderData}
        deleteReminder={deleteReminder}
        setShowQuickList={setShowQuickList}
        showQuickList={showQuickList}
        getQuickList={getQuickList}
      />
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

      {/* Reminder Notifications */}
      {reminderData.map((reminder) => renderNotification(reminder))}

      {/* Quick List */}
      {showQuickList && (
        <Draggable handle=".drag-handle">
          <div className="fixed top-[4rem] right-[8rem] z-[999] w-[20rem] sm:w-[29rem] rounded-md shadow-md drop-shadow-md min-h-[14rem] mb-4 bg-gray-50">
            <div className="drag-handle flex items-center justify-between cursor-move relative rounded-tl-md rounded-tr-md text-white bg-orange-600 p-3 font-Poppins">
              <h5 className=" flex items-center gap-2  text-[20px] text-start font-medium ">
                <CgList className="h-6 w-6 text-white " /> Quick Lists
              </h5>
              <span
                className="cursor-pointer absolute top-2 right-2 z-[9999]"
                onClick={() => setShowQuickList(false)}
              >
                <IoCloseCircleOutline className="text-[28px] text-white mt-1 " />
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3">
              <div className="h-[16rem]  w-full overflow-hidden">
                <textarea
                  className="w-full h-[16rem] rounded-md resize-none py-1 px-2 rezise-none border-0 bg-transparent outline-none"
                  value={quickListData}
                  onChange={(e) => setQuickListData(e.target.value)}
                  placeholder="Add quick list here..."
                  onBlur={(e) => updateQuickList(e)}
                ></textarea>
              </div>
            </div>
          </div>
        </Draggable>
      )}
    </div>
    </>
  );
}
