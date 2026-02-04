import { useState, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";

import { closeModal } from "../../redux/slices/globalModalSlice";
import JobDetail from "../../pages/Jobs/JobDetail";
import { useEscapeKey } from "../../utlis/useEscapeKey";
import TaskDetail from "../../pages/Tasks/TaskDetail";
import Swal from "sweetalert2";

export const TaskModalGlobal = ({ taskId }) => {

  const dispatch = useDispatch();
  const [taskName, setTaskName] = useState("");

  // Close modal on Escape key
  useEscapeKey(() => dispatch(closeModal()));

  // ------------------- API Handlers -------------------

  const handleDeleteTask =  useCallback( async (taskId) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/delete/task/${taskId}`,
      );
      if (data) {
        toast.success("Task deleted successfully!");
         dispatch(closeModal())
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  }, [])

  if (!taskId) return null;

  // ------------------- Render -------------------
  return (
    <div className="fixed inset-0 z-[499] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-gray-100 rounded-xl shadow-lg w-[95%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[70%] 3xl:w-[60%]    py-4 px-5   ">
        <div className="h-full w-full flex flex-col justify-start items-center relative">
          <div className="flex items-center justify-between border-b pb-2 mb-3 self-start w-full">
            <h3 className="text-lg font-semibold">Task: {taskName}</h3>
            <button
              className="p-1 rounded-2xl bg-gray-50 border hover:shadow-md hover:bg-gray-100"
              onClick={() => dispatch(closeModal())}
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>

          <TaskDetail
            taskId={taskId}
            getAllTasks={() => {}}
            handleDeleteTask={handleDeleteTask}
            tasksData={[]}
            setTasksData={() => {}}
            setShowDetail={() => {}}
            users={[]}
            projects={[]}
            setFilterData={() => {}}
            setTaskName={setTaskName}
            // assignedPerson={table.getRow(taskID).original.jobHolder}
            // setTaskIdForNote={setTaskIdForNote}
          />
        </div>
      </div>
    </div>
  );
};
