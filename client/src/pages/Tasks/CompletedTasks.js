import React, { useEffect, useMemo, useRef, useState } from "react";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import AddProjectModal from "../../components/Tasks/AddProjectModal";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { IoBriefcaseOutline, IoClose } from "react-icons/io5";
import {
  MdAutoGraph,
  MdInsertComment,
  MdOutlineEdit,
  MdOutlineKeyboardBackspace,
} from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
 
import { TbCalendarDue } from "react-icons/tb";
import AddTaskModal from "../../components/Tasks/AddTaskModal";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { mkConfig, generateCsv, download } from "export-to-csv";
import JobCommentModal from "../Jobs/JobCommentModal";
import TaskDetail from "./TaskDetail";
import { MdBackspace } from "react-icons/md";
import TimeEditor from "../../utlis/TimeSelector";
import Subtasks from "./Subtasks";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useDispatch, useSelector } from "react-redux";
import { setFilterId } from "../../redux/slices/authSlice";
import { getCompletedTaskColumns } from "./table/columns";
import DraggableFilterTabs from "./DraggableFilterTabs";







function useColumnFilterSync(table, columnId, value, setValue) {
  useEffect(() => {
    if (!table) return;
    const col = table.getColumn(columnId);
    if (!col) return;

    const val = col.getFilterValue() || "";
    if (val !== value) setValue(val);
  }, [table, columnId, table.getState().columnFilters, value, setValue]);

  // For outside → table, just call this instead of another effect:
  const updateFilter = (val) => {
    table.getColumn(columnId)?.setFilterValue(val || undefined);
    setValue(val);
  };

  return updateFilter;
}







// CSV Configuration
const csvConfig = mkConfig({
  filename: "full_table_data",
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  showTitle: true,
  title: "Exported Tasks Table Data",
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
});

