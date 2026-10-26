import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { format, isValid } from "date-fns";
import { TbLoader2 } from "react-icons/tb";
import BottomSheet from "./BottomSheet";
import JobDriveLinkButton from "../../../components/Modals/JobDriveLinkButton";

const toInput = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return isValid(x) ? format(x, "yyyy-MM-dd") : "";
};

const inputCls =
  "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-[16px] text-slate-800 outline-none focus:border-orange-300";

const Field = ({ label, children }) => (
  <label className="block min-w-0">
    <span className="mb-1 block text-[12px] font-medium text-slate-500">{label}</span>
    {children}
  </label>
);

export default function AddTaskMobile({
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
  const [recurring, setRecurring] = useState("");
  const [nextRecurringDate, setNextRecurringDate] = useState("");
  const [deleteCompletedRecurringSubtasks, setDeleteCompletedRecurringSubtasks] = useState(false);
  const [docLink, setDocLink] = useState("");

  // edit mode: prefill
  useEffect(() => {
    if (!taskDetal) return;
    setProjectId(taskDetal.project?._id || "");
    setJobHolder(taskDetal.jobHolder || "");
    setTask(taskDetal.task || "");
    setHours(taskDetal.hours ?? "");
    setStartDate(toInput(taskDetal.startDate));
    setDeadline(toInput(taskDetal.deadline));
    setLead(taskDetal.lead || "");
    setLabel(taskDetal.label);
    setRecurring(taskDetal.recurring || "");
    setNextRecurringDate(toInput(taskDetal.nextRecurringDate));
    setDeleteCompletedRecurringSubtasks(!!taskDetal.deleteCompletedRecurringSubtasks);
    setDocLink(taskDetal.docLink || "");
  }, [taskId, taskDetal]);

  const close = () => {
    // creating + typed something → don't lose it to a stray backdrop tap
    if (!taskId && (task.trim() || hours) && !window.confirm("Discard this task?")) return;
    setTaskId?.("");
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!task.trim()) return toast.error("Enter the task");
    if (!projectId) return toast.error("Select a department");
    if (!jobHolder) return toast.error("Select a job holder");

    const payload = {
      projectId,
      jobHolder,
      task: task.trim(),
      hours,
      startDate,
      deadline,
      lead,
      label,
      recurring,
      nextRecurringDate,
      deleteCompletedRecurringSubtasks,
      docLink,
    };

    setLoading(true);
    try {
      if (taskId) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/${taskId}`,
          payload,
        );
        toast.success("Task Updated!");
        setShowDetail?.(false);
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/tasks/create/task`,
          payload,
        );
        toast.success("Task created successfully!");
      }
      setIsOpen(false);
      getAllTasks?.();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      open
      onClose={close}
      tall
      title={taskId ? "Update task" : "Add task"}
      footer={
        <div className="flex gap-2 p-3">
          <button
            type="button"
            onClick={close}
            className="h-11 flex-1 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form-mobile"
            disabled={loading}
            className="flex h-11 flex-[1.6] items-center justify-center rounded-xl bg-orange-500 text-[15px] font-semibold text-white active:bg-orange-600 disabled:opacity-60"
          >
            {loading ? (
              <TbLoader2 className="h-5 w-5 animate-spin" />
            ) : taskId ? (
              "Update"
            ) : (
              "Create task"
            )}
          </button>
        </div>
      }
    >
      <form id="task-form-mobile" onSubmit={handleSubmit} className="space-y-4 p-4">
        <Field label="Task">
          <textarea
            rows={2}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter your task here…"
            className="w-full resize-none rounded-xl border border-slate-200 p-3 text-[16px] outline-none focus:border-orange-300"
          />
        </Field>

        <Field label="Department">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputCls}>
            <option value="">Select department</option>
            {projects?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Job holder">
          <select value={jobHolder} onChange={(e) => setJobHolder(e.target.value)} className={inputCls}>
            <option value="">Select job holder</option>
            {users?.map((u) => (
              <option key={u._id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Lead">
          <select value={lead} onChange={(e) => setLead(e.target.value)} className={inputCls}>
            <option value="">Select lead</option>
            {users?.map((u) => (
              <option key={u._id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Hours">
          <input
            inputMode="decimal"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g. 2.5"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Deadline">
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Recurring">
          <select value={recurring} onChange={(e) => setRecurring(e.target.value)} className={inputCls}>
            <option value="">Not recurring</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </Field>

        {recurring && (
          <>
            <Field label="Next recurring date">
              <input
                type="date"
                value={nextRecurringDate}
                onChange={(e) => setNextRecurringDate(e.target.value)}
                className={inputCls}
              />
            </Field>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-[14px] text-slate-700">
              <input
                type="checkbox"
                checked={deleteCompletedRecurringSubtasks}
                onChange={(e) => setDeleteCompletedRecurringSubtasks(e.target.checked)}
                className="h-5 w-5 accent-orange-500"
              />
              Delete completed subtasks
            </label>
          </>
        )}

        <div>
          <span className="mb-1 block text-[12px] font-medium text-slate-500">Drive link</span>
          <JobDriveLinkButton enabled={true} link={docLink} onSave={setDocLink} />
        </div>
      </form>
    </BottomSheet>
  );
}