import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";
 
import { style } from "../../utlis/CommonStyle";
import ReactQuill from "react-quill";
 
import { useSelector } from "react-redux";
 

export default function MeetingModal({
  setShowReminder,
  link,
  meetingId,
  fetchMeetingData,
  setMeetingId,
}) {
 
     const auth = useSelector((state => state.auth.auth));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [results, setResults] = useState("");
  // const [date, setDate] = useState("");
  // const [time, setTime] = useState("");

    const [scheduledAt, setScheduledAt] = useState("");
  const [color, setColor] = useState("#E85C0D");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [usersList, setUserList] = useState([]);

  console.log("userData:", userData);


  // Convert UTC string to local datetime-local format
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
};



  // Meeting Detail
  const meetingData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/meetings/meeting/detail/${meetingId}`
      );
      if (data) {
        console.log("THE METTING DATA IS",data)
        const meeting = data.meeting;
        setTitle(meeting.title);
        setDescription(meeting.description);
        setResults(meeting.results);


        setScheduledAt(formatDateForInput(meeting?.scheduledAt));
        


        setColor(meeting.color || "#E85C0D");
        setUserList(meeting.usersList);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    meetingData();
    // eslint-disable-next-line
  }, []);

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
  const handleMeeting = async (e) => {
    e.preventDefault();
    if (!usersList) {
      toast.error("Select at least one user!", { duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      if (meetingId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/meetings/update/meeting/${meetingId}`,
          {
            title,
            description,
            results,
            scheduledAt,
            color,
            redirectLink: link,
            usersList,
          }
        );
        if (data) {
          toast.success(data?.message);
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/meetings/create/meeting`,
          {
            title,
            description,
            results,
           scheduledAt,
            color,
            redirectLink: link,
            usersList,
          }
        );

        if (data) {
          toast.success(data?.message);
        }
      }
    } catch (error) {
      console.error("Error crete reminder:", error);
      toast.success(error.response?.data?.message);
    } finally {
      fetchMeetingData();
      setLoading(false);
      setShowReminder(false);
      // socketId.emit("reminder", {
      //   note: "New Reminder Added",
      // });
      // socketId.emit("notification", {
      //   note: "New Notification Added",
      // });
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
    <div className=" relative w-full  rounded-lg shadow-md bg-white">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">
          {meetingId ? "Edit Meeting" : "New Meeting"}
        </h1>
        <span
          onClick={() => {
            setMeetingId("");
            setShowReminder(false);
          }}
        >
          <IoClose className="h-7 w-7 cursor-pointer" />
        </span>
      </div>
      <form onSubmit={handleMeeting} className="  py-4 px-3 sm:px-4 mt-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={`${style.input} h-[3rem] w-full`}
                required
                style={{ padding: ".1rem .1rem" }}
              />
              <span>Color</span>
            </div>
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
              {/* <span>Date</span> */}
            </div>
            {/* <div className="inputBox">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`${style.input} w-full `}
                required
              />
 
            </div> */}
          </div>

          <div className="w-full h-[9rem]">
            <ReactQuill
              className={`w-full h-[10rem] rounded-lg `}
              placeholder="Description"
              style={{ height: "8rem" }}
              value={description}
              onChange={(value) => setDescription(value)}
              required
            />
          </div>

          <div className=" w-full h-[9rem] mt-[2rem] mb-[2rem]">
            <ReactQuill
              className={`w-full h-[10rem] rounded-lg  `}
              placeholder="Results"
              style={{ height: "8rem" }}
              value={results}
              onChange={(value) => setResults(value)}
            />
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
                <span>Submit</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