const CompletedTasks = ({
  setShowCompleted,
  setActive2,
  getTasks,
  getAllProj1,
}) => {
 

  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.auth);
  const filterId = useSelector((state) => state.auth.filterId);


  const [departments, setDepartments] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [openAddProject, setOpenAddProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [showProject, setShowProject] = useState(false);
  const [active, setActive] = useState("All");
  const [activeBtn, setActiveBtn] = useState("");
  const [taskId, setTaskId] = useState("");
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  // Timer
  const [play, setPlay] = useState(false);
  const timerRef = useRef();
  const [isShow, setIsShow] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  // Filters
  const [showJobHolder, setShowJobHolder] = useState(false);
  const [showDue, setShowDue] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [active1, setActive1] = useState("");
  const [filterData, setFilterData] = useState([]);
  const [isComment, setIsComment] = useState(false);
  const [commentTaskId, setCommentTaskId] = useState("");
  const [userName, setUserName] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [taskID, setTaskID] = useState("");
  const [projectName, setProjectName] = useState("");
  const [labelData, setLabelData] = useState([]);
  const [totalHours, setTotalHours] = useState("0");





  const [filter1, setFilter1] = useState("");
  const [filter2, setFilter2] = useState("");
  const [filter3, setFilter3] = useState("");













  const dateStatus = ["Due", "Overdue"];

  const status = ["Todo", "Progress", "Review", "Onhold"];

  console.log("projects:", projects);
 
  //---------- Get All Departments-----------
  const getAllDepartments = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/department`
      );
      if (data?.success) {
        if (auth?.user?.role?.name === "Admin") {
          // Admin: show all
          setDepartments(data?.departments || []);
        } else {
          // Non-admin: only include departments linked to projects user is in
          const userProjects = allProjects.filter((project) =>
            project.users_list.some((user) => user._id === auth?.user?.id)
          );

          // Collect all department IDs from user's projects
          const projectDepartmentIds = userProjects
            .flatMap((proj) => proj.departments?.map((d) => d._id)) // many-to-many
            .filter(Boolean);

          // Deduplicate IDs (in case user has multiple projects in the same department)
          const uniqueDeptIds = [...new Set(projectDepartmentIds)];

          // Filter the full department list based on user's accessible departments
          const filteredDepartments = data.departments.filter((dep) =>
            uniqueDeptIds.includes(dep._id)
          );

          setDepartments(filteredDepartments || []);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth) {
      getAllDepartments();
    }
  }, [auth, allProjects]);








    // Add label in Task
    const addlabelTask = async (id, name, color) => {
      try {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/tasks/add/label/${id}`,
          { name, color }
        );
        if (data) {
          if (filterId || active !== "All" || filterData || active1) {
            setFilterData((prevData = []) =>
              prevData?.map((item) =>
                item._id === id ? { ...item, label: { name, color } } : item
              )
            );
          }
          setTasksData((prevData = []) =>
            prevData?.map((item) =>
              item._id === id ? { ...item, label: { name, color } } : item
            )
          );
  
          if (name) {
            toast.success("label added!");
          } else {
            toast.success("label Updated!");
          }
  
          getAllTasks();
        }
      } catch (error) {
        console.log(error);
        toast.error("Error while add label");
      }
    };




    console.log("tasksData 🤎🤎🖤💜💜💙💙💚💚💛💛🧡🧡❤ DATA:", tasksData, );

  // -------Get All Tasks----->
  const getAllTasks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/completed`
      );
      setTasksData(data?.tasks);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTasks();
    // eslint-disable-next-line
  }, []);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );

      // setUsers(data?.users);
      setUserName(data?.users.map((user) => user.name));
      setUsers(
        data?.users?.filter((user) =>
          user?.role?.access?.some((item) =>
            item?.permission?.includes("Tasks")
          )
        ) || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  //---------- Get All Projects-----------
  const getAllProjects = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/get_all/project`
      );

      setAllProjects(data?.projects);
      setProjects(data?.projects);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllProjects();
    // eslint-disable-next-line
  }, []);

  //   Get All Labels
  const getlabel = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/get/labels/task`
      );
      if (data.success) {
        setLabelData(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getlabel();
  }, []);

  // ---------Delete Project-------->
  const handleDeleteConfirmation = (projectId) => {
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
        deleteProject(projectId);
        Swal.fire("Deleted!", "Your job has been deleted.", "success");
      }
    });
  };
  const deleteProject = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/delete/project/${id}`
      );
      if (data) {
        getAllProjects();
        // toast.success("Project Deleted!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    const totalHours = tasksData.reduce(
      (sum, client) => sum + Number(client.hours),
      0
    );
    setTotalHours(totalHours.toFixed(0));
    if (active === "All" && !active1) {
      if (filterData) {
        const totalHours = tasksData.reduce(
          (sum, client) => sum + Number(client.hours),
          0
        );
        setTotalHours(totalHours.toFixed(0));
      }
    } else {
      if (filterData) {
        const totalHours = filterData.reduce(
          (sum, client) => sum + Number(client.hours),
          0
        );
        setTotalHours(totalHours.toFixed(0));
      }
    }
  }, [tasksData, filterData, active, active1, activeBtn]);

  const handleUpdateStatus = (projectId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this project!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateProjectStatus(projectId);
        Swal.fire(
          "Project Completed!",
          "Your project has been updated.",
          "success"
        );
      }
    });
  };

  const updateProjectStatus = async (id) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/update/status/${id}`
      );
      if (data) {
        getAllProjects();
        setShowProject(false);
        getAllProj1();
        // toast.success("Project completed!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  // ------------------------------Tasks----------------->

  // ------------Filter By Projects---------->
  const getProjectsCount = (project) => {
    if (project === "All") {
      return tasksData?.length;
    }
    return tasksData.filter((item) => item?.project?.projectName === project)
      ?.length;
  };

  // --------------Job_Holder Length---------->

  const getJobHolderCount = (user, project) => {
    return tasksData.filter((item) =>
      project === "All"
        ? item?.jobHolder === user
        : item?.jobHolder === user && item?.project?.projectName === project
    )?.length;
  };

  // -------Due & Overdue count------->
  const getDueAndOverdueCountByDepartment = (project) => {
    const filteredData = tasksData.filter(
      (item) => item.project?.projectName === project || project === "All"
    );

    const dueCount = filteredData.filter(
      (item) => getStatus(item.deadline, item.startDate) === "Due"
    ).length;
    const overdueCount = filteredData.filter(
      (item) => getStatus(item.deadline, item.startDate) === "Overdue"
    ).length;

    return { due: dueCount, overdue: overdueCount };
  };

  // --------------Status Length---------->
  const getStatusCount = (status, projectName) => {
    return tasksData.filter((item) =>
      projectName === "All"
        ? item?.status === status
        : item?.status === status && item?.project?.projectName === projectName
    )?.length;
  };

  // --------------Filter Data By Department ----------->

  const filterByDep = (value) => {
    const filteredData = tasksData.filter(
      (item) =>
        item.project?.projectName === value ||
        item.status === value ||
        item.jobHolder === value ||
        item._id === value
    );

    console.log("FilterData", filteredData);

    setFilterData([...filteredData]);
  };

  useEffect(() => {
    if (tasksData && filterId) {
      filterByDep(filterId);
    }
    // eslint-disable-next-line
  }, [tasksData, filterId]);

  // -------------- Filter Data By Department || Status || Placeholder ----------->

  const filterByProjStat = (value, proj) => {
    let filteredData = [];

    if (proj === "All") {
      filteredData = tasksData.filter(
        (item) =>
          item.status === value ||
          item.jobHolder === value ||
          getStatus(item.deadline, item.startDate) === value ||
          getStatus(item.deadline, item.startDate) === value
      );
    } else {
      filteredData = tasksData.filter((item) => {
        const jobMatches = item.project?.projectName === proj;
        const statusMatches = item.status === value;
        const holderMatches = item.jobHolder === value;

        return (
          (holderMatches && jobMatches) ||
          (statusMatches && jobMatches) ||
          (jobMatches && getStatus(item.deadline, item.startDate) === value) ||
          (jobMatches && getStatus(item.deadline, item.startDate) === value)
        );
      });
    }

    setFilterData([...filteredData]);
  };

  // -----------Update Task-Project-------->
  const updateTaskProject = async (taskId, projectId) => {
    if (!taskId || !projectId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/project/${taskId}`,
        { projectId: projectId }
      );
      if (data?.success) {
        const updateTask = data?.task;
        toast.success("Project updated!");
        setTasksData((prevData) =>
          prevData.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // -----------Update JobHolder -/- Lead | Status-------->
  const updateTaskJLS = async (taskId, jobHolder, lead, status) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${taskId}`,
        { jobHolder, lead, status }
      );
      if (data?.success) {
        const updateTask = data?.task;
        toast.success("Task updated successfully!");
        if (filterId || active || active1) {
          setFilterData((prevData) =>
            prevData.map((item) =>
              item._id === updateTask._id ? updateTask : item
            )
          );
        }

        setTasksData((prevData) =>
          prevData.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );

        getTasks();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // -----------Update Alocate Task-------->
  const updateAlocateTask = async (
    taskId,
    allocateTask,
    startDate,
    deadline
  ) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/allocate/task/${taskId}`,
        { allocateTask, startDate, deadline }
      );
      if (data?.success) {
        const updateTask = data?.task;
        // toast.success("Task updated successfully!");
        setTasksData((prevData) =>
          prevData.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // -----------Handle Custom date filter------
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  // <-----------Task Status------------->
  const getStatus = (jobDeadline, yearEnd) => {
    const deadline = new Date(jobDeadline);
    const yearEndDate = new Date(yearEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const yearEndDateOnly = new Date(yearEndDate);
    yearEndDateOnly.setHours(0, 0, 0, 0);

    if (deadlineDate < today || yearEndDateOnly < today) {
      return "Overdue";
    } else if (
      deadlineDate.getTime() === today.getTime() ||
      yearEndDateOnly.getTime() === today.getTime()
    ) {
      return "Due";
    }
    return "";
  };

  // -----------Copy Task------->

  const copyTask = async (originalTask) => {
    const taskCopy = { ...originalTask };
    taskCopy.task = "";

    // delete taskCopy._id;
    // setTasksData((prevData) => [...prevData, taskCopy]);

    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/tasks/create/task`,
      {
        projectId: taskCopy.project._id,
        jobHolder: taskCopy.jobHolder,
        task: taskCopy.task,
        hours: taskCopy.hours,
        startDate: taskCopy.startDate,
        deadline: taskCopy.deadline,
        lead: taskCopy.lead,
        label: taskCopy.label,
      }
    );
    if (data) {
      console.log("Copied Task:", data.task);

      setTasksData((prevData) => [...prevData, data.task]);
    }
  };

  // ---------Stop Timer ----------->
  const handleStopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  // -----------Download in CSV------>
  const flattenData = (data) => {
    return data.map((row) => ({
      projectName: row.project.projectName,
      projectId: row.project._id,
      jobHolder: row.jobHolder,
      task: row.task,
      hours: row.hours,
      startDate: row.startDate,
      deadline: row.deadline || "",
      status: row.status || "",
      lead: row.lead || "",
      estimate_Time: row.estimate_Time || "",
    }));
  };

  const handleExportData = () => {
    const csvData = flattenData(tasksData);
    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
  };
  // ---------Handle Delete Task-------------
  const handleDeleteTask = async (id) => {
    const filterData = tasksData.filter((item) => item._id !== id);
    setTasksData(filterData);
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/delete/task/${id}`
      );
      if (data) {
        setShowDetail(false);
        toast.success("Task deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // ----------------------Table Data--------->

  console.log("TAKS DATA:", tasksData);
 
   // ----------------------------
   // 🔑 Authentication & User Data
   // ----------------------------
   const authCtx = useMemo(
     () => ({
       auth,
       users,
       departments,
     }),
     [auth, users, departments]
   );
 
   // ----------------------------
   // 📂 Projects
   // ----------------------------
   const projectCtx = useMemo(
     () => ({
       allProjects,
       updateTaskProject,
       updateTaskJLS,
       updateAlocateTask,
     }),
     [allProjects]
   );
 
   // ----------------------------
   // 📊 Tasks / Filtering
   // ----------------------------
   const taskCtx = useMemo(
     () => ({
       totalHours,
       filterId,
       active,
       active1,
       setFilterData,
       setTasksData,
       setTaskID,
       setProjectName,
       setShowDetail,
       copyTask,
        
        
     }),
     [totalHours, filterId, active, active1]
   );
 
   // ----------------------------
   // 💬 Comments
   // ----------------------------
   const commentCtx = useMemo(
     () => ({
        
       setCommentTaskId,
       setIsComment,
     }),
     []
   );
 
 
 
   // ----------------------------
   // 🏷️ Labels
   // ----------------------------
   const labelCtx = useMemo(
     () => ({
       labelData,
       addlabelTask,
     }),
     [labelData]
   );
 
   // ----------------------------
   // 📦 Merge into one ctx if needed
   // ----------------------------
   const ctx = useMemo(
     () => ({
       ...authCtx,
       ...projectCtx,
       ...taskCtx,
       ...commentCtx,
       
       ...labelCtx,
     }),
     [authCtx, projectCtx, taskCtx, commentCtx,  labelCtx]
   );
 
   // ----------------------------
   // 📑 Columns
   // ----------------------------
   const columns = useMemo(() => getCompletedTaskColumns(ctx), [ctx]);
 

  const table = useMaterialReactTable({
    columns,
    // data: active === "All" && !active1 && !filterId ? tasksData : filterData,
    data:
      (active === "All" && !active1 && !filterId ? tasksData : filterData) ||
      [],
    enableStickyHeader: true,
    enableStickyFooter: true,
    // columnFilterDisplayMode: "popover",
    muiTableContainerProps: { sx: { maxHeight: "850px" } },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    // enableEditing: true,
    // state: { isLoading: loading },

    enablePagination: true,
    initialState: {
      pagination: { pageSize: 20 },
      pageSize: 20,
      density: "compact",
    },

    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        backgroundColor: "#E5E7EB",
        color: "#000",
        padding: ".7rem 0.3rem",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        border: "1px solid rgba(203, 201, 201, 0.5)",
      },
    },
    muiTableProps: {
      sx: {
        "& .MuiTableHead-root": {
          backgroundColor: "#f0f0f0",
        },
        tableLayout: "auto",
        fontSize: "13px",
        border: "1px solid rgba(81, 81, 81, .5)",
        caption: {
          captionSide: "top",
        },
      },
    },
  });



  
  // Hook returns an updater for each column
  const updateDepartment = useColumnFilterSync(
    table,
    "departmentName",
    filter1,
    setFilter1
  );
  const updateProject = useColumnFilterSync(
    table,
    "projectName",
    filter2,
    setFilter2
  );
  const updateJobHolder = useColumnFilterSync(
    table,
    "jobHolder",
    filter3,
    setFilter3
  );

  // helper to check if "all departments" are selected
  const allDepartmentsSelected =
    filter1 === "" ||
    filter1 === "All" ||
    (Array.isArray(filter1) && filter1.length === departments.length);


  return (
    <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
      <button
        className=" absolute top-1  p-[2px] rounded-full left-2 bg-gray-300/30 hover:bg-gray-300/50"
        onClick={() => {
          setActive2("All");
          setShowCompleted(false);
        }}
      >
        <MdOutlineKeyboardBackspace className="h-6 w-6 cursor-pointer text-orange-500" />
      </button>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <h1 className=" text-xl sm:text-2xl font-semibold ">
            Completed Tasks
          </h1>
        </div>

        {/* Project Buttons */}
        <div className="flex items-center gap-4">
          {auth?.user?.role === "Admin" && (
            <div
              className=" relative w-[8rem]  border-2 border-gray-200 rounded-md py-1 px-2 flex items-center justify-between gap-1"
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
              {/* -----------Projects------- */}
              {showProject && (
                <div className="absolute top-9 right-[-3.5rem] flex flex-col gap-2 max-h-[16rem] overflow-y-auto hidden1 z-[99] border rounded-sm shadow-sm bg-gray-50 py-2 px-2 w-[14rem]">
                  {projects?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {projects?.map((project) => (
                        <div
                          key={project._id}
                          className="w-full flex items-center justify-between gap-1 rounded-md bg-white border py-1 px-1 hover:bg-gray-100"
                        >
                          <p className="text-[13px] w-[8rem] ">
                            {project?.projectName}
                          </p>
                          <div className="flex items-center gap-1">
                            <span
                              title="Uncomplete this Project"
                              onClick={() => handleUpdateStatus(project._id)}
                            >
                              <MdBackspace className="h-5 w-5 cursor-pointer text-pink-500 hover:text-pink-600 transition-all duration-200" />
                            </span>
                            <span
                              onClick={() => {
                                setProjectId(project._id);
                                setOpenAddProject(true);
                              }}
                              title="Edit Project"
                            >
                              <MdOutlineEdit className="h-5 w-5 cursor-pointer hover:text-sky-500 transition-all duration-200" />
                            </span>
                            <span
                              title="Delete Project"
                              onClick={() =>
                                handleDeleteConfirmation(project._id)
                              }
                            >
                              <AiTwotoneDelete className="h-5 w-5 cursor-pointer hover:text-red-500 transition-all duration-200" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-[8rem]   flex items-center flex-col gap-1 justify-center text-center">
                      <span className="text-[2rem] text-center">🤯</span>
                      <span className=" text-center text-[15px] text-gray-500">
                        Completed Projects not available!
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
      {/*  */}
      <div className="flex flex-col gap-2">
        {/* -----------Filters By Projects--------- */}
        <div className="flex items-center flex-wrap gap-2 mt-3">
           <div
                className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                  allDepartmentsSelected &&
                  " border-2 border-b-0 text-orange-600 border-gray-300"
                }`}
                onClick={() => {
                  // setShowCompleted(false);

                  // clear all filters when clicking "All"
                  updateDepartment("");
                  updateProject("");
                  updateJobHolder("");

                  setFilter1("All");
                }}
              >
                All
              </div>

              <DraggableFilterTabs
                droppableId={"departments"}
                items={departments}
                filterValue={filter1}
                tasks={tasksData}
                getCountFn={(department, tasks) =>
                  tasks.filter((t) =>
                    t.project?.departments?.some(
                      (d) => d._id === department?._id
                    )
                  ).length
                }
                getLabelFn={(department) => department?.departmentName}
                 

                onClick={(dep) => {
                  const newValue =
                    filter1 === dep.departmentName ? "" : dep.departmentName;
                  updateDepartment(newValue);
                  updateProject(""); // reset project filter when department changes
                  updateJobHolder(""); // reset jobHolder filter when department changes
                }}
                onDragEnd={() => {}}
                activeClassName={
                  filter1
                    ? "border-2 border-b-0 text-orange-600 border-gray-300"
                    : ""
                }
              />

          {/*  */}
          {/* -------------Filter Open Buttons-------- */}
          <span
            className={` p-1 rounded-md hover:shadow-md bg-gray-50 mb-1  cursor-pointer border  ${
              activeBtn === "jobHolder" && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setActiveBtn("jobHolder");
              setShowJobHolder(!showJobHolder);
            }}
            title="Filter by Job Holder"
          >
            <IoBriefcaseOutline className="h-6 w-6  cursor-pointer " />
          </span>
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
              activeBtn === "due" && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setActiveBtn("due");
              setShowDue(!showDue);
            }}
            title="Filter by Status"
          >
            <TbCalendarDue className="h-6 w-6  cursor-pointer" />
          </span>
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
            <MdAutoGraph className="h-6 w-6  cursor-pointer" />
          </span>
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
            onClick={() => {
              setActive("All");
              setActiveBtn("");
              setShowStatus(false);
              setShowJobHolder(false);
              setShowDue(false);
              setActive1("");
               dispatch(setFilterId(""));
            }}
            title="Clear filters"
          >
            <IoClose className="h-6 w-6  cursor-pointer" />
          </span>
        </div>
        {/*  */}
        <hr className="mb-1 bg-gray-300 w-full h-[1px]" />

        {/* ----------Job_Holder Summery Filters---------- */}
        {showJobHolder && activeBtn === "jobHolder" && (
          <>
            <div className="w-full  py-2 ">
              <h3 className="text-[19px] font-semibold text-black">
                Job Holder Summary
              </h3>
              <div className="flex items-center flex-wrap gap-4">
                <DraggableFilterTabs
                                      droppableId={"users"}
                                      // items={filter2 ? projectUsers.filter(user => getJobHolderCount(user?.name, active) > 0) : users.filter(user => getJobHolderCount(user?.name, active) > 0)}
                                      items={users.filter(
                                        (user) => getJobHolderCount(user?.name, active) > 0
                                      )}
                                      filterValue={filter3}
                                      tasks={tasksData}
                                      getCountFn={(user, tasks) =>
                                        tasks.filter((t) => t.jobHolder === user.name).length
                                      }
                                      getLabelFn={(user) => user.name}
                                      onClick={(user) => {
                                        const newValue =
                                          filter3 === user?.name ? "" : user?.name;
                
                                        updateJobHolder(newValue); // reset jobHolder filter when department changes
                
                                        // setColumnFromOutsideTable("status", "Progress");
                
                                        // setColumnFromOutsideTable("taskDate", "");
                                        // if (
                                        //   auth.user?.role?.name === "Admin" &&
                                        //   user?.name === auth?.user?.name
                                        // ) {
                                        //   setColumnFromOutsideTable("taskDate", "Today");
                                        // }
                                      }}
                                      activeClassName={
                                        filter3
                                          ? "border-b-2 text-orange-600 border-orange-600"
                                          : ""
                                      }
                                    />
              </div>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
          </>
        )}

        {/* ----------Date Status Summery Filters---------- */}
        {showDue && activeBtn === "due" && (
          <>
            <div className="w-full py-2">
              <h3 className="text-[19px] font-semibold text-black">
                Date Status Summary
              </h3>
              <div className="flex items-center flex-wrap gap-4">
                {dateStatus?.map((stat, i) => {
                  const { due, overdue } =
                    getDueAndOverdueCountByDepartment(active);
                  return (
                    <div
                      className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                        active1 === stat &&
                        " border-b-2 text-orange-600 border-orange-600"
                      }`}
                      key={i}
                      onClick={() => {
                        setActive1(stat);
                        filterByProjStat(stat, active);
                      }}
                    >
                      {stat === "Due" ? (
                        <span>Due {due}</span>
                      ) : (
                        <span>Overdue {overdue}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
          </>
        )}

        {/* ----------Status Summery Filters---------- */}
        {showStatus && activeBtn === "status" && (
          <>
            <div className="w-full  py-2 ">
              <h3 className="text-[19px] font-semibold text-black">
                Status Summary
              </h3>
              <div className="flex items-center flex-wrap gap-4">
                {status?.map((stat, i) => (
                  <div
                    className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                      active1 === stat &&
                      "  border-b-2 text-orange-600 border-orange-600"
                    }`}
                    key={i}
                    onClick={() => {
                      setActive1(stat);
                      filterByProjStat(stat, active);
                    }}
                  >
                    {stat} ({getStatusCount(stat, active)})
                  </div>
                ))}
              </div>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
          </>
        )}
        {/*  */}
        {/* <hr className="mb-1 bg-gray-300 w-full h-[1px]" /> */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-screen px-4 py-4">
            <Loader />
          </div>
        ) : (
          <div className="w-full min-h-[70vh] relative">
            <div className="h-full hidden1 overflow-y-scroll relative">
              <MaterialReactTable table={table} />
            </div>
            {/* <span className="absolute bottom-4 left-[32%] z-10 font-semibold text-[15px] text-gray-900">
                  Total Hrs: {0}
                </span> */}
          </div>
        )}
      </div>

      {/* ----------------Add Project-------- */}
      {openAddProject && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
          <AddProjectModal
            users={users}
            setOpenAddProject={setOpenAddProject}
            getAllProjects={getAllProjects}
            projectId={projectId}
            setProjectId={setProjectId}
          />
        </div>
      )}

      {/* -----------Add Task-------------- */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
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
        <div className="fixed bottom-4 right-4 w-[30rem] max-h-screen z-[999]  flex items-center justify-center">
          <JobCommentModal
            setIsComment={setIsComment}
            jobId={commentTaskId}
            setJobId={setCommentTaskId}
            users={userName}
            type={"Task"}
          />
        </div>
      )}

      {/* -------------Stop Timer Btn-----------*/}
      {isShow && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
          <div className="w-[32rem] rounded-md bg-white shadow-md">
            <div className="flex  flex-col gap-3 ">
              <div className=" w-full flex items-center justify-between py-2 mt-1 px-4">
                <h3 className="text-[19px] font-semibold text-gray-800">
                  Enter your note here
                </h3>
                <span
                  onClick={() => {
                    setIsShow(false);
                  }}
                >
                  <IoClose className="text-black cursor-pointer h-6 w-6 " />
                </span>
              </div>
              <hr className="w-full h-[1px] bg-gray-500 " />
              <div className=" w-full px-4 py-2 flex-col gap-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note here..."
                  className="w-full h-[6rem] rounded-md resize-none py-1 px-2 shadow border-2 border-gray-700"
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

      {/*---------------Task Details---------------*/}

      {showDetail && (
        <div className="fixed right-0 top-[3.8rem] z-[999] bg-gray-100 w-[35%] h-[calc(100vh-3.8rem)] py-3 px-3 ">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{projectName}</h3>
            <span
              className="p-1 rounded-md bg-gray-50 border  hover:shadow-md hover:bg-gray-100"
              onClick={() => setShowDetail(false)}
            >
              <IoClose className="h-5 w-5 cursor-pointer" />
            </span>
          </div>
          <TaskDetail
            taskId={taskID}
            getAllTasks={getAllTasks}
            handleDeleteTask={handleDeleteTask}
            setTasksData={setTasksData}
            setShowDetail={setShowDetail}
            users={users}
            projects={projects}
          />
        </div>
      )}

      {/* ---- */}
    </div>
  );
};

export default CompletedTasks;
