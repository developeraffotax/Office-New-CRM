import DraggableFilterTabs from "./DraggableFilterTabs";
import ColumnControlsPopup from "./ColumnControlsPopup";
import { IoBriefcaseOutline } from "react-icons/io5";
import { MdAutoGraph, MdOutlineModeEdit } from "react-icons/md";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { GrUpdate } from "react-icons/gr";

const TaskFilterBar = ({
  allDepartmentsSelected,
  departments,
  tasksData,
  filter1,
  filter3,
  setFilter1,
  updateDepartment,
  updateProject,
  updateJobHolder,
  activeBtn,
  setActiveBtn,
  showCompleted,
  setShowCompleted,
  setActive,
  showJobHolder,
  setShowJobHolder,
  showStatus,
  setShowStatus,
  showEdit,
  setShowEdit,
  showColumn,
  setShowColumn,
  showColumnRef,
  columnVisibility,
  toggleColumnVisibility,
  selectedUsers,
  setSelectedUsers,
  userName,
  user_tasks_count_map,
  isLoad,
  getTasks1,
  getAllProjects,
}) => (
  <>
    <div className="flex items-center flex-row overflow-x-auto hidden1 gap-2 mt-3 max-lg:hidden">
      {/* All tab */}
      <div
        className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
          allDepartmentsSelected &&
          " border-2 border-b-0 text-orange-600 border-gray-300"
        }`}
        onClick={() => {
          setShowCompleted(false);
          updateDepartment("");
          updateProject("");
          updateJobHolder("");
          setFilter1("All");
        }}
      >
        All
      </div>

      {/* Department tabs */}
      <DraggableFilterTabs
        droppableId={"departments"}
        items={departments}
        filterValue={filter1}
        tasks={tasksData}
        getCountFn={(department, tasks) =>
          tasks.filter((t) =>
            t.project?.departments?.some((d) => d._id === department?._id),
          ).length
        }
        getLabelFn={(department) => department?.departmentName}
        onClick={(dep) => {
          const newValue =
            filter1 === dep.departmentName ? "" : dep.departmentName;
          updateDepartment(newValue);
          updateProject("");
          updateJobHolder("");
        }}
        onDragEnd={() => {}}
        activeClassName={
          filter1 ? "border-2 border-b-0 text-orange-600 border-gray-300" : ""
        }
      />

      {/* Completed tab */}
      <div
        className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
          activeBtn === "completed" &&
          showCompleted &&
          " border-2 border-b-0 text-orange-600 border-gray-300"
        }`}
        onClick={() => {
          setActiveBtn("completed");
          setShowCompleted(true);
          setActive("");
        }}
      >
        Completed
      </div>

      {/* Job Holder icon */}
      <span
        className={` p-1 rounded-md hover:shadow-md bg-gray-50 mb-1 cursor-pointer border ${
          activeBtn === "jobHolder" &&
          showJobHolder &&
          "bg-orange-500 text-white"
        }`}
        onClick={() => {
          setActiveBtn("jobHolder");
          setShowJobHolder(!showJobHolder);
        }}
        title="Filter by Job Holder"
      >
        <IoBriefcaseOutline className="h-6 w-6 cursor-pointer" />
      </span>

      {/* Status icon */}
      <span
        className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
          activeBtn === "status" && "bg-orange-500 text-white"
        }`}
        onClick={() => {
          setActiveBtn("status");
          setShowStatus(!showStatus);
        }}
        title="Filter by Job Status"
      >
        <MdAutoGraph className="h-6 w-6 cursor-pointer" />
      </span>

      {/* Bulk edit icon */}
      <span
        className={`hidden sm:block p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
          showEdit && "bg-orange-500 text-white"
        }`}
        onClick={() => setShowEdit(!showEdit)}
        title="Edit Multiple Tasks"
      >
        <MdOutlineModeEdit className="h-6 w-6 cursor-pointer" />
      </span>

      {/* Column visibility eye */}
      <div className="relative">
        <div
          className={`p-[6px] rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
            showColumn && "bg-orange-500 text-white"
          }`}
          onClick={() => setShowColumn(!showColumn)}
        >
          {showColumn ? (
            <GoEyeClosed className="h-5 w-5" />
          ) : (
            <GoEye className="h-5 w-5" />
          )}
        </div>
        {showColumn && (
          <div
            ref={showColumnRef}
            className="fixed top-32 left-[50%] z-[9999] w-[12rem]"
          >
            <ColumnControlsPopup
              columnVisibility={columnVisibility}
              toggleColumnVisibility={toggleColumnVisibility}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              userName={userName}
              user_tasks_count_map={user_tasks_count_map}
            />
          </div>
        )}
      </div>

      {/* Refresh */}
      <span
        className={` p-[6px] rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
        onClick={() => {
          getTasks1();
          getAllProjects();
        }}
        title="Refresh Data"
      >
        <GrUpdate
          className={`h-5 w-5 cursor-pointer ${
            isLoad && "animate-spin text-sky-500"
          }`}
        />
      </span>
    </div>

    <hr className="mb-1 bg-gray-300 w-full h-[1px] max-lg:hidden" />
  </>
);

export default TaskFilterBar;
