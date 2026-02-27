import { useRef, useState } from "react";

const useTaskModals = () => {
  const timerRef = useRef();

  // Add Task modal
  const [isOpen, setIsOpen] = useState(false);
  const [taskId, setTaskId] = useState("");

  // Department modal
  const [openAddDepartment, setOpenAddDepartment] = useState(false);
  const [departmentId, setDepartmentId] = useState("");

  // Project modal
  const [openAddProject, setOpenAddProject] = useState(false);
  const [projectId, setProjectId] = useState("");

  // Comment modal
  const [isComment, setIsComment] = useState(false);
  const [commentTaskId, setCommentTaskId] = useState("");

  // Stop Timer modal
  const [isShow, setIsShow] = useState(false);
  const [note, setNote] = useState("");
  const [activity, setActivity] = useState("Chargeable");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskIdForNote, setTaskIdForNote] = useState("");

  // Task Detail modal
  const [taskID, setTaskID] = useState("");
  const [projectName, setProjectName] = useState("");

  const handleStopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  return {
    timerRef,
    // Add Task
    isOpen, setIsOpen,
    taskId, setTaskId,
    // Department
    openAddDepartment, setOpenAddDepartment,
    departmentId, setDepartmentId,
    // Project
    openAddProject, setOpenAddProject,
    projectId, setProjectId,
    // Comment
    isComment, setIsComment,
    commentTaskId, setCommentTaskId,
    // Stop Timer
    isShow, setIsShow,
    note, setNote,
    activity, setActivity,
    isSubmitting, setIsSubmitting,
    taskIdForNote, setTaskIdForNote,
    handleStopTimer,
    // Task Detail
    taskID, setTaskID,
    projectName, setProjectName,
  };
};

export default useTaskModals;
