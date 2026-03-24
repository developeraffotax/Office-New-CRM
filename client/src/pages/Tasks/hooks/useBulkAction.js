import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const useBulkAction = ({
  rowSelection,
  setRowSelection,
  getAllTasks,
  setShowEdit,
}) => {
  const [fLoading, setFLoading] = useState(false);
  const [project, setProject] = useState("");
  const [jobHolder, setJobHolder] = useState("");
  const [lead, setLead] = useState("");
  const [hours, setHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [tstatus, setTStatus] = useState("");
  const [isUpload, setIsUpdate] = useState(false);

  const importJobData = async (file) => {
    setFLoading(true);
    if (!file) {
      toast.error("File is required!");
      setFLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/import`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (data) {
        getAllTasks();
        toast.success("Tasks Data imported successfully!");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to import job data",
      );
    } finally {
      setFLoading(false);
    }
  };

  const updateBulkJob = async (e) => {
    e.preventDefault();
    setIsUpdate(true);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/multiple`,
        {
          rowSelection: Object.keys(rowSelection).filter(
            (id) => rowSelection[id] === true,
          ),
          projectId: project,
          jobHolder,
          lead,
          hours,
          startDate,
          deadline,
          taskDate,
          status: tstatus,
        },
      );
      if (data) {
        getAllTasks();
        toast.success("Bulk Action updated successfully!");
        setRowSelection({});
        setProject("");
        setJobHolder("");
        setLead("");
        setHours("");
        setStartDate("");
        setDeadline("");
        setTaskDate("");
        setTStatus("");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsUpdate(false);
      setShowEdit(false);
      setRowSelection({});
    }
  };

  return {
    fLoading,
    project,
    setProject,
    jobHolder,
    setJobHolder,
    lead,
    setLead,
    hours,
    setHours,
    startDate,
    setStartDate,
    deadline,
    setDeadline,
    taskDate,
    setTaskDate,
    tstatus,
    setTStatus,
    isUpload,
    importJobData,
    updateBulkJob,
  };
};

export default useBulkAction;
