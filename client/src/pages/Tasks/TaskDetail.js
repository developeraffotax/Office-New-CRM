import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { GoClockFill, GoGoal } from "react-icons/go";
import { RiTimerLine } from "react-icons/ri";
import { format, isValid } from "date-fns";
import { Timer } from "../../utlis/Timer";
import { FaRegUser, FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import Swal from "sweetalert2";
import { MdCheckCircle } from "react-icons/md";
import AddTaskModal from "../../components/Tasks/AddTaskModal";
import { BiBellPlus, BiSolidBellPlus } from "react-icons/bi";
import Reminder from "../../utlis/Reminder";
import { RxPerson } from "react-icons/rx";
import { useSelector } from "react-redux";
import { FiClock } from "react-icons/fi";
import { BsCalendarDate, BsCalendarDateFill } from "react-icons/bs";
import DetailComments from "./TaskDetailComments";
import Subtasks from "./Subtasks";
import TaskReminders from "../../utlis/TaskReminders";
import CommentMobile from "./components/CommentMobile";
import { useIsMobile } from "./hooks/useIsMobile";
import { useKeyboardInset } from "./hooks/useKeyboardInset";
import MobileTaskFields from "./components/MobileTaskFields";
import AddTaskMobile from "./components/AddTaskMobile";

const TABS = [
  { id: "subtasks", label: "Subtasks" },
  { id: "details", label: "Details" },
  { id: "comments", label: "Comments" },
  { id: "activity", label: "Activity" },
];

const AVATAR_COLORS = [
  "bg-orange-500", "bg-sky-500", "bg-emerald-500", "bg-violet-500",
  "bg-rose-500", "bg-teal-500", "bg-indigo-500", "bg-amber-500",
];
const hashStr = (s = "") => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);


