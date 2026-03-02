import { style } from "../../../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";

const BulkEditForm = ({
  projects,
  users,
  status,
  project,
  setProject,
  jobHolder,
  setJobHolder,
  lead,
  setLead,
  startDate,
  setStartDate,
  deadline,
  setDeadline,
  taskDate,
  setTaskDate,
  tstatus,
  setTStatus,
  hours,
  setHours,
  isUpload,
  onSubmit,
}) => {
  return (
    <div className="w-full py-2">
      <form
        onSubmit={onSubmit}
        className="w-full flex items-center flex-wrap gap-2"
      >
        <div>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className={`${style.input} w-full`}
            style={{ width: "8rem" }}
          >
            <option value="empty">Project</option>
            {projects.map((project, i) => (
              <option value={project._id} key={i}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={jobHolder}
            onChange={(e) => setJobHolder(e.target.value)}
            className={`${style.input} w-full`}
            style={{ width: "7rem" }}
          >
            <option value="empty">Assign</option>
            {users.map((jobHold, i) => (
              <option value={jobHold.name} key={i}>
                {jobHold.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={lead}
            onChange={(e) => setLead(e.target.value)}
            className={`${style.input} w-full`}
            style={{ width: "7rem" }}
          >
            <option value="empty">Owner</option>
            {users.map((jobHold, i) => (
              <option value={jobHold.name} key={i}>
                {jobHold.name}
              </option>
            ))}
          </select>
        </div>
        <div className="inputBox" style={{ width: "8.5rem" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`${style.input} w-full`}
          />
          <span>Start Date</span>
        </div>
        <div className="inputBox" style={{ width: "8.5rem" }}>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={`${style.input} w-full`}
          />
          <span>Deadline</span>
        </div>
        <div className="inputBox" style={{ width: "8.5rem" }}>
          <input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className={`${style.input} w-full`}
          />
          <span>Task Date</span>
        </div>
        <div>
          <select
            value={tstatus}
            onChange={(e) => setTStatus(e.target.value)}
            className={`${style.input} w-full`}
            style={{ width: "6.5rem" }}
          >
            <option value="empty">Status</option>
            {status.map((stat, i) => (
              <option value={stat} key={i}>
                {stat}
              </option>
            ))}
          </select>
        </div>
        <div className="inputBox" style={{ width: "6rem" }}>
          <input
            type="text"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className={`${style.input} w-full`}
          />
          <span>Hours</span>
        </div>
        <div className="flex items-center justify-end pl-4">
          <button
            className={`${style.button1} text-[15px]`}
            type="submit"
            disabled={isUpload}
            style={{ padding: ".5rem 1rem" }}
          >
            {isUpload ? (
              <TbLoader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </form>
      <hr className="mb-1 bg-gray-300 w-full h-[1px] mt-4" />
    </div>
  );
};

export default BulkEditForm;
