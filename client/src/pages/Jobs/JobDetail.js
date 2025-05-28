import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { GoGoal } from "react-icons/go";
import { MdDateRange } from "react-icons/md";
import { RiLoaderFill, RiTimerLine } from "react-icons/ri";
import { format } from "date-fns";
import Loader from "../../utlis/Loader";
import { Timer } from "../../utlis/Timer";
import { useAuth } from "../../context/authContext";
import { FaRegUser } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { CgClose } from "react-icons/cg";
import EditJobModal from "../../components/Modals/EditJobModal";
import { AiFillDelete } from "react-icons/ai";
import { IoClose, IoCloseCircleOutline } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import Swal from "sweetalert2";
import { MdCheckCircle } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import JobCommentModal from "./JobCommentModal";
import { FaRegCopy } from "react-icons/fa";
import CopyJobModel from "../../components/Modals/CopyJobModel";
import Reminder from "../../utlis/Reminder";
import { BiBellPlus, BiSolidBellPlus } from "react-icons/bi";
import { RiLoader2Fill } from "react-icons/ri";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { RiListView } from "react-icons/ri";
import { MdOutlineAddBox } from "react-icons/md";

export default function JobDetail({
  clientId,
  handleStatus,
  allClientJobData,
  handleDeleteJob,
  users,
  allClientData,
}) {
  const [clientDetail, setClientDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("subtasks");
  const { auth, anyTimerRunning } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [jobId, setJobId] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [note, setNote] = useState("");
  const timerRef = useRef();
  const [subTask, setSubtask] = useState("");
  const [subTaskLoading, setSubTaskLoading] = useState(false);
  const [subTaskData, setSubTaskData] = useState([]);
  const [timerId, setTimerId] = useState("");
  const [openCopy, setOpenCopy] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [workPlan, setWorkPlan] = useState("");
  const [load, setLoad] = useState(false);
  const [quality, setQuality] = useState("");
  const [loadingQuality, setLoadingQuality] = useState(false);
  const [qualityData, setQualityData] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [showQuality, setShowQuality] = useState(false);

  // console.log(clientDetail.workPlan);

  // ---------Stop Timer ----------->
  const handleStopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  useEffect(() => {
    if (clientDetail) {
      setWorkPlan(clientDetail.workPlan);
    }
  }, [clientDetail, showEdit]);

  //    Single Client

  const getClient = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/single/client/${clientId}`
      );
      if (data) {
        setLoading(false);
        setClientDetail(data.clientJob);
        setSubTaskData(
          data?.clientJob?.subtasks?.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        // setQualityData(data?.clientJob?.quality_Check);
        const sortedData = [...data.clientJob.quality_Check].sort(
          (a, b) => a.order - b.order
        );
        setQualityData(sortedData);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  useEffect(() => {
    getClient();
    // eslint-disable-next-line
  }, [clientId]);

  // Get Running Timer JobId
  useEffect(() => {
    const timeId = localStorage.getItem("jobId");
    setTimerId(JSON.parse(timeId));
  }, []);

  // ---------------Handle Status Change---------->
  const handleStatusChange = async (rowId, newStatus) => {
    if (!rowId) {
      return toast.error("Job id is required!");
    }
    try {
      const { data } = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/status/${rowId}`,
        {
          status: newStatus,
        }
      );
      if (data) {
        getClient();
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  // ------------Delete Conformation-------->
  const handleDeleteConfirmation = (jobId) => {
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
        handleDeleteJob(jobId);
        Swal.fire("Deleted!", "Your job has been deleted.", "success");
      }
    });
  };

  // Update Job Status
  const handleUpdateStatus = () => {
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
        updateJobStatus();
        Swal.fire("Updated!", "Your job completed successfully!.", "success");
      }
    });
  };

  const updateJobStatus = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/client/dublicate/job/complete`,
        { ...clientDetail }
      );
      if (data) {
        allClientJobData();
        toast.success("Status updated!");
      }
    } catch (error) {
      console.error("Error updating complete status", error);
      toast.error(error.response.data.message);
    }
  };

  // ----------Crate Subtask---------->
  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    setSubTaskLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/client/create/subTask/${clientId}`,
        { subTask }
      );
      if (data) {
        setClientDetail(data?.job);
        setSubTaskData(
          data?.job?.subtasks?.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        setSubtask("");
        toast.success("Subtask added successfully!");
        setSubTaskLoading(false);
      }
    } catch (error) {
      console.log(error);
      setSubTaskLoading(false);
      toast.error(error.response.data.message);
    }
  };

  //  Handle drag end
  const handleOnDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) return;

    const newTodos = Array.from(subTaskData);
    const [movedTodo] = newTodos.splice(source.index, 1);
    newTodos.splice(destination.index, 0, movedTodo);

    setSubTaskData(newTodos);
  };

  // Update Subtask Status
  const updateSubtaskStatus = async (subTaskId) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/subtask/status/${clientId}`,
        { subTaskId }
      );
      if (data) {
        setClientDetail(data?.job);
        setSubTaskData(
          data?.job?.subtasks?.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  // Delete Subtask
  const handleDeleteSubTask = async (subTaskId) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/client/delete/subtask/${clientId}/${subTaskId}`
      );
      if (data.success) {
        setClientDetail(data?.job);
        setSubTaskData(
          data?.job?.subtasks?.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // Update WorkPlan
  const handleWorkPlan = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/workplain/${clientId}`,
        { workPlan }
      );
      if (data) {
        setClientDetail(data.clientJob);
        toast.success("Work Plan Updated");
        setShowEdit(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  };

  // Get All Quality Check
  const getQuickList = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/quicklist/get/all`
      );
      console.log("Qdata", data.qualityChecks);
      if (data) {
        const list = data.qualityChecks.filter((item) =>
          Array.isArray(clientDetail?.job.jobName)
            ? clientDetail?.job.jobName.includes(item.type)
            : item.type === clientDetail?.job.jobName
        );
        console.log("Qdata", list);
        setQualities(list);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getQuickList();

    // eslint-disable-next-line
  }, [clientDetail]);

  // ----------Create Quality Check---------->
  const handleCreateQuality = async (e) => {
    e.preventDefault();
    setLoadingQuality(false);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/client/create/quality/${clientId}`,
        { quality }
      );
      if (data) {
        const sortedData = [...data?.job?.quality_Check].sort(
          (a, b) => a.order - b.order
        );
        setQualityData(sortedData);
        setQuality("");
        toast.success("Quality check added successfully!");
        setLoadingQuality(false);
      }
    } catch (error) {
      console.log(error);
      setLoadingQuality(false);
      toast.error(error.response.data.message);
    }
  };

  // Handle Create Quality Check
  const handleCreateQualityByClick = async (quality) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/client/create/quality/${clientId}`,
        { quality }
      );

      if (response?.data) {
        const sortedData = response.data.job.quality_Check.sort(
          (a, b) => a.order - b.order
        );

        setQualityData(sortedData);
        setQuality("");
        toast.success("Quality check added successfully!");
      }
    } catch (error) {
      console.error("Error creating quality check:", error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred"
      );
    }
  };

  // Update Quality Check
  const updateQualityCheckStatus = async (qualityId) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/quality/status/${clientId}`,
        { qualityId }
      );
      if (data) {
        const sortedData = [...data?.job?.quality_Check].sort(
          (a, b) => a.order - b.order
        );
        setQualityData(sortedData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // Delete Quality Check
  const handleDeleteQuality = async (qualityId) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/client/delete/quality/${clientId}/${qualityId}`
      );
      if (data.success) {
        const sortedData = [...data?.job?.quality_Check].sort(
          (a, b) => a.order - b.order
        );
        setQualityData(sortedData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  //  Handle drag end
  const handleOnDragEndQualityCheck = (result) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) return;

    const newTodos = Array.from(qualityData);
    const [movedTodo] = newTodos.splice(source.index, 1);
    newTodos.splice(destination.index, 0, movedTodo);

    setQualityData(newTodos);

    handleReorderingQualityCheck(newTodos);
  };

  // Handle Reordering
  const handleReorderingQualityCheck = async (newTodos) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/client/reordering/${clientId}`,
        { qualities: newTodos }
      );
      if (data) {
        toast.success("Reordering successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full relative  mt-2 overflow-y-scroll h-[calc(100vh-3rem)] pb-4 hidden1  ">
          <div className="absolute top-[.5rem] right-[1rem] flex items-center gap-4">
            <span
              className=""
              title="Edit Job"
              onClick={() => {
                setJobId(clientDetail._id);
                setIsOpen(true);
              }}
            >
              <FaEdit className="h-5 w-5 cursor-pointer text-gray-800 hover:text-gray-950" />
            </span>
            <span
              className="  hidden  sm:block"
              title="Copy Job"
              onClick={() => {
                setJobId(clientDetail._id);
                setOpenCopy(true);
              }}
            >
              <FaRegCopy className="h-5 w-5 cursor-pointer text-sky-500 hover:text-sky-600" />
            </span>
            <span
              className=""
              title="Complete Job"
              onClick={() => {
                handleUpdateStatus();
              }}
            >
              <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
            </span>
            <button
              disabled={anyTimerRunning && timerId === clientDetail?._id}
              className={` hidden  sm:block ${
                anyTimerRunning && timerId === clientDetail?._id
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              type="button"
              title="Delete Job"
              onClick={() => handleDeleteConfirmation(clientDetail?._id)}
            >
              <AiFillDelete
                className={`h-5 w-5 text-red-500 hover:text-red-600 ${
                  anyTimerRunning && timerId === clientDetail?._id
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              />
            </button>
          </div>
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
                <GoGoal className="h-4 w-4 text-gray-500" /> Status
              </span>
              <select
                value={clientDetail?.job?.jobStatus}
                onChange={(e) => {
                  handleStatusChange(clientDetail._id, e.target.value);
                  handleStatus(clientDetail._id, e.target.value);
                }}
                className="w-[8rem] h-[2rem] rounded-md border border-sky-500 outline-none"
              >
                <option value="empty"></option>
                <option value="Data">Data</option>
                <option value="Progress">Progress</option>
                <option value="Queries">Queries</option>
                <option value="Approval">Approval</option>
                <option value="Submission">Submission</option>
                <option value="Billing">Billing</option>
                <option value="Feedback">Feedback</option>
              </select>
            </div>
            {/*  */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
                <FaRegUser className="h-4 w-4 text-gray-500" /> Job Holder
              </span>
              <span className="text-[17px] font-medium text-gray-800">
                {clientDetail?.job?.jobHolder}
              </span>
            </div>
            {/*  */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
                <MdDateRange className="h-4 w-4 text-gray-500" /> Due Date
              </span>
              <span className="text-[17px] font-medium text-gray-800">
                {format(
                  new Date(
                    clientDetail?.job?.jobDeadline ||
                      "2024-07-26T00:00:00.000+00:00"
                  ),
                  "dd-MMM-yyyy"
                )}
              </span>
            </div>
            {/* Timer  */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
                <RiTimerLine className="h-4 w-4 text-gray-500" /> Start Timer
              </span>
              <span className="text-[17px] font-medium text-gray-800">
                <Timer
                  ref={timerRef}
                  clientId={auth?.user?.id}
                  jobId={clientDetail?._id}
                  setIsShow={setIsShow}
                  note={note}
                  setNote={setNote}
                  taskLink={"/job-planning"}
                  pageName={"Jobs"}
                  taskName={clientDetail?.job?.jobName || " "}
                  department={clientDetail?.job?.jobName || " "}
                  clientName={clientDetail?.clientName || " "}
                  JobHolderName={clientDetail?.job?.jobHolder || " "}
                  projectName={""}
                  task={""}
                  companyName={clientDetail?.companyName}
                />
              </span>
            </div>
            {/* Reminder */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
                <BiBellPlus className="h-4 w-4 text-gray-500" />
                Reminder
              </span>
              <span
                onClick={() => setShowReminder(true)}
                className=" text-pink-500 hover:text-pink-600"
              >
                <BiSolidBellPlus className="h-7 w-7 cursor-pointer " />
              </span>
            </div>

            {/*  */}
          </div>
          <hr className="h-[1.5px] w-full bg-gray-400 my-3" />
          {/* ------------Tabs---------- */}
          <div className="flex items-center  gap-3 3xl:gap-4 ">
            <button
              className={` text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "subtasks" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("subtasks")}
            >
              Sub Tasks
            </button>
            <button
              className={` text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "jobDetail" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("jobDetail")}
            >
              Job Detail
            </button>
            <button
              className={` text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "salesDetail" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("salesDetail")}
            >
              Sales
            </button>
            <button
              className={`  text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "loginInfo" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("loginInfo")}
            >
              Login Info
            </button>
            <button
              className={` hidden  sm:block  text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "departmentInfo" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("departmentInfo")}
            >
              Department
            </button>
            <button
              className={` hidden  sm:block text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "comments" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("comments")}
            >
              comments
            </button>
            <button
              className={` text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "activities" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("activities")}
            >
              Activity
            </button>
          </div>
          <hr className="h-[1.5px] w-full bg-gray-400 my-3" />

          <div className="w-full">
            {activeTab === "subtasks" ? (
              <div className="w-full flex flex-col gap-5 h-screen overflow-y-auto hidden1 p-4">
                {/* ------Subtasks---------- */}
                <div className="flex flex-col w-full px-2">
                  <div className="flex items-center gap-2 w-full ">
                    <form
                      onSubmit={handleCreateSubtask}
                      className="flex items-center gap-2 w-full py-1 px-2 border bg-gray-50 border-gray-300 rounded-lg  "
                    >
                      <input
                        type="text"
                        value={subTask}
                        onChange={(e) => setSubtask(e.target.value)}
                        placeholder="Add Subtask..."
                        className="py-2 px-1 border-none bg-transparent outline-none w-full"
                      />
                      <button
                        type="submit"
                        className="py-[7px] px-4 rounded-md shadow cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {subTaskLoading ? (
                          <RiLoaderFill className="h-6 w-6 animate-spin text-white" />
                        ) : (
                          "Add"
                        )}
                      </button>
                    </form>
                  </div>
                  <div className="mt-2 py-1  rounded-md border border-gray-300 flex flex-col gap-3">
                    <h3 className="text-[17px] w-full font-semibold py-2 text-gray-900 border-b-[1px] px-2 border-gray-300">
                      Checklist (
                      {
                        subTaskData.filter(
                          (subtask) => subtask.status === "complete"
                        ).length
                      }
                      /{subTaskData?.length})
                    </h3>
                    <div className="px-2">
                      {subTaskData.length > 0 ? (
                        <DragDropContext onDragEnd={handleOnDragEnd}>
                          <Droppable droppableId="subTaskData">
                            {(provided) => (
                              <ul
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{ listStyle: "none", padding: 0 }}
                              >
                                {subTaskData?.map(
                                  ({ _id, subTask, status }, index) => (
                                    <Draggable
                                      key={_id}
                                      draggableId={_id}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <li
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            ...provided.draggableProps.style,
                                            padding: "8px",
                                            marginBottom: "4px",
                                            backgroundColor:
                                              status === "complete"
                                                ? "#d4edda"
                                                : "#f3f3f3",
                                            borderRadius: "4px",
                                            border: "1px solid #ddd",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginLeft: "-.2rem",
                                          }}
                                          className="flex items-center justify-between gap-2"
                                        >
                                          <div className="flex items-center gap-2 w-full">
                                            <div className="w-6 h-full mt-1">
                                              <input
                                                type="checkbox"
                                                checked={status === "complete"}
                                                onChange={() =>
                                                  updateSubtaskStatus(_id)
                                                }
                                                style={{
                                                  accentColor: "orangered",
                                                }}
                                                className="h-5 w-5 cursor-pointer  checked:bg-orange-600"
                                              />
                                            </div>
                                            <p
                                              className={`text-[15px] ${
                                                status === "complete" &&
                                                "line-through"
                                              }`}
                                            >
                                              {subTask}
                                            </p>
                                          </div>

                                          <div className="flex items-center gap-1">
                                            <span
                                              className="p-1 cursor-pointer"
                                              onClick={() =>
                                                setSubtask(subTask)
                                              }
                                            >
                                              <FaEdit className="h-5 w-5 cursor-pointer text-gray-800 hover:text-sky-600" />
                                            </span>
                                            <span
                                              className="p-1 cursor-pointer"
                                              onClick={() =>
                                                handleDeleteSubTask(_id)
                                              }
                                            >
                                              <IoCloseCircleOutline
                                                size={24}
                                                className="cursor-pointer hover:text-red-500 "
                                                title="Delete Subtask"
                                              />
                                            </span>
                                          </div>
                                        </li>
                                      )}
                                    </Draggable>
                                  )
                                )}
                                {provided.placeholder}
                              </ul>
                            )}
                          </Droppable>
                        </DragDropContext>
                      ) : (
                        <div className="w-full py-8 flex items-center flex-col justify-center">
                          <img
                            src="/notask1.png"
                            alt="No_Task"
                            className="h-[12rem] w-[16rem] animate-pulse"
                          />
                          <span className="text-center text-[14px] text-gray-500">
                            Subtask not available!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* --------Quality Check-------- */}
                <div className="flex flex-col w-full px-2 gap-3">
                  <div className=" relative w-full flex items-center justify-between gap-4">
                    <h3 className="text-[17px] font-semibold text-gray-900">
                      Quality Check
                    </h3>
                    <span onClick={() => setShowQuality(!showQuality)}>
                      <RiListView className="h-6 w-6 cursor-pointer text-sky-500" />
                    </span>
                    {showQuality && (
                      <div className="absolute top-[.5rem] right-[2rem] flex items-center gap-4 bg-gray-50 w-[16rem]">
                        {qualities.length > 0 && (
                          <div className="flex flex-col gap-2 w-full  p-3 border rounded-md mb-2">
                            {qualities &&
                              qualities
                                .filter(
                                  (item) =>
                                    !qualityData.some(
                                      (quality) => quality.subTask === item.task
                                    )
                                )
                                ?.map((item) => (
                                  <div
                                    className={` flex items-center  justify-between gap-2 relative py-[2px] px-2 rounded-md hover:shadow  cursor-pointer  bg-white border border-gray-300`}
                                  >
                                    <span className="tet-[14px] text-gray-800">
                                      {item?.task}
                                    </span>
                                    <span
                                      onClick={() =>
                                        handleCreateQualityByClick(item?.task)
                                      }
                                      className=" w-[1.5rem] h-[1.5rem] flex items-center justify-center  rounded-full p-[3px] cursor-pointer z-[10]"
                                    >
                                      <MdOutlineAddBox className="h-5 w-5 cursor-pointer text-black" />
                                    </span>
                                  </div>
                                ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full ">
                    <form
                      onSubmit={handleCreateQuality}
                      className="flex items-center gap-2 w-full py-1 px-2 border bg-gray-50 border-gray-300 rounded-lg  "
                    >
                      <input
                        type="text"
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        placeholder="Add quality check..."
                        className="py-2 px-1 border-none bg-transparent outline-none w-full"
                      />
                      <button
                        type="submit"
                        className="py-[7px] px-4 rounded-md shadow cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {loadingQuality ? (
                          <RiLoaderFill className="h-6 w-6 animate-spin text-white" />
                        ) : (
                          "Add"
                        )}
                      </button>
                    </form>
                  </div>
                  <div className="mt-2 py-1  rounded-md border border-gray-300 flex flex-col gap-3">
                    <h3 className="text-[17px] w-full font-semibold py-2 text-gray-900 border-b-[1px] px-2 border-gray-300">
                      Checklist (
                      {
                        qualityData.filter(
                          (subtask) => subtask.status === "complete"
                        ).length
                      }
                      /{qualityData?.length})
                    </h3>
                    <div className="px-2">
                      {qualityData.length > 0 ? (
                        <DragDropContext
                          onDragEnd={handleOnDragEndQualityCheck}
                        >
                          <Droppable droppableId="subTaskData">
                            {(provided) => (
                              <ul
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{ listStyle: "none", padding: 0 }}
                              >
                                {qualityData?.map(
                                  ({ _id, subTask, status, user }, index) => (
                                    <Draggable
                                      key={_id}
                                      draggableId={_id}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <li
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            ...provided.draggableProps.style,
                                            padding: "4px 8px",
                                            marginBottom: "4px",
                                            backgroundColor:
                                              status === "complete"
                                                ? "#d4edda"
                                                : "#f3f3f3",
                                            borderRadius: "4px",
                                            border: "1px solid #ddd",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginLeft: "-.2rem",
                                          }}
                                          className="flex items-center justify-between gap-2"
                                        >
                                          <div className="flex items-center gap-2 w-full">
                                            <div className="w-6 h-full mt-2 ">
                                              <input
                                                type="checkbox"
                                                checked={status === "complete"}
                                                onChange={() =>
                                                  updateQualityCheckStatus(_id)
                                                }
                                                style={{
                                                  accentColor: "orangered",
                                                }}
                                                className="h-5 w-5  cursor-pointer  checked:bg-orange-600"
                                              />
                                            </div>
                                            <p
                                              className={`text-[15px] ${
                                                status === "complete" &&
                                                "line-through"
                                              }`}
                                            >
                                              {subTask}
                                            </p>
                                          </div>

                                          <div className="flex items-center gap-1">
                                            {user?.name && (
                                              <span className="min-w-[5rem] py-1 px-3 rounded-md bg-sky-600 text-white text-[12px]">
                                                {user?.name}
                                              </span>
                                            )}
                                            <span
                                              className="p-1 cursor-pointer"
                                              onClick={() =>
                                                setQuality(subTask)
                                              }
                                            >
                                              <FaEdit className="h-5 w-5 cursor-pointer text-gray-800 hover:text-sky-600" />
                                            </span>
                                            <span
                                              className="p-1 cursor-pointer"
                                              onClick={() =>
                                                handleDeleteQuality(_id)
                                              }
                                            >
                                              <IoCloseCircleOutline
                                                size={24}
                                                className="cursor-pointer hover:text-red-500 "
                                                title="Delete Subtask"
                                              />
                                            </span>
                                          </div>
                                        </li>
                                      )}
                                    </Draggable>
                                  )
                                )}
                                {provided.placeholder}
                              </ul>
                            )}
                          </Droppable>
                        </DragDropContext>
                      ) : (
                        <div className="w-full py-8 flex items-center flex-col justify-center">
                          <img
                            src="/notask1.png"
                            alt="No_Task"
                            className="h-[12rem] w-[16rem] animate-pulse"
                          />
                          <span className="text-center text-[14px] text-gray-500">
                            Quality check not available!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === "jobDetail" ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <div className="grid grid-cols-2">
                    <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
                      Client Name
                    </span>
                    <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
                      {clientDetail?.clientName ? (
                        clientDetail?.clientName
                      ) : (
                        <span className="text-red-500">N/A</span>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="border border-gray-300 text-black font-medium  py-2 px-2 ">
                      Company Name
                    </span>

                    <span className="border border-gray-300 text-gray-600 py-2 px-2">
                      <span
                        className={` py-1 px-3 rounded-[1.5rem] ${
                          clientDetail?.companyName.length > 25 && "text-[14px]"
                        }  w-full shadow-md bg-cyan-500 text-white`}
                      >
                        {clientDetail?.companyName ? (
                          clientDetail?.companyName
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                      Registeration Name
                    </span>
                    <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
                      {clientDetail?.regNumber ? (
                        clientDetail?.regNumber
                      ) : (
                        <span className="text-red-500">N/A</span>
                      )}
                    </span>
                  </div>

                  {auth?.user?.role?.name === "Admin" && (
                    <div className="grid grid-cols-2">
                      <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                        Email
                      </span>
                      <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
                        {clientDetail?.email ? (
                          clientDetail?.email
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2">
                    <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-bl-md ">
                      Hours
                    </span>
                    <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-br-md ">
                      {clientDetail?.totalHours ? (
                        clientDetail?.totalHours
                      ) : (
                        <span className="text-red-500">N/A</span>
                      )}
                    </span>
                  </div>
                </div>
                {/* -----------Work Plan--------- */}
                <div className="min-h-[20rem] w-full rounded-lg border border-gray-300 shadow-md bg-white p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-700">
                      Work Plan
                    </h2>
                    <button
                      className="text-sm text-blue-500 hover:underline"
                      onClick={() => setShowEdit(!showEdit)}
                    >
                      {clientDetail?.workPlan ? "Edit" : "Add"}
                    </button>
                  </div>
                  <hr className="w-full  h-[1px] bg-gray-400 mb-2" />
                  {showEdit ? (
                    <form
                      onSubmit={handleWorkPlan}
                      className="relative h-[15rem]"
                    >
                      <ReactQuill
                        className="w-full h-[10rem] rounded-lg"
                        placeholder="Type your work plan here..."
                        value={workPlan}
                        onChange={(value) => setWorkPlan(value)}
                      />
                      <div className="w-full absolute mt-[3rem] flex items-center justify-end ">
                        <button
                          type="submit"
                          className="py-2 px-4 rounded-md shadow text-white bg-orange-500 hover:bg-orange-600 cursor-auto"
                        >
                          {load ? (
                            <RiLoader2Fill className="h-5 w-5 animate-spin text-white" />
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: clientDetail?.workPlan,
                      }}
                      className="whitespace-pre-wrap break-words"
                    ></div>
                  )}
                </div>
              </div>
            ) : activeTab === "salesDetail" ? (
              <div className="flex flex-col">
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
                    Date
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
                    {clientDetail?.currentDate ? (
                      <span>
                        {format(
                          new Date(
                            clientDetail?.currentDate ||
                              "2024-07-26T00:00:00.000+00:00"
                          ),
                          "dd-MMM-yyyy"
                        )}
                      </span>
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium  py-2 px-2 ">
                    Source
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2">
                    {clientDetail?.source ? (
                      clientDetail?.source
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    Client Type
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2  ">
                    <span className=" py-1 px-5 rounded-[1.5rem] shadow-md bg-yellow-500 text-white">
                      {clientDetail?.clientType ? (
                        clientDetail?.clientType
                      ) : (
                        <span className="text-red-500">N/A</span>
                      )}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    Partner
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2  ">
                    <span className="   ">
                      {clientDetail?.partner ? (
                        clientDetail?.partner
                      ) : (
                        <span className="text-red-500">N/A</span>
                      )}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    Courtry
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
                    {clientDetail?.country ? (
                      clientDetail?.country
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-bl-md ">
                    Fee
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-br-md ">
                    {clientDetail?.fee ? (
                      clientDetail?.fee
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
              </div>
            ) : activeTab === "loginInfo" ? (
              <div className="flex flex-col">
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
                    CT Login
                  </span>
                  <span className="border flex items-center gap-1 border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
                    <>
                      <span className="w-full">
                        {clientDetail?.ctLogin ? (
                          clientDetail?.ctLogin
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </span>
                      <hr className="w-[2px] h-full bg-gray-300" />
                      <span className="w-full">
                        {clientDetail?.ctPassword ? (
                          clientDetail?.ctPassword
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </span>
                    </>
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border  border-gray-300 text-black font-medium  py-2 px-2 ">
                    PYE Login
                  </span>
                  <span className="border flex items-center gap-1 border-gray-300 text-gray-600 py-2 px-2">
                    <>
                      <span className="w-full">
                        {clientDetail?.pyeLogin ? (
                          clientDetail?.pyeLogin
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </span>
                      <hr className="w-[2px] h-full bg-gray-300" />
                      <span className="w-full">
                        {clientDetail?.pyePassword ? (
                          clientDetail?.pyePassword
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </span>
                    </>
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    TR Login
                  </span>
                  <span className="border flex items-center gap-1 border-gray-300 text-gray-600 py-2 px-2  ">
                    <>
                      <span className="w-full">
                        {clientDetail?.trLogin ? (
                          clientDetail?.trLogin
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </span>
                      <hr className="w-[2px] h-full bg-gray-300" />
                      <span className="w-full">
                        {clientDetail?.trPassword ? (
                          clientDetail?.trPassword
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </span>
                    </>
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    VAT Login
                  </span>
                  <span className="border flex items-center gap-1 border-gray-300 text-gray-600 py-2 px-2 ">
                    <>
                      <span className="w-full">
                        {clientDetail?.vatLogin ? (
                          clientDetail?.vatLogin
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </span>
                      <hr className="w-[2px] h-full bg-gray-300" />
                      <span className="w-full">
                        {clientDetail?.vatPassword ? (
                          clientDetail?.vatPassword
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </span>
                    </>
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    Authentication Code
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
                    <span className=" py-1 px-5 rounded-[1.5rem] shadow-md bg-teal-500 text-white">
                      {clientDetail?.authCode ? (
                        clientDetail?.authCode
                      ) : (
                        <span className="text-red-500">N/A</span>
                      )}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-bl-md ">
                    UTR
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-br-md ">
                    {clientDetail?.utr ? (
                      clientDetail?.utr
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
              </div>
            ) : activeTab === "departmentInfo" ? (
              <div className="flex flex-col">
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
                    Department Name
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
                    <span className=" py-1 px-5 rounded-[1.5rem] shadow-md bg-indigo-500 text-white">
                      {clientDetail?.job.jobName ? (
                        clientDetail?.job.jobName
                      ) : (
                        <span className="text-red-500">N/A</span>
                      )}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium  py-2 px-2 ">
                    Year End
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2">
                    {format(
                      new Date(
                        clientDetail?.job?.yearEnd ||
                          "2024-07-26T00:00:00.000+00:00"
                      ),
                      "dd-MMM-yyyy"
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    Deadline
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2  ">
                    {clientDetail?.job?.jobDeadline ? (
                      format(
                        new Date(
                          clientDetail?.job?.jobDeadline ||
                            "2024-07-26T00:00:00.000+00:00"
                        ),
                        "dd-MMM-yyyy"
                      )
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    Work Date
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
                    {clientDetail?.job?.workDeadline ? (
                      format(
                        new Date(
                          clientDetail?.job?.workDeadline ||
                            "2024-07-26T00:00:00.000+00:00"
                        ),
                        "dd-MMM-yyyy"
                      )
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2  ">
                    Hours
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2  ">
                    {clientDetail?.job?.hours ? (
                      clientDetail?.job?.hours
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2  ">
                    Fee
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
                    {clientDetail?.job?.fee ? (
                      clientDetail?.job?.fee
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    Lead
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
                    {clientDetail?.job?.lead ? (
                      clientDetail?.job?.lead
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-bl-md ">
                    Job Holder
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-br-md ">
                    {clientDetail?.job?.jobHolder ? (
                      clientDetail?.job?.jobHolder
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
              </div>
            ) : activeTab === "activities" ? (
              <div className="flex flex-col gap-2 w-full h-full overflow-y-auto p-2 ">
                {clientDetail?.activities?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((activity) => (
                  
                  <div
                    className="w-full flex flex-col gap-2 py-2 px-3 border border-gray-300 rounded-md shadow hover:shadow-md bg-white hover:bg-orange-50 transition-all duration-300 cursor-pointer hover:scale-[1.03] ease-in-out "
                    key={activity?._id}
                  >{console.log("THE ACTIVITY 💕💚💛🧡🤍🤎💜",activity)}
                    <p className="mb-2 text-[15px] font-medium text-green-500 mt-2 flex items-center gap-2">
                      <span className="w-[.8rem] h-[.8rem] rounded-full bg-green-500"></span>
                      {new Date(activity?.createdAt).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="flex-shrink-0">
                        {activity?.user?.avatar ? (
                          <img
                            src={activity?.user?.avatar}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full text-white font-semibold flex items-center justify-center"
                            style={{
                              backgroundColor: `#${Math.floor(
                                Math.random() * 16777215
                              ).toString(16)}`,
                            }}
                          >
                            {activity?.user?.name?.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <strong className="text-[16px] font-medium text-black capitalize">
                        {activity?.user?.name}
                      </strong>
                    </div>
                    {/* Action */}
                    <strong className="text-[15px] font-semibold text-black">
                      Action:{" "}
                      <span className="text-[13px] text-gray-700 ml-1 font-normal">
                        {activity?.activity}
                      </span>
                    </strong>
                  </div>
                ))}
                {clientDetail?.activities.length === 0 && (
                  <div className="flex flex-col gap-1 items-center justify-center w-full min-h-[40vh]">
                    <img
                      src="/rb_695.png"
                      alt="notfound"
                      className="h-[12rem] w-[12rem] animate-pulse"
                    />
                    <span className="text-[13px] text-gray-700">
                      No activity found!
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <JobCommentModal
                setIsComment={""}
                jobId={clientId}
                setJobId={""}
                users={users}
                type={"Jobs"}
                getTasks1={allClientData}
                page={"detail"}
              />
            )}
          </div>

          {/* Edit Modal */}
          {isOpen && (
            <div className="fixed top-0 left-0 w-full min-h-screen overflow-y-auto z-[999] bg-gray-100 flex items-center justify-center py-6  px-4">
              <span
                className="absolute top-[4px] right-[.8rem] cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-gray-300/70 transition-all duration-150 flex items-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                <CgClose className="h-5 w-5 text-black" />
              </span>
              <EditJobModal
                setIsOpen={setIsOpen}
                allClientJobData={allClientJobData}
                jobId={jobId}
              />
            </div>
          )}
          {/* Copy Job Modal */}
          {openCopy && (
            <div className="fixed top-0 left-0 w-full min-h-screen overflow-y-auto z-[999] bg-gray-100 flex items-center justify-center py-6  px-4">
              <span
                className="absolute top-[4px] right-[.8rem] cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-gray-300/70 transition-all duration-150 flex items-center justify-center"
                onClick={() => setOpenCopy(false)}
              >
                <CgClose className="h-5 w-5 text-black" />
              </span>
              <CopyJobModel
                setIsOpen={setOpenCopy}
                allClientJobData={allClientJobData}
                jobId={jobId}
              />
            </div>
          )}

          {/* Stop Timer */}
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
                      <button
                        className={`${style.btn}`}
                        onClick={handleStopTimer}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Reminder */}
          {showReminder && (
            <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
              <Reminder
                setShowReminder={setShowReminder}
                taskId={clientId}
                link={"/job-planning"}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
