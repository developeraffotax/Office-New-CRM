import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

export default function ComplaintDetail({
  complaintId,
  setComplaintId,
  setShowDetail,
}) {
  const [note, setNote] = useState("");
  // Fetch Proposal
  const fetchProposal = async () => {
    if (!complaintId) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/complaints/fetch/single/complaint/${complaintId}`
      );

      if (data) {
        setNote(data.complaint.note);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProposal();

    // eslint-disable-next-line
  }, [complaintId]);
  return (
    <div className=" w-[21rem] sm:w-[42rem] max-h-[105vh] mt-[3rem]  rounded-lg shadow-md bg-white">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">Complaint Detail</h1>
        <span
          onClick={() => {
            setShowDetail(false);
            setComplaintId("");
          }}
        >
          <IoClose className="h-7 w-7 cursor-pointer" />
        </span>
      </div>
      <div className="w-full min-h-[12rem] py-4 px-4 rounded-md border border-gray-300 text-justify text-[15px] ">
        {note}
      </div>
    </div>
  );
}
