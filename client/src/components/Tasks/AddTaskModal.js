import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import format from "date-fns/format";
import socketIO from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

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
  const [recurring, setRecurring] = useState("");
  const [nextRecurringDate, setNextRecurringDate] = useState("");
  const [deleteCompletedRecurringSubtasks, setDeleteCompletedRecurringSubtasks] = useState(false);

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
      setRecurring(taskDetal.recurring);
      setNextRecurringDate(
        format(new Date(taskDetal.nextRecurringDate), "yyyy-MM-dd")
      );
      setDeleteCompletedRecurringSubtasks(taskDetal?.deleteCompletedRecurringSubtasks )
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
            recurring,
            nextRecurringDate,
            deleteCompletedRecurringSubtasks
          }
        );
        if (data) {
          setShowDetail(false);
          setLoading(false);
          setIsOpen(false);
          toast.success("Task Updated!");
          // Send Socket Notification
          socketId.emit("notification", {
            title: "Task  Updated",
          });
          getAllTasks();
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
            recurring,
            nextRecurringDate,
            deleteCompletedRecurringSubtasks
          }
        );
        if (data) {
          setLoading(false);
          setIsOpen(false);
          toast.success("Task created successfully!");
          // Send Socket Notification
          socketId.emit("notification", {
            title: "Task  added",
          });
          getAllTasks();
        }
      }
      // Send Socket
      socketId.emit("addTask", {
        note: "New Task Added",
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
      // toast.error(error?.response?.data?.message);
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
          <select
            value={recurring}
            onChange={(e) => setRecurring(e.target.value)}
            className={`${style.input}`}
          >
            <option value="">Select Recurring</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <div className="inputBox">
            <input
              type="date"
              value={nextRecurringDate}
              onChange={(e) => setNextRecurringDate(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Recurring Date</span>
          </div>

         
          <div className=" flex items-start justify-start w-full gap-2">
            <div className="flex items-center   cursor-pointer relative"  >
              
              <input id="deleteCompletedRecurringSubtasks" type="checkbox" checked={deleteCompletedRecurringSubtasks} onChange={(e) => setDeleteCompletedRecurringSubtasks(e.target.checked)} className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded   hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600" />
              <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1" > <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" ></path> </svg> </span>
            </div>
              <label htmlFor="deleteCompletedRecurringSubtasks" className="cursor-pointer">Delete Completed Subtasks</label>
          </div>


          



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
