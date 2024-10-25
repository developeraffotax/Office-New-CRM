import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";

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

  const goalTypes = [
    "Increase Client",
    "Increase Fee",
    "Total Proposal",
    "Total Lead",
    "Lead Won",
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
        setJobHolder(data.goal.jobHolder);
        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);
        setAchievement(data.goal.achievement);
        setGoalType(data.goal.goalType);
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

        <div className="flex items-center justify-end ">
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
