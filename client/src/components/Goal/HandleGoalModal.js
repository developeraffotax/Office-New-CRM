import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import ReactQuill from "react-quill";

export default function HandleGoalModal({
  goalId,
  setGoalId,
  users,
  getGoals,
  setShow,
}) {
  const [subject, setSubject] = useState("");
  const [jobHolder, setJobHolder] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [achievement, setAchievement] = useState("");
  const [goalType, setGoalType] = useState("");
  const [loading, setLoading] = useState(false);
  const [achievedCount, setAchievedCount] = useState("");
  const [note, setNote] = useState("");
  const [userList, setUserList] = useState([]);

  const goalTypes = [
    "Target Lead Count",
    "Target Lead Value",
     "Target Proposal Count",
    "Target Proposal Value",
    "Increase Client",
    "Increase Fee",
    "Total Proposal",
    "Proposal Lead",
    "Proposal Client",
    "Total Lead",
    "Lead Won",
    "Lead Won Manual",
    "Affotax Clicks",
    "Affotax Impressions",
    "Job Prepared",
    "Job Review",
    "Job Filed",
    "Chargeable Time %",
    "Manual Goal",
  ];

  // Fetch Proposal

  const fetchGoals = async () => {
    if (!goalId) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/fetch/single/goals/${goalId}`
      );

      console.log("Single data:", data);
      const formattedStartDate = new Date(
        data.goal.startDate
      ).toLocaleDateString("en-CA");
      const formattedEndDate = new Date(data.goal.endDate).toLocaleDateString(
        "en-CA"
      );
      if (data) {
        setSubject(data.goal.subject);
        setJobHolder(data.goal.jobHolder._id);
        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);
        setAchievement(data.goal.achievement);
        setGoalType(data.goal.goalType);
        setAchievedCount(data.goal.achievedCount);
        setNote(data.goal.note);
        setUserList(data?.goal?.usersList);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchGoals();

    // eslint-disable-next-line
  }, [goalId]);

  //   Add Users
  const handleAddUser = (user) => {
    if (!Array.isArray(userList)) {
      setUserList([user]);
      return;
    }

    if (userList.some((existingUser) => existingUser._id === user._id)) {
      return toast.error("User already exists!");
    }
    setUserList([...userList, user]);
  };

  //   Remove user

  const handleRemoveUser = (id) => {
    const newUsers = userList.filter((user) => user._id !== id);

    setUserList(newUsers);
  };

  // Handle Proposal
  const handleGoal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (goalId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/goals/update/goal/${goalId}`,
          {
            subject,
            achievement,
            startDate,
            endDate,
            goalType,
            jobHolder,
            achievedCount,
            note,
            usersList: userList,
          }
        );

        if (data) {
          getGoals();
          setShow(false);
          setLoading(false);
          toast.success("Goal update successfully.");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/goals/post/goal`,
          {
            subject,
            achievement,
            startDate,
            endDate,
            goalType,
            jobHolder,
            achievedCount,
            note,
            usersList: userList,
          }
        );
        if (data) {
          getGoals();
          setShow(false);
          setLoading(false);
          toast.success("New goal added successfully.");
        }
      }
    } catch (error) {
      setLoading(false);

      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  return (
    <div className=" w-[21rem] sm:w-[40rem] max-h-[105vh] mt-[3rem] hidden1 overflow-y-auto rounded-lg shadow-md bg-white">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">
          {goalId ? "Update Goal" : "Add Goal"}
        </h1>
        <span
          onClick={() => {
            setShow(false);
            setGoalId("");
          }}
        >
          <IoClose className="h-7 w-7 cursor-pointer" />
        </span>
      </div>
      <form
        onSubmit={handleGoal}
        className="  py-4 px-3 sm:px-4 mt-3 flex flex-col gap-4 w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="inputBox">
            <select
              value={jobHolder}
              onChange={(e) => setJobHolder(e.target.value)}
              className={`${style.input} w-full `}
              required
            >
              <option value="">Select Jobholder</option>
              {users?.map((user, i) => (
                <option key={i} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="inputBox">
            <input
              type="number"
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Target</span>
          </div>
        </div>
        <div className="inputBox">
          <textarea
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={`${style.input} w-full h-[4rem]`}
          />
          <span>Subject</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="inputBox">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Start Date</span>
          </div>
          <div className="inputBox">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>End Date</span>
          </div>
        </div>
        {/* ------------- */}
        {userList?.length > 0 && (
          <div className="w-full flex items-center gap-4 flex-wrap border py-2 px-2 rounded-md border-gray-400">
            {userList &&
              userList.map((user) => (
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
          {users &&
            users?.map((user) => (
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
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className={`${style.input} w-full `}
            >
              <option value="">Select Goal Type</option>
              {goalTypes?.map((goal, i) => (
                <option key={i} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </div>
          {goalType === "Manual Goal" && (
            <div className="inputBox">
              <input
                type="number"
                value={achievedCount}
                onChange={(e) => setAchievedCount(e.target.value)}
                className={`${style.input} w-full `}
              />
              <span>Target Achieved</span>
            </div>
          )}
        </div>

        {/*------------ Desciption----------- */}
        <ReactQuill
          theme="snow"
          modules={modules}
          formats={formats}
          className="rounded-md relative min-h-[11rem] max-[28rem] h-[10rem] 2xl:h-[14rem]"
          value={note}
          onChange={setNote}
        />

        <div className="flex items-center justify-end mt-[3rem] ">
          <button
            disabled={loading}
            className={`${style.button1} text-[15px] `}
            type="submit"
            style={{ padding: ".4rem 1rem" }}
          >
            {loading ? (
              <TbLoader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <span>{goalId ? "Update" : "Create"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
