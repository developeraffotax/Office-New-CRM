import axios from "axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { generateCsv, download } from "export-to-csv";
import csvConfig from "../Constants/csvConfig";

const useTaskMutations = ({
  tasksData,
  setTasksData,
  filterData,
  setFilterData,
  active,
  active1,
  filterId,
  setUI,
  getTasks1,
}) => {
  const updateTaskProject = async (taskId, projectId) => {
    if (!taskId || !projectId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/project/${taskId}`,
        { projectId },
      );
      if (data?.success) {
        const updateTask = data?.task;
        toast.success("Project updated!");
        setTasksData((prev) =>
          prev?.map((item) =>
            item._id === updateTask._id ? updateTask : item,
          ),
        );
        if (active !== "All") {
          setFilterData((prev) =>
            prev?.map((item) =>
              item._id === updateTask._id ? updateTask : item,
            ),
          );
        }
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const updateTaskJLS = async (taskId, jobHolder, lead, status) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${taskId}`,
        { jobHolder, lead, status },
      );
      if (data) {
        const updateTask = data?.task;
        toast.success("Task updated successfully!");
        if (filterId || active || active1) {
          setFilterData((prev) =>
            Array.isArray(prev)
              ? prev?.map((item) =>
                  item?._id === updateTask?._id ? updateTask : item,
                )
              : [updateTask],
          );
        }
        setTasksData((prev) =>
          Array.isArray(prev)
            ? prev?.map((item) =>
                item?._id === updateTask?._id ? updateTask : item,
              )
            : [updateTask],
        );
        getTasks1();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const updateAlocateTask = async (
    taskId,
    allocateTask,
    startDate,
    deadline,
    taskDate,
  ) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/allocate/task/${taskId}`,
        { allocateTask, startDate, deadline, taskDate },
      );
      if (data?.success) {
        const updateTask = data?.task;
        toast.success("Task updated successfully!");
        setTasksData((prev) =>
          prev?.map((item) =>
            item._id === updateTask._id ? updateTask : item,
          ),
        );
        if (Array.isArray(filterData)) {
          setFilterData((prev) =>
            Array.isArray(prev)
              ? prev.map((item) =>
                  item?._id === updateTask?._id ? updateTask : item,
                )
              : [updateTask],
          );
        }
      }
      getTasks1();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const copyTask = async (originalTask) => {
    const taskCopy = { ...originalTask, task: "Enter Task Here" };
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/tasks/create/task`,
      {
        projectId: taskCopy?.project._id,
        jobHolder: taskCopy?.jobHolder,
        task: taskCopy?.task,
        hours: taskCopy?.hours,
        startDate: taskCopy?.startDate,
        deadline: taskCopy?.deadline,
        lead: taskCopy?.lead,
        label: taskCopy?.label,
        status: taskCopy?.status,
      },
    );
    if (data) {
      toast.success("Task copied successfully!");
      setTasksData((prev) => [...prev, data?.task]);
    }
  };

  const flattenData = (data) =>
    data?.map((row) => ({
      projectName: row.project.projectName,
      jobHolder: row.jobHolder,
      task: row.task,
      hours: row.hours,
      startDate: format(new Date(row.startDate), "dd-MMM-yyyy"),
      deadline: format(new Date(row.deadline), "dd-MMM-yyyy") || "",
      status: row.status || "",
      lead: row.lead || "",
    }));

  const handleExportData = () => {
    const csvData = flattenData(filterData ? filterData : tasksData);
    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
  };

  const handleDeleteTask = async (id) => {
    setTasksData(tasksData?.filter((item) => item._id !== id));
    if (active !== "All" && filterData) {
      setFilterData(filterData?.filter((item) => item._id !== id));
    }
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/delete/task/${id}`,
      );
      if (data) {
        setUI((prev) => ({ ...prev, showDetail: false }));
        toast.success("Task deleted successfully!");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleDeleteTaskConfirmation = (taskId) => {
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
        handleDeleteTask(taskId);
        Swal.fire("Deleted!", "Your task has been deleted.", "success");
      }
    });
  };

  const addlabelTask = async (id, name, color) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/add/label/${id}`,
        { name, color },
      );
      if (data) {
        if (filterId || active !== "All" || filterData || active1) {
          setFilterData((prev = []) =>
            prev?.map((item) =>
              item._id === id ? { ...item, label: { name, color } } : item,
            ),
          );
        }
        setTasksData((prev = []) =>
          prev?.map((item) =>
            item._id === id ? { ...item, label: { name, color } } : item,
          ),
        );
        toast.success(name ? "label added!" : "label Updated!");
        getTasks1();
      }
    } catch (error) {
      toast.error("Error while add label");
    }
  };

  const handleStatusComplete = async (taskId) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${taskId}`,
        { status: "completed" },
      );
      if (data?.success) {
        const updateTask = data?.task;
        setUI((prev) => ({ ...prev, showDetail: false }));
        toast.success("Status completed successfully!");
        setTasksData((prev = []) =>
          prev.filter((item) => item._id !== updateTask._id),
        );
        if (filterData) {
          setFilterData((prev = []) =>
            prev.filter((item) => item._id !== updateTask._id),
          );
        }
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleCompleteStatus = (taskId) => {
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
        handleStatusComplete(taskId);
        Swal.fire("Updated!", "Your task completed successfully!.", "success");
      }
    });
  };

  return {
    updateTaskProject,
    updateTaskJLS,
    updateAlocateTask,
    copyTask,
    handleExportData,
    handleDeleteTask,
    handleDeleteTaskConfirmation,
    addlabelTask,
    handleStatusComplete,
    handleCompleteStatus,
  };
};

export default useTaskMutations;
