import { IoClose } from "react-icons/io5";

import { style } from "../../../../utlis/CommonStyle";
import AddProjectModal from "../../../../components/Tasks/AddProjectModal";
import AddTaskModal from "../../../../components/Tasks/AddTaskModal";
import AddTaskDepartmentModal from "../../../../components/Tasks/AddTaskDepartmentModal";
import JobCommentModal from "../../../Jobs/JobCommentModal";
import AddLabel from "../../../../components/Modals/AddLabel";
import TaskDetail from "../detail/TaskDetail";
import SubtasksForNote from "../detail/SubtasksForNote";

const TaskModals = ({
  modals,
  // Shared data
  users,
  departments,
  projects,
  tasksData,
  userName,
  // Fetchers
  getAllTasks,
  getTasks1,
  getAllDepartments,
  getAllProjects,
  getlabel,
  // Actions
  handleDeleteTask,
  setTasksData,
  setFilterData,
  // UI state from parent hooks
  showDetail,
  onCloseDetail,
  showlabel,
  setShowlabel,
  assignedPerson,
  commentStatusRef,
}) => {
  const {
    // Department
    openAddDepartment,
    setOpenAddDepartment,
    departmentId,
    setDepartmentId,
    // Project
    openAddProject,
    setOpenAddProject,
    projectId,
    setProjectId,
    // Add Task
    isOpen,
    setIsOpen,
    taskId,
    setTaskId,
    // Comment
    isComment,
    setIsComment,
    commentTaskId,
    setCommentTaskId,
    // Stop Timer
    isShow,
    setIsShow,
    activity,
    setActivity,
    taskIdForNote,
    note,
    setNote,
    handleStopTimer,
    isSubmitting,
    // Task Detail
    taskID,
    projectName,
  } = modals;

  return (
    <>
      {/* ----------------Add Task Department-------- */}
      {openAddDepartment && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6 px-4">
          <AddTaskDepartmentModal
            users={users}
            setOpenAddDepartment={setOpenAddDepartment}
            getAllDepartments={getAllDepartments}
            departmentId={departmentId}
            setDepartmentId={setDepartmentId}
            getTasks1={getTasks1}
          />
        </div>
      )}

      {/* ----------------Add Project-------- */}
      {openAddProject && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6 px-4">
          <AddProjectModal
            users={users}
            setOpenAddProject={setOpenAddProject}
            getAllProjects={getAllProjects}
            projectId={projectId}
            setProjectId={setProjectId}
            getTasks1={getTasks1}
            departments={departments}
          />
        </div>
      )}

      {/* -----------Add Task-------------- */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6 px-4">
          <AddTaskModal
            users={users}
            setIsOpen={setIsOpen}
            projects={projects}
            taskId={""}
            setTaskId={setTaskId}
            getAllTasks={getAllTasks}
            taskDetal={null}
          />
        </div>
      )}

      {/* ------------Comment Modal---------*/}
      {isComment && (
        <div
          ref={commentStatusRef}
          className="fixed bottom-4 right-4 w-[30rem] max-h-screen z-[999] flex items-center justify-center"
        >
          <JobCommentModal
            setIsComment={setIsComment}
            jobId={commentTaskId}
            setJobId={setCommentTaskId}
            users={userName}
            type={"Task"}
            getTasks1={getTasks1}
            page={"task"}
          />
        </div>
      )}

      {/* -------------Stop Timer Modal-----------*/}
      {isShow && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
          <div className="w-[32rem] rounded-md bg-white shadow-md">
            <div className="flex flex-col gap-3">
              <div className="w-full flex items-center justify-between py-2 mt-1 px-4">
                <h3 className="text-[19px] font-semibold text-gray-800">
                  Enter End Note
                </h3>
                <span onClick={() => setIsShow(false)}>
                  <IoClose className="text-black cursor-pointer h-6 w-6" />
                </span>
              </div>
              <hr className="w-full h-[1px] bg-gray-500" />
              <div className="flex justify-start items-center gap-4 px-4 py-2">
                {activity === "Chargeable" ? (
                  <button
                    className="px-4 h-[2.6rem] min-w-[5rem] flex items-center justify-center rounded-md cursor-pointer shadow-md text-white border-none outline-none bg-green-500 hover:bg-green-600"
                    onClick={() => setActivity("Non-Chargeable")}
                    style={{ width: "8rem", fontSize: "14px" }}
                  >
                    Chargeable
                  </button>
                ) : (
                  <button
                    className="px-4 h-[2.6rem] min-w-[5rem] flex items-center justify-center rounded-md cursor-pointer shadow-md text-white border-none outline-none bg-red-500 hover:bg-red-600"
                    onClick={() => setActivity("Chargeable")}
                    style={{ width: "9rem", fontSize: "14px" }}
                  >
                    Non-Chargeable
                  </button>
                )}
                <SubtasksForNote
                  taskId={taskIdForNote}
                  onSelect={(option) => setNote(option)}
                />
              </div>
              <div className="w-full px-4 py-2 flex-col gap-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note here..."
                  className="w-full h-[6rem] rounded-md resize-none py-1 px-2 shadow border-2 border-gray-700"
                />
                <div className="flex items-center justify-end mt-4">
                  <button
                    className={`${style.btn} flex items-center justify-center space-x-1`}
                    onClick={handleStopTimer}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex space-x-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-150"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-300"></span>
                      </span>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*---------------Task Details---------------*/}
      {showDetail && (
        <div className="fixed inset-0 z-[499] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-gray-100 rounded-xl shadow-lg w-[95%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[70%] 3xl:w-[60%] py-4 px-5">
            <div className="h-full w-full flex flex-col justify-start items-center relative">
              <div className="flex items-center justify-between border-b pb-2 mb-3 self-start w-full">
                <h3 className="text-lg font-semibold">
                  Project: {projectName}
                </h3>
                <button
                  className="p-1 rounded-2xl bg-gray-50 border hover:shadow-md hover:bg-gray-100"
                  onClick={onCloseDetail}
                >
                  <IoClose className="h-5 w-5" />
                </button>
              </div>
              <TaskDetail
                taskId={taskID}
                getAllTasks={getAllTasks}
                handleDeleteTask={handleDeleteTask}
                setTasksData={setTasksData}
                setShowDetail={onCloseDetail}
                users={users}
                projects={projects}
                setFilterData={setFilterData}
                tasksData={tasksData}
                assignedPerson={assignedPerson}
                setTaskIdForNote={modals.setTaskIdForNote}
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------Add label------------- */}
      {showlabel && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
          <AddLabel
            setShowlabel={setShowlabel}
            type={"task"}
            getLabels={getlabel}
          />
        </div>
      )}
    </>
  );
};

export default TaskModals;
