import AddProjectModal from "../../components/Tasks/AddProjectModal";
import AddTaskModal from "../../components/Tasks/AddTaskModal";
import AddLabel from "../../components/Modals/AddLabel";
import AnchoredPopover from "../../components/AnchoredPopover";
import BottomSheet from "./components/BottomSheet";
import CommentDesktop from "./components/CommentDesktop";
import TaskDetail from "./TaskDetail";
import SubtasksForNote from "./SubtasksForNote";
import { style } from "../../utlis/CommonStyle";
import { IoClose, IoChevronBack } from "react-icons/io5";
import CommentMobile from "./components/CommentMobile";
import AddTaskMobile from "./components/AddTaskMobile";

export default function AllTasksModals({ c, isMobile }) {
  const commentModal = (maxHeight) => (
    <CommentDesktop
      setIsComment={c.setIsComment}
      jobId={c.commentTaskId}
      setJobId={c.setCommentTaskId}
      users={c.userName}
      type={"Task"}
      getTasks1={c.refetchTasks}
      page={"task"}
      anchored
      maxHeight={maxHeight}
    />
  );

  return (
    <>
      {/* ----------------Add Project-------- */}
      {c.openAddProject && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6 px-4">
          <AddProjectModal
            users={c.users}
            setOpenAddProject={c.setOpenAddProject}
            getAllProjects={c.getAllProjects}
            projectId={c.projectId}
            setProjectId={c.setProjectId}
            getTasks1={c.refetchTasks}
            departments={c.departments}
          />
        </div>
      )}

      {/* -----------Add Task-------------- */}
{c.isOpen &&
  (isMobile ? (
    <AddTaskMobile
      users={c.users}
      setIsOpen={c.setIsOpen}
      projects={c.projects}
      taskId={""}
      setTaskId={c.setTaskId}
      getAllTasks={c.refetchTasks}
      taskDetal={null}
    />
  ) : (
    <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6 px-4">
      <AddTaskModal
        users={c.users}
        setIsOpen={c.setIsOpen}
        projects={c.projects}
        taskId={""}
        setTaskId={c.setTaskId}
        getAllTasks={c.refetchTasks}
        taskDetal={null}
      />
    </div>
  ))}

{/* ------------Comments (sheet on mobile, popover on desktop)--------- */}
{c.isComment &&
  (isMobile ? (
    <BottomSheet open onClose={c.closeComment} title="Comments" tall flush>
      <CommentMobile
        jobId={c.commentTaskId}
        type="Task"
        users={c.userName}
        getTasks1={c.refetchTasks}
      />
    </BottomSheet>
  ) : (
    <AnchoredPopover
      open={c.isComment}
      anchorEl={c.commentAnchorEl}
      onClose={c.closeComment}
    >
      {(maxHeight) => commentModal(maxHeight)}
    </AnchoredPopover>
  ))}

      {/* -------------Stop Timer-----------*/}
      {c.isShow && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
          <div className="w-[32rem] max-w-[92vw] rounded-md bg-white shadow-md">
            <div className="flex flex-col gap-3">
              <div className="w-full flex items-center justify-between py-2 mt-1 px-4">
                <h3 className="text-[19px] font-semibold text-gray-800">
                  Enter End Note
                </h3>
                <span onClick={() => c.setIsShow(false)}>
                  <IoClose className="text-black cursor-pointer h-6 w-6" />
                </span>
              </div>
              <hr className="w-full h-[1px] bg-gray-500" />
              <div className="flex justify-start items-center gap-4 px-4 py-2">
                {c.activity === "Chargeable" ? (
                  <button
                    className="px-4 h-[2.6rem] min-w-[5rem] flex items-center justify-center rounded-md cursor-pointer shadow-md text-white border-none outline-none bg-green-500 hover:bg-green-600"
                    onClick={() => c.setActivity("Non-Chargeable")}
                    style={{ width: "8rem", fontSize: "14px" }}
                  >
                    Chargeable
                  </button>
                ) : (
                  <button
                    className="px-4 h-[2.6rem] min-w-[5rem] flex items-center justify-center rounded-md cursor-pointer shadow-md text-white border-none outline-none bg-red-500 hover:bg-red-600"
                    onClick={() => c.setActivity("Chargeable")}
                    style={{ width: "9rem", fontSize: "14px" }}
                  >
                    Non-Chargeable
                  </button>
                )}

                <SubtasksForNote
                  taskId={c.taskIdForNote}
                  onSelect={(option) => c.setNote(option)}
                />
              </div>
              <div className="w-full px-4 py-2 flex-col gap-4">
                <textarea
                  value={c.note}
                  onChange={(e) => c.setNote(e.target.value)}
                  placeholder="Add note here..."
                  className="w-full h-[6rem] rounded-md resize-none py-1 px-2 shadow border-2 border-gray-700"
                />
                <div className="flex items-center justify-end mt-4">
                  <button
                    className={`${style.btn} flex items-center justify-center space-x-1`}
                    onClick={c.handleStopTimer}
                    disabled={c.isSubmitting}
                  >
                    {c.isSubmitting ? (
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
      {c.showDetail && (
        <div
          className={
            isMobile
              ? "fixed inset-0 z-[499] flex flex-col bg-gray-100"
              : "fixed inset-0 z-[499] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          }
        >
          <div
            className={
              isMobile
                ? "flex min-h-0 flex-1 flex-col"
                : "bg-gray-100 rounded-xl shadow-lg w-[95%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[70%] 3xl:w-[60%] py-4 px-5"
            }
          >
            <div
              className={`flex w-full items-center justify-between ${
                isMobile
                  ? "shrink-0 gap-2 border-b border-gray-200 bg-white px-2 pb-2"
                  : "self-start border-b pb-2 mb-3"
              }`}
              style={
                isMobile
                  ? { paddingTop: "calc(env(safe-area-inset-top) + 8px)" }
                  : undefined
              }
            >
              {isMobile && (
                <button
                  onClick={() => c.setShowDetail(false)}
                  aria-label="Back"
                  className="flex h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
                >
                  <IoChevronBack className="h-6 w-6" />
                </button>
              )}
              <h3
                className={`min-w-0 flex-1 truncate font-semibold ${
                  isMobile ? "text-[16px]" : "text-lg"
                }`}
              >
                Project: {c.projectName}
              </h3>
              {!isMobile && (
                <button
                  className="p-1 rounded-2xl bg-gray-50 border hover:shadow-md hover:bg-gray-100"
                  onClick={() => c.setShowDetail(false)}
                >
                  <IoClose className="h-5 w-5" />
                </button>
              )}
            </div>

            <div
              className={
                isMobile
                  ? "min-h-0 flex-1"
                  : "h-full w-full flex flex-col justify-start items-center relative"
              }
            >
              <TaskDetail
                taskId={c.taskID}
                getAllTasks={c.refetchTasks}
                handleDeleteTask={c.deleteTask}
                setTasksData={c.setTasksData}
                setShowDetail={c.setShowDetail}
                users={c.users}
                projects={c.projects}
                setFilterData={() => {}}
                tasksData={c.tasksData}
                assignedPerson={
                  c.tasksData?.find((t) => t._id === c.taskID)?.jobHolder
                }
                setTaskIdForNote={c.setTaskIdForNote}
              />
            </div>
          </div>
        </div>
      )}

      {c.showlabel && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
          <AddLabel
            setShowlabel={c.setShowlabel}
            type={"task"}
            getLabels={c.getlabel}
          />
        </div>
      )}
    </>
  );
}