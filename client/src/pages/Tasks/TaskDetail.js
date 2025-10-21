import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { GoClockFill, GoGoal } from "react-icons/go";
import { MdDateRange } from "react-icons/md";
import { RiTimerLine } from "react-icons/ri";
import { format } from "date-fns";
import Loader from "../../utlis/Loader";
import { Timer } from "../../utlis/Timer";

import { FaRegUser } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import Swal from "sweetalert2";
import { MdCheckCircle } from "react-icons/md";
import AddTaskModal from "../../components/Tasks/AddTaskModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RiLoaderFill } from "react-icons/ri";
import { BiBellPlus } from "react-icons/bi";
import { BiSolidBellPlus } from "react-icons/bi";

import Reminder from "../../utlis/Reminder";
import { RxPerson } from "react-icons/rx";
import { useSelector } from "react-redux";
import { FiClock } from "react-icons/fi";
import { BsCalendarDate, BsCalendarDateFill } from "react-icons/bs";
import DetailComments from "./TaskDetailComments";

export default function TaskDetail({
  taskId,
  getAllTasks,
  handleDeleteTask,
  setTasksData,
  setShowDetail,
  users,
  projects,
  setFilterData,
  tasksData,
  assignedPerson,
  setTaskIdForNote,
}) {
  const auth = useSelector((state) => state.auth.auth);
  const anyTimerRunning = useSelector((state) => state.auth.anyTimerRunning);

  const timerRef = useRef();
  const initialLoad = useRef(true);

  const [taskDetal, setTaskDetal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("subtasks");

  console.log("THE TASK DETAIL:💚", taskDetal);

  const [isOpen, setIsOpen] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState("");
  const [subTask, setSubtask] = useState("");
  const [subTaskLoading, setSubTaskLoading] = useState(false);
  const [subTaskData, setSubTaskData] = useState([]);
  const [timerId, setTimerId] = useState("");
  const [showReminder, setShowReminder] = useState(false);

  const [showMoveProject, setShowMoveProject] = useState(false);
  const [usersTasksArr, setUsersTasksArr] = useState([]);

  // ---------Getting the task of specific person  ----------->
  useEffect(() => {
    setUsersTasksArr(
      tasksData?.filter((item) => item?.jobHolder === assignedPerson)
    );
  }, []);

  const moveSubtask = async (subtask, fromTask, toTask, subTaskIdToDlt) => {
    console.log("subtask:", subtask);
    console.log("fromTask:", fromTask);
    console.log("toTask:", toTask);

    try {
      const createPromise = axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/create/subTask/${toTask}`,
        { subTask: subtask }
      );
      const deletePromise = axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/delete/subtask/${fromTask}/${subTaskIdToDlt}`
      );

      const [createRes, deleteRes] = await Promise.all([
        createPromise,
        deletePromise,
      ]);

      console.log("createRes:", createRes, "deleteRes:", deleteRes);
      if (createRes.status === 200 && deleteRes.status === 200) {
        toast.success("Subtask moved successfully!");
        setSubtask("");
        getSingleTask();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // ---------Stop Timer ----------->
  const handleStopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  //    -----------Single Task----------
  const getSingleTask = async () => {
    if (initialLoad.current) {
      setLoading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/single/${taskId}`
      );
      if (data) {
        setLoading(false);
        setTaskDetal(data?.task);
        setSubTaskData(data?.task?.subtasks);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Error in single task!");
    } finally {
      if (initialLoad.current) {
        setLoading(false);
        initialLoad.current = false;
      }
    }
  };

  useEffect(() => {
    // console.log("tasksData:", tasksData);
    getSingleTask();
    // eslint-disable-next-line
  }, [taskId]);

  // ---------------Handle Task Status Change---------->
  const handleStatusChange = async (taskId, status) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${taskId}`,
        { status }
      );
      if (data?.success) {
        const updateTask = data?.task;
        setTaskDetal(updateTask);
        toast.success("Task updated successfully!");
        setTasksData((prevData) =>
          prevData?.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // Get Running Timer JobId
  useEffect(() => {
    const timeId = localStorage.getItem("jobId");
    setTimerId(JSON.parse(timeId));
  }, []);

  // ------------Delete Conformation-------->
  const handleDeleteConfirmation = (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteTask(taskId);
        Swal.fire("Deleted!", "Your task has been deleted.", "success");
      }
    });
  };

  // Update Job Status(Completed)
  const handleStatusComplete = async (taskId) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${taskId}`,
        { status: "completed" }
      );
      if (data?.success) {
        const updateTask = data?.task;
        setShowDetail(false);
        toast.success("Status completed successfully!");

        setTasksData((prevData) =>
          prevData.filter((item) => item._id !== updateTask._id)
        );
        setFilterData((prevData) =>
          prevData.filter((item) => item._id !== updateTask._id)
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleUpdateStatus = (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this job!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, complete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusComplete(taskId);
        Swal.fire("Updated!", "Your task completed successfully!.", "success");
      }
    });
  };

  // Crate Subtask
  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    setSubTaskLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/create/subTask/${taskId}`,
        { subTask }
      );
      if (data) {
        getSingleTask();
        setSubtask("");
        toast.success("Subtask added successfully!");
        setSubTaskLoading(false);
      }
    } catch (error) {
      console.log(error);
      setSubTaskLoading(false);
      toast.error(error.response.data.message);
    }
  };

  //  Handle drag end
  const handleOnDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) return;

    const newTodos = Array.from(subTaskData);
    const [movedTodo] = newTodos.splice(source.index, 1);
    newTodos.splice(destination.index, 0, movedTodo);

    setSubTaskData(newTodos);

    handleReorderingSubtask(newTodos);
  };
  // Handle Reordering
  const handleReorderingSubtask = async (newTodos) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/reorder/subtasks/${taskId}`,
        { subtasks: newTodos }
      );
      if (data) {
        toast.success("Reordering successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // Update Subtask Status
  const updateSubtaskStatus = async (subTaskId) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/subtask/status/${taskId}`,
        { subTaskId }
      );
      if (data) {
        getSingleTask();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleDeleteSubTask = async (subTaskId) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/delete/subtask/${taskId}/${subTaskId}`
      );
      if (data.success) {
        getSingleTask();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[85vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div
      id=""
      className="w-full     h-[90vh]  flex flex-col justify-between items-start gap-5 p-4 pb-16 relative "
    >
      <div
        id="mainnnnnnn"
        className="w-full flex flex-row justify-start gap-5 items-start h-[50%]"
      >
        <div className="flex flex-col w-full px-2  h-full    ">
          <div className="flex items-center gap-2 w-full h-[10%] ">
            <form
              onSubmit={handleCreateSubtask}
              className="flex items-center gap-2 w-full py-1 px-2 border bg-gray-50 border-gray-300 rounded-lg  "
            >
              <input
                type="text"
                value={subTask}
                onChange={(e) => setSubtask(e.target.value)}
                placeholder="Add Subtask..."
                className="py-2 px-1 border-none bg-transparent outline-none w-full"
              />
              <button
                type="submit"
                className="py-[7px] px-4 rounded-md shadow cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
              >
                {subTaskLoading ? (
                  <RiLoaderFill className="h-6 w-6 animate-spin text-white" />
                ) : (
                  "Add"
                )}
              </button>
            </form>
          </div>
          <div className="mt-2 py-1  rounded-md border border-gray-300 flex flex-col gap-3 overflow-hidden  h-[90%]">
            <h3 className="text-[15px] w-full font-semibold py-2 text-gray-900 border-b-[1px] px-2 border-gray-300">
              Checklist (
              {
                subTaskData.filter((subtask) => subtask.status === "complete")
                  .length
              }
              /{subTaskData?.length})
            </h3>
            <div className="px-2 overflow-y-auto ">
              {subTaskData.length > 0 ? (
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="subTaskData">
                    {(provided) => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          listStyle: "none",
                          padding: 0,
                          // overflowY: "scroll",
                          // maxHeight: "100%",
                        }}
                      >
                        {subTaskData?.map(({ _id, subTask, status }, index) => (
                          <Draggable key={_id} draggableId={_id} index={index}>
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  padding: "5px",
                                  marginBottom: "5px",
                                  backgroundColor:
                                    status === "complete"
                                      ? "#d4edda"
                                      : "#f3f3f3",
                                  borderRadius: "4px",
                                  border: "1px solid #5c5c5c",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  // marginLeft: "-.2rem",
                                  marginLeft: 0,

                                  // position: "relative",
                                }}
                                className="flex items-center flex-col justify-center gap-1"
                              >
                                <div className="w-full flex items-center flex-row justify-between gap-2">
                                  <div className="flex items-center gap-2 w-full relative">
                                    <div className="w-6 h-full">
                                      <input
                                        type="checkbox"
                                        checked={status === "complete"}
                                        onChange={() =>
                                          updateSubtaskStatus(_id)
                                        }
                                        style={{
                                          accentColor: "orangered",
                                        }}
                                        className="h-5 w-5 mt-2 cursor-pointer  checked:bg-orange-600"
                                      />
                                    </div>
                                    <p
                                      className={`text-[15px] w-full ${
                                        status === "complete" && "line-through"
                                      }`}
                                    >
                                      {subTask}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <span
                                      className="p-1 cursor-pointer"
                                      onClick={() => setSubtask(subTask)}
                                    >
                                      <FaEdit className="h-5 w-5 cursor-pointer text-gray-800 hover:text-sky-600" />
                                    </span>
                                    <span
                                      className="p-1 cursor-pointer"
                                      onClick={() => handleDeleteSubTask(_id)}
                                    >
                                      <IoCloseCircleOutline
                                        size={24}
                                        className="cursor-pointer hover:text-red-500 "
                                        title="Delete Subtask"
                                      />
                                    </span>
                                  </div>
                                </div>

                                {/* <div className="     w-full flex justify-start  ">
                                      {
                                        <select
                                          defaultValue={taskId}
                                          className="w-[50%] py-1 px-2 bg-transparent border border-gray-300 rounded-md cursor-pointer  "
                                          onChange={(e) =>
                                            moveSubtask(
                                              subTask,
                                              taskId,
                                              e.target.value,
                                              _id
                                            )
                                          }
                                        >
                                          {usersTasksArr?.map((item) => {
                                            return (
                                              <option
                                                value={item?._id}
                                                key={item?._id}
                                              >
                                                {item?.task}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      }
                                    </div> */}
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="w-full py-8 flex items-center flex-col justify-center">
                  <img
                    src="/notask1.png"
                    alt="No_Task"
                    className="h-[12rem] w-[16rem] animate-pulse"
                  />
                  <span className="text-center text-[14px] text-gray-500">
                    Subtask not available!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full   h-full bg-white border border-gray-300 rounded-md shadow-md gap-2 p-3 ">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-500 w-[40%]">
              <FaRegUser className="h-4 w-4 text-gray-500" /> Job Holder
            </span>
            <span className="text-[17px] font-medium text-gray-800">
              {taskDetal?.jobHolder}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-500 w-[40%]">
              <RxPerson className="h-4 w-4 text-gray-500" />
              Lead
            </span>
            <span className="  text-gray-600">{taskDetal?.lead}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-500 w-[40%]">
              <GoGoal className="h-4 w-4 text-gray-500" /> Status
            </span>
            <select
              value={taskDetal?.status}
              onChange={(e) => {
                handleStatusChange(taskDetal._id, e.target.value);
              }}
              className="w-[8rem] h-[2rem] rounded-md border border-sky-500 outline-none"
            >
              <option value="">Select Status</option>
              <option value="To do">To do</option>
              <option value="Progress">Progress</option>
              <option value="Review">Review</option>
              <option value="Onhold">Onhold</option>
            </select>
          </div>
          {/*  */}

          {/*  */}

          <hr />

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-500 w-[40%]">
              <FiClock className="h-4 w-4 text-gray-500" />
              Total Hours
            </span>
            <span className="  text-gray-600">{taskDetal?.hours}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-500 w-[40%]">
              <GoClockFill className="h-4 w-4 text-gray-500" />
              Spent Hours
            </span>
            <span className="  text-gray-600">{taskDetal?.estimate_Time}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className=" flex items-center gap-1 text-gray-500 w-[40%] ">
              <BsCalendarDate className="h-4 w-4 text-gray-500" />
              Start Date
            </span>
            <span className=" text-gray-600   ">
              {taskDetal?.hours ? (
                <span>
                  {format(
                    new Date(
                      taskDetal?.startDate || "2024-07-26T00:00:00.000+00:00"
                    ),
                    "dd-MMM-yyyy"
                  )}
                </span>
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-500 w-[40%]">
              <BsCalendarDateFill className="h-4 w-4 text-gray-500" />
              Deadline
            </span>
            <span className="  text-gray-600">
              {format(
                new Date(
                  taskDetal?.deadline || "2024-07-26T00:00:00.000+00:00"
                ),
                "dd-MMM-yyyy"
              )}
            </span>
          </div>

          <hr />

          {/*  */}
          <div className="flex items-center gap-4  ">
            <span className="flex items-center gap-1 text-gray-500 w-[40%]">
              <RiTimerLine className="h-4 w-4 text-gray-500" /> Timer
            </span>
            <span className="text-[17px] font-medium text-gray-800">
              <Timer
                ref={timerRef}
                clientId={auth?.user?.id}
                jobId={taskDetal?._id}
                setIsShow={setIsShow}
                note={note}
                setNote={setNote}
                taskLink={"/tasks"}
                pageName={"Tasks"}
                taskName={taskDetal?.project?.projectName || ""}
                department={taskDetal?.project?.projectName || ""}
                clientName={taskDetal?.project?.projectName || ""}
                companyName={taskDetal?.project?.projectName || ""}
                JobHolderName={taskDetal?.jobHolder || ""}
                projectName={""}
                task={taskDetal?.task || ""}
                setTaskIdForNote={setTaskIdForNote}
                allocatedTime={taskDetal?.hours || "0"}
              />
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-500 w-[40%]">
              <BiBellPlus className="h-4 w-4 text-gray-500" />
              Add Reminder
            </span>
            <span
              onClick={() => setShowReminder(true)}
              className=" text-pink-500 hover:text-pink-600"
            >
              <BiSolidBellPlus className="h-7 w-7 cursor-pointer " />
            </span>
          </div>
          {/*  */}
        </div>
      </div>

      <div
        id="mainnnsnnnssn"
        className="w-full flex flex-row justify-start gap-5 items-start h-[50%]"
      >
        <DetailComments jobId={taskId} type="Task" getTasks1={() => null} />

        <div className="flex flex-col w-full h-full   shadow-md border border-gray-300 rounded-md bg-white  ">
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Activity</h3>
          </div>

          <div className="flex flex-col gap-2 w-full h-full overflow-y-auto p-2 ">
            {taskDetal?.activities
              ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((activity) => (
                <div
                  className="w-full flex flex-col gap-2 py-2 px-3 border border-gray-300 rounded-md   hover:shadow-sm bg-white hover:bg-orange-50 transition-all duration-300 cursor-pointer hover:scale-[1.03] ease-in-out "
                  key={activity?._id}
                >
                  <p className="mb-2 text-[15px] font-medium text-green-500 mt-2 flex items-center gap-2">
                    <span className="w-[.8rem] h-[.8rem] rounded-full bg-green-500"></span>
                    {new Date(activity?.createdAt).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="flex-shrink-0">
                      {activity?.user?.avatar ? (
                        <img
                          src={activity?.user?.avatar}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full text-white font-semibold flex items-center justify-center"
                          style={{
                            backgroundColor: `#${Math.floor(
                              Math.random() * 16777215
                            ).toString(16)}`,
                          }}
                        >
                          {activity?.user?.name?.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <strong className="text-[16px] font-medium text-black capitalize">
                      {activity?.user?.name}
                    </strong>
                  </div>
                  {/* Action */}
                  <strong className="text-[15px] font-semibold text-black">
                    Action:{" "}
                    <span className="text-[13px] text-gray-700 ml-1 font-normal">
                      {activity?.activity}
                    </span>
                  </strong>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="absolute w-full flex justify-end  items-center gap-4 bottom-2 right-2 ">
        <span
          className=""
          title="Edit Job"
          onClick={() => {
            setEditId(taskDetal?._id);
            setIsOpen(true);
          }}
        >
          <FaEdit className="h-5 w-5 cursor-pointer text-gray-800 hover:text-gray-950" />
        </span>
        <span
          className=""
          title="Complete Task"
          onClick={() => {
            handleUpdateStatus(taskDetal?._id);
          }}
        >
          <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
        </span>
        <button
          disabled={anyTimerRunning && timerId === taskDetal?._id}
          className={`${
            anyTimerRunning && timerId === taskDetal?._id
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
          type="button"
          title="Delete Task"
          onClick={() => handleDeleteConfirmation(taskDetal?._id)}
        >
          <AiFillDelete
            className={`h-5 w-5 text-red-500 hover:text-red-600 ${
              anyTimerRunning && timerId === taskDetal?._id
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
          />
        </button>
      </div>

      {/* Edit Modal */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-white/60 drop-shadow-md   flex items-center justify-center py-6  px-4">
          <AddTaskModal
            users={users}
            setIsOpen={setIsOpen}
            projects={projects}
            taskId={editId}
            setTaskId={setEditId}
            taskDetal={taskDetal}
            getAllTasks={getAllTasks}
            setShowDetail={setShowDetail}
          />
        </div>
      )}

      {/* Stop Timer */}
      {isShow && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
          <div className="w-[32rem] rounded-md bg-white shadow-md">
            <div className="flex  flex-col gap-3 ">
              <div className=" w-full flex items-center justify-between py-2 mt-1 px-4">
                <h3 className="text-[19px] font-semibold text-gray-800">
                  Enter your note here
                </h3>
                <span
                  onClick={() => {
                    setIsShow(false);
                  }}
                >
                  <IoClose className="text-black cursor-pointer h-6 w-6 " />
                </span>
              </div>
              <hr className="w-full h-[1px] bg-gray-500 " />
              <div className=" w-full px-4 py-2 flex-col gap-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note here..."
                  className="w-full h-[6rem] rounded-md resize-none py-1 px-2 shadow border-2 border-gray-700"
                />
                <div className="flex items-center justify-end mt-4">
                  <button className={`${style.btn}`} onClick={handleStopTimer}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder */}
      {showReminder && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
          <Reminder
            setShowReminder={setShowReminder}
            taskId={taskId}
            link={"/tasks"}
          />
        </div>
      )}
    </div>
  );
}
