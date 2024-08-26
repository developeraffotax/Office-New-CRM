import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { GoGoal } from "react-icons/go";
import { MdDateRange, MdInsertComment } from "react-icons/md";
import { RiTimerLine } from "react-icons/ri";
import { format } from "date-fns";
// import { MdOutlineInsertComment } from "react-icons/md";
import Loader from "../../utlis/Loader";
import { Timer } from "../../utlis/Timer";
import { useAuth } from "../../context/authContext";
import { FaRegUser } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { CgClose } from "react-icons/cg";
import EditJobModal from "../../components/Modals/EditJobModal";
import { AiFillDelete } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import Swal from "sweetalert2";
import { MdCheckCircle } from "react-icons/md";

export default function JobDetail({
  clientId,
  handleStatus,
  allClientJobData,
  handleDeleteJob,
}) {
  const [clientDetail, setClientDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("jobDetail");
  const { auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [jobId, setJobId] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [note, setNote] = useState("");
  const timerRef = useRef();

  // ---------Stop Timer ----------->
  const handleStopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

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

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full relative  mt-2 overflow-y-scroll h-[calc(100vh-7rem)] pb-4 hidden1 ">
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
              className=""
              title="Complete Job"
              onClick={() => {
                handleUpdateStatus();
              }}
            >
              <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
            </span>
            <span
              className=""
              title="Delete Job"
              onClick={() => handleDeleteConfirmation(clientDetail._id)}
            >
              <AiFillDelete className="h-5 w-5 cursor-pointer text-red-500 hover:text-red-600" />
            </span>
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
                <option value="">Select</option>
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
            {/*  */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
                <RiTimerLine className="h-4 w-4 text-gray-500" /> Stack Timer
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
                  taskName={clientDetail?.job?.jobName}
                />
              </span>
            </div>
            {/*------------- Comment------- */}
            {/* <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500 w-[30%]">
                <MdOutlineInsertComment className="h-4 w-4 text-gray-500" />{" "}
                Comments
              </span>
              <span
                className="text-[17px] font-medium text-gray-800 relative"
                onClick={() => setActiveTab("comments")}
              >
                <span className=" absolute top-[-.5rem] right-[-.8rem] w-[1.1rem] h-[1.1rem] flex items-center justify-center font-medium rounded-full bg-green-500 text-white p-1 text-[12px]">
                  10
                </span>
                <span className="text-[1rem] cursor-pointer  ">
                  <MdInsertComment className="h-6 w-6 text-orange-500 hover:text-orange-600 " />
                </span>
              </span>
            </div> */}
            {/*  */}
          </div>
          <hr className="h-[1.5px] w-full bg-gray-400 my-3" />
          {/* ------------Tabs---------- */}
          <div className="flex items-center  gap-4 ">
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
              Sales Detail
            </button>
            <button
              className={` text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "loginInfo" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("loginInfo")}
            >
              Login Info
            </button>
            <button
              className={` text-[14px] font-medium cursor-pointer py-1  ${
                activeTab === "departmentInfo" && "border-b-2 border-orange-600"
              } `}
              onClick={() => setActiveTab("departmentInfo")}
            >
              Department Detail
            </button>
          </div>
          <hr className="h-[1.5px] w-full bg-gray-400 my-3" />

          <div className="w-full">
            {activeTab === "jobDetail" ? (
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
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
                    {clientDetail?.ctLogin ? (
                      clientDetail?.ctLogin
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium  py-2 px-2 ">
                    PYE Login
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2">
                    {clientDetail?.pyeLogin ? (
                      clientDetail?.pyeLogin
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    TR Login
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2  ">
                    {clientDetail?.trLogin ? (
                      clientDetail?.trLogin
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
                    VAT Login
                  </span>
                  <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
                    {clientDetail?.vatLogin ? (
                      clientDetail?.vatLogin
                    ) : (
                      <span className="text-red-500">N/A</span>
                    )}
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
            ) : (
              "Comments"
            )}
          </div>

          {/* Edit Modal */}
          {isOpen && (
            <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100 flex items-center justify-center py-6  px-4">
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
        </div>
      )}
    </>
  );
}
