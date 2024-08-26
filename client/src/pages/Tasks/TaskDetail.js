import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { GoGoal } from "react-icons/go";
import { MdDateRange, MdInsertComment } from "react-icons/md";
import { RiTimerLine } from "react-icons/ri";
import { format } from "date-fns";
// import { MdOutlineInsertComment } from "react-icons/md";
import Loader from "../../utlis/Loader";
import { Timer } from "../../utlis/Timer";
import { useAuth } from "../../context/authContext";
import { FaRegUser } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { CgClose } from "react-icons/cg";
import { AiFillDelete } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import Swal from "sweetalert2";
import { MdCheckCircle } from "react-icons/md";
import AddTaskModal from "../../components/Tasks/AddTaskModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RiLoaderFill } from "react-icons/ri";

export default function TaskDetail({
  taskId,
  getAllTasks,
  handleDeleteTask,
  setTasksData,
  setShowDetail,
  users,
  projects,
}) {
  const [taskDetal, setTaskDetal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("subtasks");
  const { auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState("");
  const timerRef = useRef();
  const [subTask, setSubtask] = useState("");
  const [subTaskLoading, setSubTaskLoading] = useState(false);
  const [subTaskData, setSubTaskData] = useState([]);

  // ---------Stop Timer ----------->
  const handleStopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  //    -----------Single Task----------
  const getSingleTask = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/single/${taskId}`
      );
      if (data) {
        setLoading(false);
        setTaskDetal(data?.task);
        setSubTaskData(
          data?.task?.subtasks?.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Error in single task!");
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
          prevData.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

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
        setTaskDetal(data?.task);
        setSubTaskData(
          data?.task?.subtasks?.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
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
  };

  // Update Subtask Status
  const updateSubtaskStatus = async (subTaskId) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/subtask/status/${taskId}`,
        { subTaskId }
      );
      if (data) {
        setTaskDetal(data?.task);
        setSubTaskData(
          data?.task?.subtasks?.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
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
        setTaskDetal(data?.task);
        setSubTaskData(
          data?.task?.subtasks?.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
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
        <div className="w-full relative  mt-2 overflow-y-scroll h-[calc(100vh-7rem)] pb-4 hidden1 ">
          <div className="absolute top-[.5rem] right-[1rem] flex items-center gap-4">
            <span
              className=""
              title="Edit Job"
              onClick={() => {
                setEditId(taskDetal._id);
                setIsOpen(true);
              }}
            >
              <FaEdit className="h-5 w-5 cursor-pointer text-gray-800 hover:text-gray-950" />
            </span>
            <span
              className=""
              title="Complete Job"
              onClick={() => {
                handleUpdateStatus(taskDetal._id);
              }}
            >
              <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
            </span>
            <span
              className=""
              title="Delete Job"
              onClick={() => handleDeleteConfirmation(taskDetal._id)}
            >
              <AiFillDelete className="h-5 w-5 cursor-pointer text-red-500 hover:text-red-600" />
            </span>
          </div>
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
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
                <option value="Todo">Todo</option>
                <option value="Progress">Progress</option>
                <option value="Review">Review</option>
                <option value="Onhold">Onhold</option>
              </select>
            </div>
            {/*  */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
                <FaRegUser className="h-4 w-4 text-gray-500" /> Job Holder
              </span>
              <span className="text-[17px] font-medium text-gray-800">
                {taskDetal?.jobHolder}
              </span>
            </div>
            {/*  */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
                <MdDateRange className="h-4 w-4 text-gray-500" /> Deadline
              </span>
              <span className="text-[17px] font-medium text-gray-800">
                {format(
                  new Date(
                    taskDetal?.deadline || "2024-07-26T00:00:00.000+00:00"
                  ),
                  "dd-MMM-yyyy"
                )}
              </span>
            </div>
            {/*  */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
                <RiTimerLine className="h-4 w-4 text-gray-500" /> Stack Timer
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
                  taskName={taskDetal?.project?.projectName}
                />
              </span>
            </div>
            {/*------------- Comment------- */}
            {/* <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-gray-500 w-[30%]">
            <MdOutlineInsertComment className="h-4 w-4 text-gray-500" />{" "}
            Comments
          </span>
          <span
            className="text-[17px] font-medium text-gray-800 relative"
            onClick={() => setActiveTab("comments")}
          >
            <span className=" absolute top-[-.5rem] right-[-.8rem] w-[1.1rem] h-[1.1rem] flex items-center justify-center font-medium rounded-full bg-green-500 text-white p-1 text-[12px]">
              10
            </span>
            <span className="text-[1rem] cursor-pointer  ">
              <MdInsertComment className="h-6 w-6 text-orange-500 hover:text-orange-600 " />
            </span>
          </span>
        </div> */}
            {/*  */}
          </div>
          <hr className="h-[1.5px] w-full bg-gray-400 my-3" />
          {/* ------------Tabs---------- */}
          <div className="flex items-center  gap-4 ">
            <button
              className={` text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "subtasks" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("subtasks")}
            >
              Sub Tasks
            </button>
            <button
              className={` text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "taskDetail" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("taskDetail")}
            >
              Task Detail
            </button>

            <button
              className={` text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "activity" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("activity")}
            >
              Activity
            </button>
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
                                        }}
                                        className="flex items-center justify-between gap-2"
                                      >
                                        <div className="flex items-center gap-2 w-full">
                                          <input
                                            type="checkbox"
                                            checked={status === "complete"}
                                            onChange={() =>
                                              updateSubtaskStatus(_id)
                                            }
                                            style={{
                                              accentColor: "orangered",
                                            }}
                                            className="h-5 w-5 cursor-pointer  checked:bg-orange-600"
                                          />
                                          <p
                                            className={`text-[15px] ${
                                              status === "complete" &&
                                              "line-through"
                                            }`}
                                          >
                                            {subTask}
                                          </p>
                                        </div>
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
              <div className="flex flex-col">
                {/* <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
                    CT Login
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
                    {clientDetail?.ctLogin ? (
                      clientDetail?.ctLogin
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div> */}
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
        </div>
      )}
    </>
  );
}