const JLS_KEYS = ["jobHolder", "lead", "status"];
const toDay = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return isValid(x) ? format(x, "yyyy-MM-dd") : "";
};


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
  setTaskName,
}) {
  const auth = useSelector((state) => state.auth.auth);
  const anyTimerRunning = useSelector((state) => state.auth.anyTimerRunning);

  const isMobile = useIsMobile(1024);
  const keyboard = useKeyboardInset(isMobile);
  const keyboardOpen = isMobile && keyboard > 0;

  const timerRef = useRef();
  const initialLoad = useRef(true);

  const [taskDetal, setTaskDetal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("subtasks");
  const [reminderRefreshKey, setReminderRefreshKey] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState("");
  const [timerId, setTimerId] = useState("");
  const [showReminder, setShowReminder] = useState(false);

  const userNames = useMemo(
    () => users?.map((u) => u?.name).filter(Boolean) || [],
    [users],
  );

  const sortedActivities = useMemo(
    () =>
      [...(taskDetal?.activities || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [taskDetal?.activities],
  );

  const timerBlocksDelete = anyTimerRunning && timerId === taskDetal?._id;

  // ---------Stop Timer ----------->
  const handleStopTimer = () => {
    if (timerRef.current) timerRef.current.stopTimer();
  };

  // ----------- Single Task ----------
  const getSingleTask = async () => {
    if (initialLoad.current) setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/single/${taskId}`,
      );
      if (data) {
        setLoading(false);
        setTaskDetal(data?.task);
        setTaskName?.(data?.task?.task);
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

  // Get Running Timer JobId
  useEffect(() => {
    const timeId = localStorage.getItem("jobId");
    setTimerId(JSON.parse(timeId));
  }, []);

  // --------------- Status change ---------->
  const handleStatusChange = async (id, status) => {
    if (!id) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${id}`,
        { status },
      );
      if (data?.success) {
        const updateTask = data?.task;
        setTaskDetal(updateTask);
        toast.success("Task updated successfully!");
        setTasksData((prevData) =>
          prevData?.map((item) => (item._id === updateTask._id ? updateTask : item)),
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to update");
    }
  };

  // ------------ Delete ------------>
  const handleDeleteConfirmation = (id) => {
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
        handleDeleteTask(id);
        Swal.fire("Deleted!", "Your task has been deleted.", "success");
      }
    });
  };

  // ------------ Complete ------------>
  const handleStatusComplete = async (id) => {
    if (!id) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${id}`,
        { status: "completed" },
      );
      if (data?.success) {
        const updateTask = data?.task;
        setShowDetail(false);
        toast.success("Status completed successfully!");
        setTasksData((prev) => prev.filter((item) => item._id !== updateTask._id));
        setFilterData((prev) => prev.filter((item) => item._id !== updateTask._id));
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to complete");
    }
  };

  const handleUpdateStatus = (id) => {
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
        handleStatusComplete(id);
        Swal.fire("Updated!", "Your task completed successfully!.", "success");
      }
    });
  };

  const openEdit = () => {
    setEditId(taskDetal?._id);
    setIsOpen(true);
  };







  // Used by the mobile inline editors. Returns true on success.
const patchTask = async (patch) => {
  if (!taskDetal?._id) return false;
  const api = process.env.REACT_APP_API_URL;
  try {
    if (Object.keys(patch).every((k) => JLS_KEYS.includes(k))) {
      // jobHolder / lead / status → same endpoint your status select already uses
      await axios.put(`${api}/api/v1/tasks/update/task/JLS/${taskDetal._id}`, patch);
    } else {
      // everything else → the full update, same payload shape as AddTaskModal
      await axios.put(`${api}/api/v1/tasks/update/task/${taskDetal._id}`, {
        projectId: taskDetal.project?._id,
        jobHolder: taskDetal.jobHolder,
        task: taskDetal.task,
        hours: taskDetal.hours,
        startDate: toDay(taskDetal.startDate),
        deadline: toDay(taskDetal.deadline),
        lead: taskDetal.lead,
        label: taskDetal.label,
        recurring: taskDetal.recurring,
        nextRecurringDate: toDay(taskDetal.nextRecurringDate),
        deleteCompletedRecurringSubtasks: !!taskDetal.deleteCompletedRecurringSubtasks,
        docLink: taskDetal.docLink || "",
        ...patch,
      });
    }
    toast.success("Updated");
    await getSingleTask(); // re-read so project/populated fields stay correct
    getAllTasks?.();       // refresh the list behind the overlay
    return true;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to update");
    return false;
  }
};





  // ───────────────── loading ─────────────────
  if (loading) {
    return (
      <div
        className={`w-full flex flex-col justify-center items-center ${
          isMobile ? "h-full" : "h-[85vh]"
        }`}
      >
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  const timerRows = (
    <>
          <hr />

      <div className="flex items-center gap-4">
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
        <button
          type="button"
          onClick={() => setShowReminder(true)}
          className="p-1 text-pink-500 hover:text-pink-600"
          aria-label="Add reminder"
        >
          <BiSolidBellPlus className="h-7 w-7 cursor-pointer" />
        </button>
      </div>

      <TaskReminders taskId={taskDetal?._id} refreshKey={reminderRefreshKey} />
      </>
  )

  // ───────────────── shared pieces ─────────────────
  const detailsContent = (
    <>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-gray-500 w-[40%]">
          <FaRegUser className="h-4 w-4 text-gray-500" /> Job Holder
        </span>
        <span className="text-[17px] font-medium text-gray-800">{taskDetal?.jobHolder}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-gray-500 w-[40%]">
          <RxPerson className="h-4 w-4 text-gray-500" />
          Lead
        </span>
        <span className="text-gray-600">{taskDetal?.lead}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-gray-500 w-[40%]">
          <GoGoal className="h-4 w-4 text-gray-500" /> Status
        </span>
        <select
          value={taskDetal?.status ?? ""}
          onChange={(e) => handleStatusChange(taskDetal._id, e.target.value)}
          className={`rounded-md border border-sky-500 outline-none ${
            isMobile
              ? "h-10 w-40 bg-white px-2 text-[16px]"
              : "w-[8rem] h-[2rem]"
          }`}
        >
          <option value="">Select Status</option>
          <option value="To do">To do</option>
          <option value="Progress">Progress</option>
          <option value="Review">Review</option>
          <option value="Onhold">Onhold</option>
        </select>
      </div>

      <hr />

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-gray-500 w-[40%]">
          <FiClock className="h-4 w-4 text-gray-500" />
          Total Hours
        </span>
        <span className="text-gray-600">{taskDetal?.hours}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-gray-500 w-[40%]">
          <GoClockFill className="h-4 w-4 text-gray-500" />
          Spent Hours
        </span>
        <span className="text-gray-600">{taskDetal?.estimate_Time}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-gray-500 w-[40%]">
          <BsCalendarDate className="h-4 w-4 text-gray-500" />
          Start Date
        </span>
        <span className="text-gray-600">
          {taskDetal?.hours ? (
            <span>
              {format(
                new Date(taskDetal?.startDate || "2024-07-26T00:00:00.000+00:00"),
                "dd-MMM-yyyy",
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
        <span className="text-gray-600">
          {format(
            new Date(taskDetal?.deadline || "2024-07-26T00:00:00.000+00:00"),
            "dd-MMM-yyyy",
          )}
        </span>
      </div>

            {timerRows}

    </>
  );

  const activityItems = sortedActivities.map((activity) => (
    <div
      key={activity?._id}
      className={
        isMobile
          ? "flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3"
          : "w-full flex flex-col gap-2 py-2 px-3 border border-gray-300 rounded-md hover:shadow-sm bg-white hover:bg-orange-50 transition-all duration-300 cursor-pointer hover:scale-[1.03] ease-in-out"
      }
    >
      <p className="text-[14px] font-medium text-green-600 flex items-center gap-2">
        <span className="w-[.8rem] h-[.8rem] rounded-full bg-green-500"></span>
        {new Date(activity?.createdAt).toLocaleString()}
      </p>
      <div className="flex items-center gap-2">
        {activity?.user?.avatar ? (
          <img
            src={activity.user.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className={`w-8 h-8 flex-shrink-0 rounded-full text-white font-semibold flex items-center justify-center uppercase ${
              AVATAR_COLORS[hashStr(activity?.user?.name) % AVATAR_COLORS.length]
            }`}
          >
            {activity?.user?.name?.slice(0, 1)}
          </div>
        )}
        <strong className="text-[16px] font-medium text-black capitalize">
          {activity?.user?.name}
        </strong>
      </div>
      <strong className="text-[15px] font-semibold text-black">
        Action:{" "}
        <span className="text-[13px] text-gray-700 ml-1 font-normal">
          {activity?.activity}
        </span>
      </strong>
    </div>
  ));

  const modals = (
    <>
      {/* Edit Modal */}
      {isOpen &&
  (isMobile ? (
    <AddTaskMobile
      users={users}
      setIsOpen={setIsOpen}
      projects={projects}
      taskId={editId}
      setTaskId={setEditId}
      taskDetal={taskDetal}
      getAllTasks={getAllTasks}
      setShowDetail={setShowDetail}
    />
  ) : (
    <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-white/60 drop-shadow-md flex items-center justify-center py-6 px-4">
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
  ))}

      {/* Stop Timer */}
      {isShow && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
          <div className="w-[32rem] max-w-[92vw] rounded-md bg-white shadow-md">
            <div className="flex flex-col gap-3">
              <div className="w-full flex items-center justify-between py-2 mt-1 px-4">
                <h3 className="text-[19px] font-semibold text-gray-800">
                  Enter your note here
                </h3>
                <span onClick={() => setIsShow(false)}>
                  <IoClose className="text-black cursor-pointer h-6 w-6" />
                </span>
              </div>
              <hr className="w-full h-[1px] bg-gray-500" />
              <div className="w-full px-4 py-2 flex-col gap-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note here..."
                  className="w-full h-[6rem] rounded-md resize-none py-1 px-2 shadow border-2 border-gray-700 text-[16px]"
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
            onReminderAdded={() => setReminderRefreshKey((prev) => prev + 1)}
          />
        </div>
      )}
    </>
  );

  // ───────────────── MOBILE ─────────────────
  if (isMobile) {
    const pane = (id, cls = "h-full") => (activeTab === id ? cls : "hidden");

    return (
      <div
        className="relative flex h-full min-h-0 w-full flex-col gap-3 p-3 pb-24"
        // keyboard open → lift content above it and drop the reserved action-bar space
        style={keyboardOpen ? { paddingBottom: keyboard } : undefined}
      >
        {!keyboardOpen && (
          <h2
            className="shrink-0 px-1 text-[16px] font-semibold leading-snug text-gray-900"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {taskDetal?.task}
          </h2>
        )}

        {/* tabs */}
        <div className="flex w-full shrink-0 rounded-xl bg-gray-200/70 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 rounded-lg py-2 text-[13px] font-medium transition ${
                activeTab === t.id ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* panes stay mounted so the timer / drafts survive tab switches */}
        <div className="relative min-h-0 flex-1">
          <div className={pane("subtasks")}>
            <Subtasks taskId={taskId} />
          </div>

          <div className={pane("details", "h-full overflow-y-auto")}>
  <div className="flex flex-col gap-3 pb-2">
    <MobileTaskFields
      task={taskDetal}
      users={users}
      projects={projects}
      onSave={patchTask}
    />
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3">
      {timerRows}
    </div>
  </div>
</div>
          <div
            className={pane(
              "comments",
              "h-full overflow-hidden rounded-xl border border-gray-200 bg-white",
            )}
          >
            <CommentMobile
              jobId={taskId}
              type="Task"
              users={userNames}
              getTasks1={() => {}}
              active={activeTab === "comments"}
            />
          </div>

          <div className={pane("activity", "h-full space-y-2 overflow-y-auto")}>
            {activityItems.length ? (
              activityItems
            ) : (
              <p className="py-10 text-center text-[13px] text-gray-400">No activity yet</p>
            )}
          </div>
        </div>

        {/* bottom action bar */}
        {!keyboardOpen && (
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex items-stretch justify-around border-t border-gray-200 bg-white px-2 pt-1.5"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 6px)" }}
          >
            <button
              type="button"
              onClick={openEdit}
              className="flex min-w-[72px] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-gray-600 active:bg-gray-100"
            >
              <FaEdit className="h-5 w-5 text-gray-800" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus(taskDetal?._id)}
              className="flex min-w-[72px] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-gray-600 active:bg-gray-100"
            >
              <MdCheckCircle className="h-5 w-5 text-green-500" />
              Complete
            </button>
            <button
              type="button"
              disabled={timerBlocksDelete}
              onClick={() => handleDeleteConfirmation(taskDetal?._id)}
              className="flex min-w-[72px] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-gray-600 active:bg-gray-100 disabled:opacity-40"
            >
              <AiFillDelete className="h-5 w-5 text-red-500" />
              Delete
            </button>
          </div>
        )}

        {modals}
      </div>
    );
  }

  // ───────────────── DESKTOP (layout unchanged) ─────────────────
  return (
    <div className="w-full h-[90vh] flex flex-col justify-between items-start gap-5 p-4 pb-16 relative">
      <div
        id="mainnnnnnn"
        className="w-full flex flex-row justify-start gap-5 items-start h-[50%]"
      >
        <div className="flex flex-col w-full px-2 h-full">
          <Subtasks taskId={taskId} />
        </div>

        <div className="flex flex-col w-full h-full bg-white border border-gray-300 rounded-md shadow-md gap-2 p-3">
          {detailsContent}
        </div>
      </div>

      <div
        id="mainnnsnnnssn"
        className="w-full flex flex-row justify-start gap-5 items-start h-[50%]"
      >
        <DetailComments jobId={taskId} type="Task" getTasks1={() => null} />

        <div className="flex flex-col w-full h-full shadow-md border border-gray-300 rounded-md bg-white">
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Activity</h3>
          </div>
          <div className="flex flex-col gap-2 w-full h-full overflow-y-auto p-2">
            {activityItems}
          </div>
        </div>
      </div>

      <div className="absolute w-full flex justify-end items-center gap-4 bottom-2 right-2">
        <span title="Edit Job" onClick={openEdit}>
          <FaEdit className="h-5 w-5 cursor-pointer text-gray-800 hover:text-gray-950" />
        </span>
        <span title="Complete Task" onClick={() => handleUpdateStatus(taskDetal?._id)}>
          <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
        </span>
        <button
          disabled={timerBlocksDelete}
          className={timerBlocksDelete ? "cursor-not-allowed" : "cursor-pointer"}
          type="button"
          title="Delete Task"
          onClick={() => handleDeleteConfirmation(taskDetal?._id)}
        >
          <AiFillDelete
            className={`h-5 w-5 text-red-500 hover:text-red-600 ${
              timerBlocksDelete ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          />
        </button>
      </div>

      {modals}
    </div>
  );
}