import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import CustomEditor from "../../utlis/CustomEditor";
import { TbLoader2 } from "react-icons/tb";

export default function AddProposal({
  setShow,
  proposalId,
  setProposalId,
  user,
  getProposal,
}) {
  const [clientName, setClientName] = useState("");
  const [jobHolder, setJobHolder] = useState("");
  const [subject, setSubject] = useState("");
  const [mail, setMail] = useState("");
  const [jobDate, setJobDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const sources = ["Email", "UPW", "PPH", "Other"];
  const state = ["Proposal", "Lead", "Client"];
  const [loading, setLoading] = useState(false);

  // Fetch Proposal

  const fetchProposal = async () => {
    if (!proposalId) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/proposal/fetch/proposal/${proposalId}`
      );
      const formattedJobDate = new Date(
        data.proposal.jobDate
      ).toLocaleDateString("en-CA");
      const formattedDeadline = new Date(
        data.proposal.deadline
      ).toLocaleDateString("en-CA");
      if (data) {
        setClientName(data.proposal.clientName);
        setJobHolder(data.proposal.jobHolder);
        setSubject(data.proposal.subject);
        setMail(data.proposal.mail);
        setJobDate(formattedJobDate);
        setDeadline(formattedDeadline);
        setSource(data.proposal.source);
        setNote(data.proposal.note);
        setStatus(data.proposal.status);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchProposal();
  }, [proposalId]);

  // Handle Proposal
  const handleProposal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (proposalId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/proposal/update/proposal/${proposalId}`,
          {
            clientName,
            jobHolder,
            subject,
            mail,
            jobDate,
            deadline,
            source,
            note,
            status,
          }
        );

        if (data) {
          getProposal();
          setShow(false);
          setLoading(false);
          toast.success("Proposal update successfully.");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/proposal/add/proposal`,
          {
            clientName,
            jobHolder,
            subject,
            mail,
            jobDate,
            deadline,
            source,
            note,
            status,
          }
        );
        if (data) {
          getProposal(getProposal);
          setShow(false);
          setLoading(false);
          toast.success("New proposal added successfully.");
        }
      }
    } catch (error) {
      setLoading(false);

      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  return (
    <div className=" w-[21rem] sm:w-[40rem] max-h-[105vh] mt-[3rem] hidden1 overflow-y-auto rounded-lg shadow-md bg-white">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">
          {proposalId ? "Update Proposal" : "Add Proposal"}
        </h1>
        <span
          onClick={() => {
            setShow(false);
            setProposalId("");
          }}
        >
          <IoClose className="h-7 w-7 cursor-pointer" />
        </span>
      </div>
      <form
        onSubmit={handleProposal}
        className="  py-4 px-3 sm:px-4 mt-3 flex flex-col gap-4 w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="inputBox">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Client Name</span>
          </div>
          <div className="inputBox">
            <select
              value={jobHolder}
              onChange={(e) => setJobHolder(e.target.value)}
              className={`${style.input} w-full `}
            >
              <option value="">Select Jobholder</option>
              {user?.map((user, i) => (
                <option key={i} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="inputBox">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={`${style.input} w-full `}
          />
          <span>Subject</span>
        </div>
        <CustomEditor template={mail} setTemplate={setMail} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="inputBox">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Deadline</span>
          </div>
          <div className="inputBox">
            <input
              type="date"
              value={jobDate}
              onChange={(e) => setJobDate(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Job Date</span>
          </div>
        </div>
        {/*  */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="inputBox">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={`${style.input} w-full `}
            >
              <option value="">Select Source</option>
              {sources?.map((sour, i) => (
                <option key={i} value={sour}>
                  {sour}
                </option>
              ))}
            </select>
          </div>
          <div className="inputBox">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${style.input} w-full `}
            >
              <option value="">Select Status</option>
              {state?.map((stat, i) => (
                <option key={i} value={stat}>
                  {stat}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/*  */}
        <div className="inputBox">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${style.input} w-full `}
          />
          <span>Note</span>
        </div>
        {/*  */}

        <div className="flex items-center justify-end ">
          <button
            disabled={loading}
            className={`${style.button1} text-[15px] `}
            type="submit"
            style={{ padding: ".4rem 1rem" }}
          >
            {loading ? (
              <TbLoader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <span>{proposalId ? "Update" : "Create"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
