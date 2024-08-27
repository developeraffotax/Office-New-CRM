import React, { useEffect, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { style } from "../../utlis/CommonStyle";
import { IoClose } from "react-icons/io5";

export default function TimeSheet() {
  const { auth } = useAuth();
  const [timerData, setTimerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCompany, setSelectedComapany] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [active, setActive] = useState("");
  console.log("selectedUser:", selectedUser);

  //   Get All Timer Data
  const getAllTimeSheetData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/get/all/timers`
      );

      setTimerData(data.timers);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTimeSheetData();

    // eslint-disable-next-line
  }, []);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(data?.users.map((user) => ({ name: user.name, id: user._id })));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <div className=" relative w-full min-h-screen py-4 px-2 sm:px-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-semibold ">Timesheet</h1>
          </div>
          {/* Project Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setIsOpen(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Manual
            </button>
          </div>
        </div>
        {/* ---------------Filters---------- */}
        <div className="flex items-center flex-wrap gap-2 mt">
          {/* ------------Filter By User ---------*/}
          <div className="">
            <select
              value={selectedUser}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => setSelectedUser(e.target.value)}
              title="Filter by Users"
            >
              <option value="All">Filter By Employees</option>
              {users?.map((user, i) => (
                <option value={user?.name} key={i}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          {/* ------------Filter By Company Name----------- */}
          <div className="">
            <select
              value={selectedCompany}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => setSelectedComapany(e.target.value)}
              title="Filter by Company"
            >
              <option value="All">Filter By Company</option>
              {users?.map((user, i) => (
                <option value={user?.name} key={i}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          {/* ------------Filter By Department Name----------- */}
          <div className="">
            <select
              value={selectedDepartment}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => setSelectedDepartment(e.target.value)}
              title="Filter by Department"
            >
              <option value="All">Filter By Department</option>
              {users?.map((user, i) => (
                <option value={user?.name} key={i}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          {/* ------------Filter By Days----------- */}
          <div className="">
            <select
              value={selectedDay}
              className="w-[8.5rem] h-[2rem] rounded-md border-2 cursor-pointer border-gray-300  outline-none"
              onChange={(e) => setSelectedDay(e.target.value)}
              title="Filter by days"
            >
              <option value="All">-----</option>

              <option value="week">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
              onClick={() => {
                setActive("All");
                setSelectedUser("");
                setSelectedComapany(false);
                setSelectedDepartment(false);
                setSelectedDay(false);
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6  cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
