import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { GoGoal } from "react-icons/go";
import { MdDateRange } from "react-icons/md";
import { RiLoaderFill, RiTimerLine } from "react-icons/ri";
import { format } from "date-fns";
import Loader from "../../utlis/Loader";
import { Timer } from "../../utlis/Timer";
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

import { useSelector } from "react-redux";
 
import { TopTabs } from "./TopTabs";
import {SubtasksTab} from "./detailComponents/SubtasksTab"
import {JobDetailTab} from "./detailComponents/JobDetailTab"
import { SalesTab } from "./detailComponents/SalesTab";
import { LoginInfoTab } from "./detailComponents/LoginInfoTab";
import { DepartmentTab } from "./detailComponents/DepartmentTab";
import DetailComments from "../Tasks/TaskDetailComments";
 

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

  const auth = useSelector((state) => state.auth.auth);
  const anyTimerRunning = useSelector((state) => state.auth.anyTimerRunning);

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
        console.log("Client Data💚💛💛🧡🧡🧡❤💛💚💛💛💛🧡🧡", data.clientJob);
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




    // ----------Crate Subtask---------->
  const handleCreateSubtaskFromTemplate = async (subTask) => {
     
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
      <div className="w-full  h-[90vh]  flex flex-col justify-between items-start gap-5 p-4 pb-16 relative ">
        <div
          id="mainnnnnnn"
          className="w-full flex flex-row justify-start gap-5 items-start h-[50%]"
        >


          <div className="flex flex-col w-full px-2 h-full ">
                <TopTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          

 {
            activeTab === "subtasks" && <SubtasksTab
            
                subTaskData={subTaskData}
                subTask={subTask}
                setSubtask={setSubtask}
                handleCreateSubtask={handleCreateSubtask}
                handleCreateSubtaskFromTemplate={handleCreateSubtaskFromTemplate}
                subTaskLoading={subTaskLoading}
                handleOnDragEnd={handleOnDragEnd}
                updateSubtaskStatus={updateSubtaskStatus}
                handleDeleteSubTask={handleDeleteSubTask}
            
            
            
            
            
            
            />
          }


          {
            activeTab === "jobDetail" &&  <JobDetailTab 
            
                clientDetail={clientDetail}
                auth={auth}
                showEdit={showEdit}
                setShowEdit={setShowEdit}
                workPlan={workPlan}
                setWorkPlan={setWorkPlan}
                handleWorkPlan={handleWorkPlan}
                load={load}
            
          
            />
          }


          
          { activeTab === "salesDetail" &&  <SalesTab clientDetail={clientDetail} /> }
          { activeTab === "loginInfo" &&  <LoginInfoTab clientDetail={clientDetail} /> }
          { activeTab === "departmentInfo" &&  <DepartmentTab clientDetail={clientDetail} /> }


          
        

         


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
                <option value="Quote">Quote</option>
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
        </div>

        <div
          id="mainnnsnnnssn"
          className="w-full flex flex-row justify-start gap-5 items-start h-[50%]"
        >
          <DetailComments jobId={clientId} type="Jobs" getTasks1={() => null} />

          <div className="flex flex-col w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  {/* Header */}
  <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b bg-gray-50">
    <h3 className="text-base font-semibold text-gray-800">Activity</h3>
  </div>

  {/* Content */}
  <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
    {clientDetail?.activities?.length ? (
      clientDetail.activities
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((activity) => (
          <div
            key={activity?._id}
            className="group flex items-start gap-3 bg-white border border-gray-200 rounded-md p-3 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {activity?.user?.avatar ? (
                <img
                  src={activity?.user?.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border border-orange-400"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white"
                  style={{
                    backgroundColor: `#${Math.floor(
                      Math.random() * 16777215
                    ).toString(16)}`,
                  }}
                >
                  {activity?.user?.name?.slice(0, 1)?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {activity?.user?.name}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(activity?.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-0.5">
                <span className="font-semibold text-gray-800">Action:</span>{" "}
                {activity?.activity}
              </p>
            </div>
          </div>
        ))
    ) : (
      <div className="flex flex-col items-center justify-center w-full min-h-[40vh] py-6 text-center">
        <img
          src="/rb_695.png"
          alt="notfound"
          className="h-28 w-28 opacity-80 animate-pulse mb-2"
        />
        <span className="text-sm text-gray-600">No activity found</span>
      </div>
    )}
  </div>
</div>

        </div>



             <div className="absolute w-full flex justify-end  items-center gap-4 bottom-2 right-2 ">
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


















        {/* Edit Modal */}
        {isOpen && (
          <div className="fixed top-0 left-0 w-full min-h-full overflow-y-auto z-[999] bg-gray-100 flex items-center justify-center py-6  px-4">
            {/* <span
                className="absolute top-[4px] right-[.8rem] cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-gray-300/70 transition-all duration-150 flex items-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                <CgClose className="h-5 w-5 text-black" />
              </span> */}
            <EditJobModal
              setIsOpen={setIsOpen}
              allClientJobData={allClientJobData}
              jobId={jobId}
            />
          </div>
        )}
        {/* Copy Job Modal */}
        {openCopy && (
          <div className="fixed top-0 left-0 w-full min-h-full overflow-y-auto z-[999] bg-gray-100 flex items-center justify-center py-6  px-4">
            {/* <span
                className="absolute top-[4px] right-[.8rem] cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-gray-300/70 transition-all duration-150 flex items-center justify-center"
                onClick={() => setOpenCopy(false)}
              >
                <CgClose className="h-5 w-5 text-black" />
              </span> */}
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
    </>
  );
}
