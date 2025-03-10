import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { GoGoal } from "react-icons/go";
import { MdDateRange } from "react-icons/md";
import { RiTimerLine } from "react-icons/ri";
import { format } from "date-fns";
import Loader from "../../utlis/Loader";
import { Timer } from "../../utlis/Timer";
import { useAuth } from "../../context/authContext";
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

export default function RowTaskDetail({
  taskId,
  getAllTasks,
  handleDeleteTask,
  setTasksData,
  setShowDetail,
  users,
  projects,
  setFilterData,
}) {
  const [taskDetal, setTaskDetal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("subtasks");
  const { auth, anyTimerRunning } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState("");
  const timerRef = useRef();
  const [subTask, setSubtask] = useState("");
  const [subTaskLoading, setSubTaskLoading] = useState(false);
  const [subTaskData, setSubTaskData] = useState([]);
  const [timerId, setTimerId] = useState("");
  const [showReminder, setShowReminder] = useState(false);
  const initialLoad = useRef(true);

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

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full relative  mt-2 overflow-y-scroll   pb-4   flex flex-col justify-center items-center ">
          




         
          {/* ------------Tabs---------- */}
          <div className="flex items-center  gap-4 ">
            <h2 className="text-start font-medium text-2xl">Subtasks</h2>
          </div>
          <hr className="h-[1.5px] w-full bg-gray-400 my-3" />

          <div className="w-full">
            {activeTab === "taskDetail" ? (
              <div className="flex flex-col">
                <div className="grid grid-cols-3">
                  <span className="border col-span-1 border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
                    Alocate Task
                  </span>
                  <p className="border col-span-2 border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
                    {taskDetal?.task ? (
                      taskDetal?.task
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </p>
                </div>
                <div className="grid grid-cols-3">
                  <span className="border col-span-1 border-gray-300 text-black font-medium py-2 px-2 ">
                    Hours
                  </span>
                  <span className="border col-span-2 border-gray-300 text-gray-600 py-2 px-2 ">
                    {taskDetal?.hours ? (
                      taskDetal?.hours
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="border col-span-1 border-gray-300 text-black font-medium py-2 px-2 ">
                    Start Date
                  </span>
                  <span className="border col-span-2 border-gray-300 text-gray-600 py-2 px-2 ">
                    {taskDetal?.hours ? (
                      <span>
                        {format(
                          new Date(
                            taskDetal?.startDate ||
                              "2024-07-26T00:00:00.000+00:00"
                          ),
                          "dd-MMM-yyyy"
                        )}
                      </span>
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="border col-span-1 border-gray-300 text-black font-medium py-2 px-2 ">
                    Deadline
                  </span>
                  <span className="border col-span-2 border-gray-300 text-gray-600 py-2 px-2 ">
                    {taskDetal?.deadline ? (
                      <span>
                        {format(
                          new Date(
                            taskDetal?.deadline ||
                              "2024-07-26T00:00:00.000+00:00"
                          ),
                          "dd-MMM-yyyy"
                        )}
                      </span>
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="border col-span-1 border-gray-300 text-black font-medium py-2 px-2 ">
                    Lead
                  </span>
                  <span className="border col-span-2 border-gray-300 text-gray-600 py-2 px-2 ">
                    {taskDetal?.lead ? (
                      <span className="py-[5px] px-5 bg-fuchsia-600 rounded-[2rem] text-white">
                        {taskDetal?.lead}
                      </span>
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="border col-span-1 border-gray-300 text-black font-medium py-2 px-2 ">
                    Estimate Time
                  </span>
                  <span className="border col-span-2 border-gray-300 text-gray-600 py-2 px-2 ">
                    {taskDetal?.estimate_Time ? (
                      taskDetal?.estimate_Time
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
              </div>
            ) : activeTab === "subtasks" ? (
              <div className="flex flex-col w-full px-2">
                <div className="flex items-center gap-2 w-full ">
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
                <div className="mt-2 py-1  rounded-md border border-gray-300 flex flex-col gap-3">
                  <h3 className="text-[17px] w-full font-semibold py-2 text-gray-900 border-b-[1px] px-2 border-gray-300">
                    Checklist (
                    {
                      subTaskData.filter(
                        (subtask) => subtask.status === "complete"
                      ).length
                    }
                    /{subTaskData?.length})
                  </h3>
                  <div className="px-2">
                    {subTaskData.length > 0 ? (
                      <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="subTaskData">
                          {(provided) => (
                            <ul
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              style={{ listStyle: "none", padding: 0 }}
                            >
                              {subTaskData?.map(
                                ({ _id, subTask, status }, index) => (
                                  <Draggable
                                    key={_id}
                                    draggableId={_id}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          ...provided.draggableProps.style,
                                          padding: "8px",
                                          marginBottom: "4px",
                                          backgroundColor:
                                            status === "complete"
                                              ? "#d4edda"
                                              : "#f3f3f3",
                                          borderRadius: "4px",
                                          border: "1px solid #ddd",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          marginLeft: "-.2rem",
                                        }}
                                        className="flex items-center justify-between gap-2"
                                      >
                                        <div className="flex items-center gap-2 w-full">
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
                                              status === "complete" &&
                                              "line-through"
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
                                            onClick={() =>
                                              handleDeleteSubTask(_id)
                                            }
                                          >
                                            <IoCloseCircleOutline
                                              size={24}
                                              className="cursor-pointer hover:text-red-500 "
                                              title="Delete Subtask"
                                            />
                                          </span>
                                        </div>
                                      </li>
                                    )}
                                  </Draggable>
                                )
                              )}
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
            ) : activeTab === "activity" ? (
              <div className="flex flex-col gap-2 w-full h-full overflow-y-auto p-2 ">
                {taskDetal?.activities?.map((activity) => (
                  <div
                    className="w-full flex flex-col gap-2 py-2 px-3 border border-gray-300 rounded-md shadow hover:shadow-md bg-white hover:bg-orange-50 transition-all duration-300 cursor-pointer hover:scale-[1.03] ease-in-out "
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
                            {activity?.user?.name.slice(0, 1)}
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
            ) : activeTab === "departmentInfo" ? (
              <div className="flex flex-col">
                {/* <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
                    Department Name
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
                    <span className=" py-1 px-5 rounded-[1.5rem] shadow-md bg-indigo-500 text-white">
                      {clientDetail?.job.jobName ? (
                        clientDetail?.job.jobName
                      ) : (
                        <span className="text-red-500">N/A</span>
                      )}
                    </span>
                  </span>
                </div> */}
              </div>
            ) : (
              "Comments"
            )}
          </div>

          {/* Edit Modal */}
          {isOpen && (
            <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-white/80 flex items-center justify-center py-6  px-4">
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
                      <button
                        className={`${style.btn}`}
                        onClick={handleStopTimer}
                      >
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
      )}
    </>
  );
}
