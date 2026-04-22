import axios from "axios";
import toast from "react-hot-toast";
import { useMemo } from "react";

export const useTaskActions = ({
  refetchTasks,
  refetchStats,
}) => {

  // -----------------------------
  // Update Project
  // -----------------------------
  const updateTaskProject = async (
    taskId,
    projectId
  ) => {
    try {

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/project/${taskId}`,
        { projectId }
      );

      toast.success("Project updated");

      refetchTasks();
      refetchStats();

    } catch (err) {
      toast.error("Update failed");
    }
  };


  // -----------------------------
  // Update JobHolder / Lead / Status
  // -----------------------------
  const updateTaskJLS = async (
    taskId,
    jobHolder,
    lead,
    status
  ) => {

    try {

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${taskId}`,
        {
          jobHolder,
          lead,
          status,
        }
      );

      toast.success("Task updated");

      refetchTasks();
      refetchStats();

    } catch (err) {

      toast.error("Update failed");

    }
  };


  // -----------------------------
  // 🆕 Update Allocate Task
  // -----------------------------
  const updateAlocateTask = async (
    taskId,
    allocateTask,
    startDate,
    deadline,
    taskDate,
  ) => {

    if (!taskId) {
      toast.error("Task id required");
      return;
    }

    try {

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/allocate/task/${taskId}`,
        {
          allocateTask,
          startDate,
          deadline,
          taskDate,
        }
      );

      toast.success("Task updated");

      refetchTasks();
      refetchStats();

    } catch (error) {

      toast.error(
        error?.response?.data?.message ||
        "Update failed"
      );

    }
  };


  // -----------------------------
  // 🆕 Copy Task
  // -----------------------------
  const copyTask = async (
    originalTask
  ) => {

    try {

      const payload = {

        projectId:
          originalTask?.project?._id,

        jobHolder:
          originalTask?.jobHolder,

        task: "Enter Task Here",

        hours:
          originalTask?.hours,

        startDate:
          originalTask?.startDate,

        deadline:
          originalTask?.deadline,

        lead:
          originalTask?.lead,

        label:
          originalTask?.label,

        status:
          originalTask?.status,
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/create/task`,
        payload
      );

      toast.success(
        "Task copied successfully"
      );

      refetchTasks();
      refetchStats();

    } catch (error) {

      toast.error(
        error?.response?.data?.message ||
        "Copy failed"
      );

    }
  };


  // -----------------------------
  // Delete Task
  // -----------------------------
  const deleteTask = async (id) => {

    try {

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/delete/task/${id}`
      );

      toast.success("Deleted");

      refetchTasks();
      refetchStats();

    } catch (err) {

      toast.error("Delete failed");

    }
  };




    // -----------------------------
  // Delete Task
  // -----------------------------
   const addlabelTask = async (id, name, color) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/add/label/${id}`,
        { name, color },
      );
      if (data) {
         refetchTasks();
        refetchStats()

        if (name) {
          toast.success("label added!");
        } else {
          toast.success("label Updated!");
        }

        
      }
    } catch (error) {
      console.log(error);
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
          refetchTasks();
          refetchStats()
          
          toast.success("Status completed successfully!");
  
           
  
         
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };




  // -----------------------------
  // Return Memoized Actions
  // -----------------------------
  return useMemo(() => ({
    
    updateTaskProject,
    updateTaskJLS,
    updateAlocateTask,
    copyTask,
    deleteTask,
    addlabelTask,
    handleStatusComplete



  }), [
    refetchTasks,
    refetchStats,
  ]);
};