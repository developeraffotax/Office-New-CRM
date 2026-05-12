import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RiLoaderFill } from "react-icons/ri";
import { CgSpinner } from "react-icons/cg";
import { Timer } from "../../utlis/Timer";
import { useSelector } from "react-redux";

export default function Subtasks({ taskId }) {
  const auth = useSelector((state) => state.auth.auth);

  const [loading, setLoading] = useState(false);

  const [task, setTask] = useState({});

  const [subTask, setSubtask] = useState("");
  const [subTaskLoading, setSubTaskLoading] = useState(false);
  const [subTaskData, setSubTaskData] = useState([]);

  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);

  const initialLoad = useRef(true);

  //    -----------Single Task----------
  const getSingleTask = async () => {
    if (initialLoad.current) {
      setLoading(true);
    }

    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/single/${taskId}`,
      );
      if (data) {
        setSubTaskData(data?.task?.subtasks);
        setTask(data?.task);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in single task!");
    } finally {
      setLoading(false);
      if (initialLoad.current) {
        initialLoad.current = false;
      }
    }
  };

  useEffect(() => {
    getSingleTask();
    // eslint-disable-next-line
  }, [taskId]);

  // Crate Subtask
  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    setSubTaskLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/create/subTask/${taskId}`,
        { subTask },
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
        { subtasks: newTodos },
      );
      if (data) {
        toast.success("Reordering successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // Update Subtask (status / name / both)
  const updateSubtask = async ({ subTaskId, status, subTask }) => {
    try {
      setIsUpdating(true);

      const payload = {};

      if (status !== undefined) {
        payload.status = status;
      }

      if (subTask !== undefined) {
        payload.subTask = subTask;
      }

      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/subtask/${taskId}/${subTaskId}`,
        payload,
      );

      if (data?.success) {
       getSingleTask();

        setEditingSubtaskId(null);
        setEditingValue("");

        toast.success(data?.message || "Subtask updated!");
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Error while updating subtask!",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartEditing = (subtask) => {
    setEditingSubtaskId(subtask._id);
    setEditingValue(subtask.subTask);
  };

  const handleCancelEditing = () => {
    setEditingSubtaskId(null);
    setEditingValue("");
  };

  const handleUpdateSubtaskName = async (subtask) => {
    const trimmedValue = editingValue.trim();

    if (!trimmedValue) {
      return toast.error("Subtask cannot be empty!");
    }

    // No changes
    if (trimmedValue === subtask.subTask) {
      return handleCancelEditing();
    }

    await updateSubtask({
      subTaskId: subtask._id,
      subTask: trimmedValue,
    });
  };

  const handleToggleSubtaskStatus = async (subtask) => {
    const newStatus = subtask.status === "complete" ? "process" : "complete";

    await updateSubtask({
      subTaskId: subtask._id,
      status: newStatus,
    });
  };

  const handleDeleteSubTask = async (subTaskId) => {
    try {
      setIsUpdating(true);
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/delete/subtask/${taskId}/${subTaskId}`,
      );
      if (data.success) {
        getSingleTask();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full h-full min-h-0 relative flex flex-col overflow-hidden">
      <div className="w-full h-full min-h-0">
        <div className="flex flex-col w-full h-full min-h-0 p-2">
          <div className="flex items-center gap-2 w-full ">
            <form
              onSubmit={handleCreateSubtask}
              className="flex items-center gap-2 w-full py-1   px-2 border bg-white border-gray-300 rounded-lg  "
            >
              <input
                type="text"
                value={subTask}
                onChange={(e) => setSubtask(e.target.value)}
                placeholder="Add Subtask..."
                className="py-0 px-1 border-none bg-transparent outline-none w-full"
              />
              <button
                type="submit"
                className=" py-1  px-5 rounded-lg   cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
              >
                {subTaskLoading ? (
                  <RiLoaderFill className="h-6 w-6 animate-spin text-white" />
                ) : (
                  "Add"
                )}
              </button>
            </form>
          </div>
          <div className="mt-2 relative rounded-md border border-gray-300 flex flex-col flex-1 min-h-0 overflow-hidden bg-gradient-to-bl from-gray-200 to-white">
            <div className="w-full px-2  bg-gray-200 sticky  top-0  text-[17px] flex items-center justify-between gap-2 font-semibold py-2 text-gray-900 border-b-[1px]  border-gray-300">
              <h3 className="   ">
                Subtasks (
                {
                  subTaskData.filter((subtask) => subtask.status === "complete")
                    .length
                }
                /{subTaskData?.length})
              </h3>

              <h3 className=" ">
                {isUpdating && (
                  <RiLoaderFill className="h-6 w-6 animate-spin text-orange-500" />
                )}
              </h3>
            </div>
            {loading ? (
              <div className="w-full text-center flex justify-center items-center ">
                <CgSpinner className="h-8 w-8 animate-spin text-black text-center" />
              </div>
            ) : (
              <div className="px-0 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
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
                                       
                                      backgroundColor:
                                      status === "complete"
                                      ? "#d4edda"
                                      : "#faf7f7",
                                       
                                      
                                      border: "1px solid #ddd",
                                      
                                      
                                      marginLeft: 0,
                                      marginRight: 0,
                                      marginBottom: "5px",
                                    }}
                                    className="flex items-center justify-between gap-4 w-full py-1 px-4"
                                  >
                                    <div className="flex items-center gap-2 w-[80%]">
                                      <div className="w-6 h-full">
                                        <input
                                          type="checkbox"
                                          checked={status === "complete"}
                                          onChange={() =>
                                            handleToggleSubtaskStatus({
                                              _id,
                                              subTask,
                                              status,
                                            })
                                          }
                                          style={{
                                            accentColor: "orangered",
                                          }}
                                          className="h-5 w-5 mt-2 cursor-pointer  checked:bg-orange-600"
                                        />
                                      </div>
                                      {editingSubtaskId === _id ? (
                                        <input
                                          type="text"
                                          value={editingValue}
                                          autoFocus
                                          onChange={(e) =>
                                            setEditingValue(e.target.value)
                                          }
                                          onBlur={() =>
                                            handleUpdateSubtaskName({
                                              _id,
                                              subTask,
                                            })
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              handleUpdateSubtaskName({
                                                _id,
                                                subTask,
                                              });
                                            }

                                            if (e.key === "Escape") {
                                              handleCancelEditing();
                                            }
                                          }}
                                          className="w-full bg-white border border-orange-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                                        />
                                      ) : (
                                        <p
                                          onDoubleClick={() =>
                                            handleStartEditing({
                                              _id,
                                              subTask,
                                            })
                                          }
                                          title="Double click to edit"
                                          className={`text-sm text-wrap cursor-text transition-all duration-150 ${
                                            status === "complete"
                                              ? "line-through text-gray-500"
                                              : "text-gray-800"
                                          }`}
                                        >
                                          {subTask}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex justify-end items-center gap-1 w-[20%]">
                                      {  (
                                        <span className="p-1 cursor-pointer">
                                          <Timer
                                            clientId={auth?.user?.id}
                                            jobId={_id}
                                            taskLink={"/tasks"}
                                            pageName={"Tasks"}
                                            task={`${subTask} - ${task?.task}`}
                                            department={
                                              task?.project?.projectName
                                            }
                                            clientName={
                                              task?.project?.projectName
                                            }
                                            companyName={
                                              task?.project?.projectName
                                            }
                                            JobHolderName={task?.jobHolder}
                                            entityType="subtask"
                                            metadata={{ parentTaskId: taskId }}
                                            allocatedTime={task?.hours}
                                          />
                                        </span>
                                      )}

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
                                  </li>
                                )}
                              </Draggable>
                            ),
                          )}
                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <div className="w-full py-8 flex items-center flex-col justify-center">
                    <h3 className="text-center text-[14px] text-gray-800">
                      Subtask not available!
                    </h3>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
