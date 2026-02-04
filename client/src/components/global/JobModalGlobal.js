import { useState, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";

import { closeModal } from "../../redux/slices/globalModalSlice";
import JobDetail from "../../pages/Jobs/JobDetail";
import { useEscapeKey } from "../../utlis/useEscapeKey";

export const JobModalGlobal = ({ clientId }) => {
  const dispatch = useDispatch();
  const [companyName, setCompanyName] = useState("");

  // Close modal on Escape key
  useEscapeKey(() => dispatch(closeModal()));

  // ------------------- API Handlers -------------------

  const handleDeleteJob = useCallback(async (jobId) => {
    if (!jobId) return toast.error("Job ID is required!");

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/client/delete/job/${jobId}`
      );
      toast.success("Client job deleted successfully!");
      dispatch(closeModal())
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete job");
    }
  }, []);

  const handleStatusChange = useCallback(async (jobId, newStatus) => {
    if (!jobId) return toast.error("Job ID is required!");

    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/client/update/status/${jobId}`,
        { status: newStatus }
      );
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Error updating job status:", err);
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  }, []);

  if (!clientId) return null;

  // ------------------- Render -------------------
  return (
    <div className="fixed inset-0 z-[499] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-gray-100 rounded-xl shadow-lg w-[95%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[70%] 3xl:w-[60%] py-4 px-5">
        <div className="flex flex-col h-full w-full relative">
          {/* Header */}
          <header className="flex items-center justify-between border-b px-4 py-2">
            <h3 className="text-lg font-semibold">Company: {companyName}</h3>
            <button
              onClick={() => dispatch(closeModal())}
              className="p-1 rounded-md bg-gray-50 border hover:shadow-md hover:bg-gray-100"
              aria-label="Close modal"
            >
              <IoClose className="h-5 w-5" />
            </button>
          </header>

          {/* Body */}
          <JobDetail
            clientId={clientId}
            handleStatus={handleStatusChange}
            handleDeleteJob={handleDeleteJob}
            setCompanyName={typeof setCompanyName === "function" ? setCompanyName : undefined}
            allClientJobData={() => {}} // Placeholder, implement if needed
          />
        </div>
      </div>
    </div>
  );
};
