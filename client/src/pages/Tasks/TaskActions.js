import { useState, useRef, useEffect } from "react";
import {
  FiChevronDown,
  FiFolder,
  FiLayers,
  FiMoreVertical,
  FiPlus,
} from "react-icons/fi";
import { TbLoader } from "react-icons/tb";
import {
  LuDownload,
  LuImport,
  LuPlusCircle,
  LuTag,
  LuUsers,
} from "react-icons/lu";
import DepartmentDropdown from "./components/DepartmentsDropdown/DepartmentDropdown";
import ProjectDropdown from "./components/ProjectsDropdown/ProjectDropdown";
import { isAdmin } from "../../utlis/isAdmin";

export default function TaskHeaderActions({
  auth,
  style,

  // dropdowns
  showDepartment,
  setShowDepartment,
  departments,
  getAllDepartments,
  setDepartmentId,
  setOpenAddDepartment,

  showProject,
  setShowProject,
  projects,
  getAllProjects,
  refetchTasks,
  setProjectId,
  setOpenAddProject,

  // actions
  importJobData,
  fLoading,
  handleExportData,
  setShowlabel,
  setIsOpen,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 w-full font-inter ">
      <div className="flex items-center gap-3">
        {isAdmin(auth) && (
          <div className="relative">
            <button
              onClick={() => setShowDepartment(!showDepartment)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FiLayers className="text-gray-400" />
              Departments
              <FiChevronDown
                className={`transition-transform ${
                  showDepartment ? "rotate-180" : ""
                }`}
              />
            </button>
            <DepartmentDropdown
              showDepartment={showDepartment}
              departments={departments}
              getAllDepartments={getAllDepartments}
              setShowDepartment={setShowDepartment}
              setDepartmentId={setDepartmentId}
              setOpenAddDepartment={setOpenAddDepartment}
            />
          </div>
        )}

        {isAdmin(auth) && (
          <div className="relative">
            <button
              onClick={() => setShowProject(!showProject)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FiFolder className="text-gray-400" />
              Projects
              <FiChevronDown
                className={`transition-transform ${
                  showProject ? "rotate-180" : ""
                }`}
              />
            </button>
            <ProjectDropdown
              showProject={showProject}
              projects={projects}
              getAllProjects={getAllProjects}
              getAllTasks={refetchTasks}
              setShowProject={setShowProject}
              setProjectId={setProjectId}
              setOpenAddProject={setOpenAddProject}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="file"
          onChange={(e) => importJobData(e.target.files[0])}
          accept=".csv, .xlsx"
          id="importJobs"
          className="hidden"
        />

        {isAdmin(auth) && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 transition-all duration-200 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm active:scale-95"
            >
              <FiMoreVertical className="w-5 h-5" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in duration-150">
                <div className="p-1.5">
                  <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Data Management
                  </div>

                  <label
                    htmlFor="importJobs"
                    className={`group flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer ${
                      fLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={(e) => fLoading && e.preventDefault()}
                  >
                    {fLoading ? (
                      <TbLoader className="h-4 w-4 animate-spin" />
                    ) : (
                      <LuImport className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
                    )}
                    <span>Import CSV / Excel</span>
                  </label>

                  <button
                    onClick={() => {
                      handleExportData();
                      setOpen(false);
                    }}
                    className="group flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <LuDownload className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
                    <span>Export Data</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 mx-1" />

                <div className="p-1.5">
                  <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Quick Actions
                  </div>

                  {[
                    {
                      label: "Add Label",
                      icon: <LuTag />,
                      action: () => setShowlabel(true),
                    },
                    {
                      label: "Add Department",
                      icon: <LuUsers />,
                      action: () => setOpenAddDepartment(true),
                    },
                    {
                      label: "Add Project",
                      icon: <LuPlusCircle />,
                      action: () => setOpenAddProject(true),
                    },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        item.action();
                        setOpen(false);
                      }}
                      className="group flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center  gap-1 px-3 py-2 text-[14px] font-[500] 
                        text-white bg-orange-500 rounded-lg shadow-md shadow-orange-200
                        hover:bg-orange-600 hover:shadow-orange-300
                        active:transform active:scale-95 transition-all duration-150"
        >
          <FiPlus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          Add Task
        </button>
      </div>
    </div>
  );
}
