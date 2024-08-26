import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import format from "date-fns/format";

export default function AddTaskModal({
  users,
  setIsOpen,
  projects,
  taskId,
  setTaskId,
  getAllTasks,
  taskDetal,
  setShowDetail,
}) {
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [jobHolder, setJobHolder] = useState("");
  const [task, setTask] = useState("");
  const [hours, setHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [lead, setLead] = useState("");
  const [label, setLabel] = useState("");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (taskDetal) {
      setProjectId(taskDetal.project._id);
      setProjectName(taskDetal.project.projectName);
      setJobHolder(taskDetal.jobHolder);
      setTask(taskDetal.task);
      setHours(taskDetal.hours);
      setStartDate(format(new Date(taskDetal.startDate), "yyyy-MM-dd"));
      setDeadline(format(new Date(taskDetal.deadline), "yyyy-MM-dd"));
      setLead(taskDetal.lead);
      setLabel(taskDetal.label);
    }
  }, [taskId, taskDetal]);

  // ---------Create / Update task---------
  const handleTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (taskId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/${taskId}`,
          {
            projectId,
            jobHolder,
            task,
            hours,
            startDate,
            deadline,
            lead,
            label,
          }
        );
        if (data?.success) {
          getAllTasks();
          setShowDetail(false);
          setLoading(false);
          setIsOpen(false);
          toast.success("Task Updated!");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/tasks/create/task`,
          {
            projectId,
            jobHolder,
            task,
            hours,
            startDate,
            deadline,
            lead,
            label,
          }
        );
        if (data?.success) {
          getAllTasks();
          setLoading(false);
          setIsOpen(false);
          toast.success("Task created successfully!");
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };
  return (
    <div className="w-[21rem] sm:w-[34rem] rounded-md shadow border flex flex-col gap-4 bg-white">
      <div className="flex items-center justify-between px-4 pt-2">
        <h1 className="text-[20px] font-semibold text-black">
          {taskId ? "Update Task" : "Add Task"}
        </h1>
        <span
          className=" cursor-pointer"
          onClick={() => {
            setTaskId("");
            setIsOpen(false);
          }}
        >
          <IoClose className="h-6 w-6 " />
        </span>
      </div>
      <hr className="h-[1px] w-full bg-gray-400 " />
      <div className="w-full py-2 px-4">
        <form onSubmit={handleTask} className="w-full flex flex-col gap-4 ">
          <select
            className={`${style.input}`}
            required
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option>Select Project</option>
            {projects &&
              projects?.map((project) => (
                <option
                  key={project._id}
                  value={project._id}
                  className=" flex items-center gap-1"
                >
                  {project?.projectName}
                </option>
              ))}
          </select>

          <select
            value={jobHolder}
            className={`${style.input}`}
            onChange={(e) => setJobHolder(e.target.value)}
          >
            <option>Select Job Holder</option>
            {users &&
              users?.map((user) => (
                <option
                  key={user._id}
                  value={user.name}
                  className=" flex items-center gap-1"
                >
                  {user?.name}
                </option>
              ))}
          </select>
          <input
            type="text"
            placeholder="Enter your task here..."
            className={`${style.input} w-full`}
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <input
            type="text"
            placeholder="Hours"
            className={`${style.input} w-full`}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
          <div className="inputBox">
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Start Date</span>
          </div>
          <div className="inputBox">
            <input
              type="date"
              placeholder="Deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Deadline</span>
          </div>
          <select
            value={lead}
            className={`${style.input}`}
            onChange={(e) => setLead(e.target.value)}
          >
            <option>Select Lead</option>
            {users &&
              users?.map((user) => (
                <option
                  key={user._id}
                  value={user.name}
                  className=" flex items-center gap-1"
                >
                  {user?.name}
                </option>
              ))}
          </select>
          <input
            type="text"
            placeholder="Lable"
            className={`${style.input} w-full`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className="flex items-center justify-end">
            <button
              className={`${style.button1} text-[15px] `}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>{taskId ? "Update" : "Create"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
