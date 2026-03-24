import { style } from "../../../../utlis/CommonStyle";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { LuImport } from "react-icons/lu";
import { TbLoader } from "react-icons/tb";
import QuickAccess from "../../../../utlis/QuickAccess";
import OverviewForPages from "../../../../utlis/overview/OverviewForPages";
import { isAdmin } from "../../../../utlis/isAdmin";
import DepartmentDropdown from "../DepartmentsDropdown/DepartmentDropdown";
import ProjectDropdown from "../ProjectsDropdown/ProjectDropdown";
import { useTaskCtx } from "../../contextApi/UserContext";

const TaskPageHeader = ({ onClearFilters }) => {
  const {
    auth,
    departments,
    projects,
    getAllTasks,
    getAllDepartments,
    getAllProjects,
    showDepartment,
    setUI,
    showProject,
    setShowProject,
    fLoading,
    importJobData,
    handleExportData,
    setShowlabel,
    setDepartmentId,
    setOpenAddDepartment,
    setProjectId,
    setOpenAddProject,
    setIsOpen,
  } = useTaskCtx();

  return (
  <div className="flex text-start sm:items-center sm:justify-between gap-4 flex-col sm:flex-row">
    <div className="flex items-center gap-3 ">
      <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
        Tasks
      </h1>

      <span
        className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
        onClick={onClearFilters}
        title="Clear filters"
      >
        <IoClose className="h-6 w-6 text-white" />
      </span>

      <span>
        <QuickAccess />
      </span>

      {isAdmin(auth) && (
        <span className=" mb-2">
          <OverviewForPages />
        </span>
      )}
    </div>

    <div className="flex items-center gap-4">
      {auth?.user?.role?.name === "Admin" && (
        <div
          className=" relative w-[8rem] border-2 border-gray-200 rounded-md py-1 px-2 hidden sm:flex items-center justify-between gap-1"
          onClick={() => setUI((prev) => ({ ...prev, showDepartment: true }))}
        >
          <span className="text-[15px] text-gray-900 cursor-pointer">
            Departments
          </span>
          <span
            onClick={() => setUI((prev) => ({ ...prev, showDepartment: true }))}
            className="cursor-pointer"
          >
            {!showDepartment ? (
              <IoIosArrowDown className="h-5 w-5 text-black cursor-pointer" />
            ) : (
              <IoIosArrowUp className="h-5 w-5 text-black cursor-pointer" />
            )}
          </span>
          <DepartmentDropdown
            showDepartment={showDepartment}
            departments={departments}
            getAllDepartments={getAllDepartments}
            setDepartmentId={setDepartmentId}
            setOpenAddDepartment={setOpenAddDepartment}
          />
        </div>
      )}

      {auth?.user?.role?.name === "Admin" && (
        <div
          className=" relative w-[8rem] border-2 border-gray-200 rounded-md py-1 px-2 hidden sm:flex items-center justify-between gap-1"
          onClick={() => setShowProject(!showProject)}
        >
          <span className="text-[15px] text-gray-900 cursor-pointer">
            Projects
          </span>
          <span
            onClick={() => setShowProject(!showProject)}
            className="cursor-pointer"
          >
            {!showProject ? (
              <IoIosArrowDown className="h-5 w-5 text-black cursor-pointer" />
            ) : (
              <IoIosArrowUp className="h-5 w-5 text-black cursor-pointer" />
            )}
          </span>
          <ProjectDropdown
            showProject={showProject}
            projects={projects}
            getAllProjects={getAllProjects}
            getAllTasks={getAllTasks}
            setShowProject={setShowProject}
            setProjectId={setProjectId}
            setOpenAddProject={setOpenAddProject}
          />
        </div>
      )}

      <form>
        <input
          type="file"
          name="file"
          onChange={(e) => importJobData(e.target.files[0])}
          accept=".csv, .xlsx"
          id="importJobs"
          className="hidden"
        />
        <label
          htmlFor="importJobs"
          className={`${
            style.button1
          } !bg-gray-100 !shadow-none text-black hidden sm:flex hover:bg-orange-500 text-[15px] ${
            fLoading ? "cursor-not-allowed opacity-90" : ""
          }`}
          style={{ padding: ".4rem 1.1rem", color: "#000" }}
          title={"Import csv or excel file!"}
          onClick={(e) => fLoading && e.preventDefault()}
        >
          {fLoading ? (
            <TbLoader className="h-6 w-6 animate-spin text-black" />
          ) : (
            "Import"
          )}
        </label>
      </form>

      <button
        className={`px-4 h-[2.2rem] hidden sm:flex items-center justify-center gap-1 rounded-md hover:shadow-md text-gray-800 bg-sky-100 hover:text-white hover:bg-sky-600 text-[15px] `}
        onClick={handleExportData}
        title="Export Data"
      >
        <LuImport className="h-6 w-6 " /> Export
      </button>

      <button
        className={`${style.button1} text-[15px] `}
        onClick={() => setShowlabel(true)}
        style={{ padding: ".4rem 1rem" }}
      >
        Add Label
      </button>

      <button
        className={`${style.button1} text-[15px] `}
        onClick={() => setOpenAddDepartment(true)}
        style={{ padding: ".4rem 1rem" }}
      >
        Add Department
      </button>

      <button
        className={`${style.button1} text-[15px] `}
        onClick={() => setOpenAddProject(true)}
        style={{ padding: ".4rem 1rem" }}
      >
        Add Project
      </button>

      <button
        className={`${style.button1} text-[15px] `}
        onClick={() => setIsOpen(true)}
        style={{ padding: ".4rem 1rem" }}
      >
        Add Task
      </button>
    </div>
  </div>
  );
};

export default TaskPageHeader;
