import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { style } from "../../utlis/CommonStyle";
import { IoClose } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";

export default function AddTimerModal({
  setIsOpen,
  users,
  setTimerData,
  timerId,
  setTimerId,
  getAllTimeSheetData,
}) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [department, setDepartment] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [task, setTask] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const deparments = [
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ];
  const [activity, setActivity] = useState("");
  const options = ["Chargeable", "Non-Chargeable"];

  // Single Timer

  const getSingleTimer = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/single/timer/${timerId}`
      );
      const formattedDate = new Date(data.timer.date).toLocaleDateString(
        "en-CA"
      );
      const formattedStartTime = new Date(
        data.timer.startTime
      ).toLocaleTimeString("en-CA", { hour12: false });
      const formattedEndTime = new Date(data.timer.endTime).toLocaleTimeString(
        "en-CA",
        { hour12: false }
      );
      if (data) {
        setDate(formattedDate);
        setStartTime(formattedStartTime);
        setEndTime(formattedEndTime);
        setCompanyName(data.timer.companyName);
        setDepartment(data.timer.department);
        setClientName(data.timer.clientName);
        setProjectName(data.timer.projectName);
        setTask(data.timer.task);
        setNote(data.timer.note);
        setActivity(data.timer?.activity);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSingleTimer();

    // eslint-disable-next-line
  }, [timerId]);

  // Add/Update Timer Manual
  const handleAddTimer = async (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      toast.error("Date, Start time & End time is required!");
      return;
    }
    setLoading(true);

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      throw new Error("Invalid start or end time format");
    }

    const formattedStartTime = startDateTime.toISOString();
    const formattedEndTime = endDateTime.toISOString();

    try {
      if (timerId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/update/timer/${timerId}`,
          {
            date,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            department,
            clientName,
            projectName,
            task,
            note,
            companyName,
            activity,
          }
        );

        if (data.success) {
          const updateTimer = data.timer;
          setTimerData((prevData) => {
            if (Array.isArray(prevData)) {
              return prevData.map((item) =>
                item._id === updateTimer._id ? updateTimer : item
              );
            } else {
              return getAllTimeSheetData();
            }
          });
          setTimerId("");
          toast.success("Entry Updated successfully!");
          setIsOpen(false);
        }
      } else {
        // const startDateTimes = new Date(
        //   `${date}T${startTime}:00.000Z`
        // ).toISOString();
        // const endDateTimes = new Date(
        //   `${date}T${endTime}:00.000Z`
        // ).toISOString();

        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/add/timer/manually`,
          {
            date,
            startTime: startDateTime,
            endTime: endDateTime,
            department,
            clientName,
            projectName,
            task,
            note,
            activity,
            companyName,
          }
        );

        if (data.success) {
          setLoading(false);
          const timer = data.timer;
          setTimerData((prevData) => [...prevData, timer]);
          setIsOpen(false);
          toast.success("Timer Added successfully!");
          setDate("");
          setStartTime("");
          setEndTime("");
          setDepartment("");
          setClientName("");
          setCompanyName("");
          setProjectName("");
          setTask("");
          setNote("");
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className=" w-[21rem] sm:w-[40rem]  rounded-lg shadow-md bg-white">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">
          {timerId ? "Update Entry" : "Add Manual Entry"}
        </h1>
        <span
          onClick={() => {
            setIsOpen(false);
            setTimerId("");
          }}
        >
          <IoClose className="h-7 w-7 cursor-pointer" />
        </span>
      </div>
      <form onSubmit={handleAddTimer} className="  py-4 px-3 sm:px-4 mt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Start Time</span>
          </div>
          <div className="inputBox">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>End Time</span>
          </div>
          <div className="inputBox">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Company Name</span>
          </div>
          <div className="inputBox">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={`${style.input} w-full `}
            >
              <option value="">Select Deparment</option>
              {deparments?.map((depart, i) => (
                <option key={i} value={depart}>
                  {depart}
                </option>
              ))}
            </select>
          </div>
          <div className="inputBox">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Client Name</span>
          </div>
          {/* 3 */}
          <div className="inputBox">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Project Name</span>
          </div>
          <div className="inputBox">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Task</span>
          </div>
          <div className="inputBox">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Note</span>
          </div>
        </div>
        <div className="inputBox mt-4">
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className={`${style.input} w-full `}
          >
            <option value="">Select Activity</option>
            {options?.map((act, i) => (
              <option key={i} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full flex items-center justify-end mt-5">
          <div className="flex items-center justify-end">
            <button
              className={`${style.button1} text-[15px] `}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>{timerId ? "Update" : "Create"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
