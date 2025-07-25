import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { style } from "./CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import socketIO from "socket.io-client";
import { useAuth } from "../context/authContext";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

export default function Reminder({ setShowReminder, taskId, link }) {
  const { auth } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [date, setDate] = useState("");
  // const [time, setTime] = useState("");

  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [usersList, setUserList] = useState([]);

  console.log("usersList", usersList);

  // -------Get All Users-------->

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUserData(
        data?.users.map((user) => ({ _id: user._id, name: user.name }))
      );
      console.log("users", data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();

    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (auth.user) {
      const _id = auth.user.id;
      const name = auth.user.name;

      setUserList([{ _id, name }]);
    }
  }, [auth.user]);







  // Create Reminder
  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!usersList) {
      toast.error("Select at least one user!", { duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/reminders/create/reminder`,
        {
          taskId,
          title,
          description,
          scheduledAt,
          redirectLink: link,
          usersList,
        }
      );

      if (data) {
        toast.success(data?.message);
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

  //   Add Users
  const handleAddUser = (user) => {
    if (!Array.isArray(usersList)) {
      setUserList([user]);
      return;
    }
    if (usersList.some((existingUser) => existingUser._id === user._id)) {
      return toast.error("User already exists!");
    }
    setUserList([...usersList, user]);
  };

  //   Remove user
  const handleRemoveUser = (id) => {
    const newUsers = usersList.filter((user) => user._id !== id);

    setUserList(newUsers);
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
          {usersList?.length > 0 && (
            <div className="w-full flex items-center gap-4 flex-wrap border py-2 px-2 rounded-md border-gray-400">
              {usersList &&
                usersList.map((user) => (
                  <div
                    key={user?._id}
                    className="flex items-center gap-3 bg py-1 px-2 rounded-md text-white bg-purple-600"
                  >
                    <span className="text-white text-[15px]">{user?.name}</span>
                    <span
                      className="cursor-pointer bg-red-500/50 p-[2px] rounded-full hover:bg-red-500"
                      onClick={() => handleRemoveUser(user?._id)}
                    >
                      <IoClose className="h-4 w-4 " />
                    </span>
                  </div>
                ))}
            </div>
          )}
          <select
            value=""
            className={`${style.input}`}
            onChange={(e) => handleAddUser(JSON.parse(e.target.value))}
          >
            <option>Select User</option>
            {userData &&
              userData?.map((user) => (
                <option
                  key={user._id}
                  value={JSON.stringify({
                    _id: user._id,
                    name: user.name,
                  })}
                  className=" flex items-center gap-1"
                >
                  {user?.name}
                </option>
              ))}
          </select>
          <div className="inputBox">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${style.input} w-full `}
              required
            />
            <span>Title</span>
          </div>
          <div className="inputBox">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${style.input} w-full  resize-none`}
              style={{ height: "7rem" }}
              required
            />
            <span>Description</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="inputBox">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={`${style.input} w-full `}
                required
              />
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
