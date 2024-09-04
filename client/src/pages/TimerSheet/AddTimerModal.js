import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { style } from "../../utlis/CommonStyle";
import { IoClose } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";

export default function AddTimerModal({ setIsOpen, users, setTimerData }) {
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

  // Add Timer Manual
  const handleAddTimer = async (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      toast.error("Date, Start time & End time is required!");
      return;
    }
    setLoading(true);

    const startDateTime = new Date(
      `${date}T${startTime}:00.000Z`
    ).toISOString();
    const endDateTime = new Date(`${date}T${endTime}:00.000Z`).toISOString();

    try {
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
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };
  return (
    <div className=" w-[21rem] sm:w-[40rem]  rounded-lg shadow-md bg-white">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">Add Manual Entry</h1>
        <span onClick={() => setIsOpen(false)}>
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
                <span>Create</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
