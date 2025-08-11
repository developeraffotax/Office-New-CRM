import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoArrowBackOutline, IoSearch } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../../utlis/Loader";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaUserPlus } from "react-icons/fa";
import { AiTwotoneDelete } from "react-icons/ai";
import InboxDetail from "./InboxDetail";
import AssignToUserModal from "../../components/Tickets/AssignToUserModal";
import { TbLoader2 } from "react-icons/tb";
import { IoReload } from "react-icons/io5";
import { AiFillDelete } from "react-icons/ai";

export default function Inbox() {
  const [selectedCompany, setSelectedCompany] = useState("Affotax");
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);
  const pageSize = 17;
  const [show, setShow] = useState(false);
  const [emailId, setEmailId] = useState("");
  const emailRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmailDetail, setShowEmailDetail] = useState(false);
  const [singleEmail, setSingleEmail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadInbox, setLoadInbox] = useState(false);
  const [type, setType] = useState("received");
  const [ids, setIds] = useState([]);
  const [deleteLoad, setDeleteLoad] = useState(false);

  // console.log("Emailid:", ids);
  const navigate = useNavigate();

  const getEmail = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/fetch/inbox/${selectedCompany}/${pageNo}/${type}`
      );
      if (data) {
        setInboxData(data.email.detailedEmails);
        setTotalEmails(data?.email?.detailedEmails?.length || 0);
        setLoading(false);
        getInboxEmail();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching emails!");
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmail();
  }, [selectedCompany, type]);

  const filteredEmails = inboxData.filter((email) => {
    const fromHeader =
      email.emailData.payload.headers.find((header) => header.name === "From")
        ?.value || "No Sender";

    const [name] = fromHeader.includes("<")
      ? fromHeader.split(/(?=<)/)
      : [fromHeader, ""];

    const cleanedName = name.replace(/["<>]/g, "").trim();
    const subject = email.subject || "";

    const nameMatches = cleanedName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const subjectMatches = subject
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return nameMatches || subjectMatches;
  });

  const paginatedEmails = filteredEmails.slice(
    startIndex,
    startIndex + pageSize
  );

  // Handle next
  const handleNextPage = () => {
    if (startIndex + pageSize < filteredEmails.length) {
      setStartIndex((prev) => prev + pageSize);
    }
    setPageNo((prev) => prev + 1);
  };

  // Handle previous
  const handlePreviousPage = () => {
    if (startIndex - pageSize >= 0) {
      setStartIndex((prev) => prev - pageSize);
    }
    setPageNo((prev) => prev - 1);
  };

  // Get Email without load
  const getInboxEmail = async () => {
    setLoadInbox(true);
    try {
      const { data } = await axios.get(
        `${
          process.env.REACT_APP_API_URL
        }/api/v1/tickets/fetch/inbox/${selectedCompany}/${50}/${type}`
      );
      if (data) {
        setInboxData(data.email.detailedEmails);
        setTotalEmails(data?.email?.detailedEmails?.length || 0);
        setLoadInbox(false);
      }
    } catch (error) {
      setLoadInbox(false);
      console.log(error);
      toast.error("Error fetching emails!");
    }
  };
  // Close Timer Status to click anywhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emailRef.current && !emailRef.current.contains(event.target)) {
        setShow(false);
        setEmailId("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteEmail = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/delete/inbox/email/${id}/${selectedCompany}`,
        { ids }
      );
      if (data) {
        getInboxEmail();
        setEmailId("");
        toast.success("Email delete successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in delete email!");
    }
  };

  // Delete Multiple Emails
  const deleteMultipleEmail = async () => {
    setDeleteLoad(true);
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/delete/multiple/email/${selectedCompany}`,
        {
          data: { ids },
        }
      );
      if (data) {
        const updatedInboxData = inboxData.filter(
          (email) => !ids.includes(email.emailId)
        );

        setInboxData(updatedInboxData);
        getInboxEmail();
        setIds([]);
        toast.success("Emails deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in delete email!");
    } finally {
      setDeleteLoad(false);
    }
  };

  const handleChecked = (id) => {
    setIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((prevId) => prevId !== id)
        : [...prevIds, id]
    );
  };

  const isChecked = (id) => ids.includes(id);

  return (
    <>
      <div className="relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4 pb-[2rem]">
        <div className="flex items-center justify-between flex-wrap gap-5">
          <div className="relative flex items-center gap-4">
            <span
              onClick={() => navigate("/tickets")}
              className="rounded-full p-1 bg-gray-100 hover:bg-orange-500 hover:text-white transition-all duration-300"
            >
              <IoArrowBackOutline className="h-5 w-5 cursor-pointer" />
            </span>

            {/*  */}
            <div className="flex  items-center  border-2 border-orange-500 rounded-sm overflow-hidden  transition-all duration-300 w-fit">
              <button
                className={`py-1 px-2 outline-none transition-all duration-300  w-[6rem] ${
                  type === "received"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => {
                  setType("received");
                }}
              >
                Inbox
              </button>
              <button
                className={`py-1 px-2 outline-none transition-all duration-300 w-[6rem]  ${
                  type === "send"
                    ? "bg-orange-500 text-white"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => setType("send")}
              >
                Send
              </button>
            </div>

            {/*  */}
            <div className="relative hidden sm:flex ">
              <span className="absolute top-[.6rem] left-2 z-10">
                <IoSearch className="h-5 w-5 text-orange-500" />
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setStartIndex(0);
                }}
                className="w-[18rem] sm:w-[35rem] h-[2.5rem] rounded-[2rem] border-2 border-gray-600 focus:border-orange-500 pl-[2rem] px-4 outline-none cursor-pointer"
              />
            </div>
            {/*  */}
            <span
              onClick={getInboxEmail}
              title="Refresh"
              className="p-1 rounded-full bg-gray-200/50 hover:bg-gray-300/50 hover:shadow-md"
            >
              {loadInbox ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-red-500" />
              ) : (
                <IoReload className="h-5 w-5 text-orange-500 hover:text-orange-600" />
              )}
            </span>

            {ids.length > 0 && (
              <span
                className="p-1 rounded-full bg-gray-200/50 hover:bg-gray-300/50 hover:shadow-md"
                title="Delete Emails"
                onClick={() => deleteMultipleEmail()}
              >
                <AiFillDelete className="text-red-500 hover:text-red-600 h-5 w-5 cursor-pointer" />
              </span>
            )}
          </div>
          <div className="">
            <select
              className={`${style.input}`}
              value={selectedCompany}
              required
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setStartIndex(0);
              }}
              style={{ width: "16rem" }}
            >
              <option>Select Company</option>
              <option value="Affotax">info@affotax.com</option>
              <option value="Outsource">
                admin@outsourceaccountings.co.uk
              </option>
            </select>
          </div>
        </div>

        <hr className="w-full bg-gray-300 mt-[1rem] mb-[1rem]" />
        {deleteLoad && (
          <div className="pb-5">
            <div class="loader"></div>
          </div>
        )}
        <div className="relative flex flex-col gap-4">
          {loading ? (
            <Loader />
          ) : (
            <div className="flex flex-col gap-2 w-full min-w-[50rem] overflow-x-auto hidden1">
              {paginatedEmails.map((email, i) => (
                <div
                  disabled={deleteLoad}
                  className="w-full flex items-center justify-between py-2 px-4 rounded-md hover:shadow-md  bg-gray-100 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all duration-300"
                  key={email.emailId}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 checked:bg-orange-600"
                      checked={isChecked(email.emailId)}
                      onChange={() => handleChecked(email.emailId)}
                    />
                    <div
                      className="flex items-center gap-5 cursor-pointer"
                      onClick={() => {
                        setSingleEmail(email);
                        setShowEmailDetail(true);
                      }}
                    >
                      <h3 className="capitalize w-[17rem]">
                        {(() => {
                          const fromHeader =
                            email.emailData.payload.headers.find(
                              (header) => header.name === "From"
                            )?.value || "No Sender";

                          const [name] = fromHeader.includes("<")
                            ? fromHeader.split(/(?=<)/)
                            : [fromHeader, ""];

                          const cleanedName = name.replace(/["<>]/g, "").trim();

                          return `${cleanedName}`;
                        })()}
                      </h3>

                      <p
                        className={`text-[16px] ${
                          email?.readStatus === "Unread"
                            ? "font-semibold text-black"
                            : "text-gray-600"
                        }`}
                      >
                        {email.subject || "No Subject"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[14px] font-medium">
                      {email?.formattedDate}
                    </span>

                    <span
                      className="rounded-full relative hover:bg-gray-200/70 cursor-pointer shadow-sm p-1"
                      onClick={() => {
                        setShow(!show);
                        setEmailId(email.emailId);
                      }}
                    >
                      <BsThreeDotsVertical className="h-5 w-5 text-black" />
                      {show && emailId === email.emailId && (
                        <div
                          ref={emailRef}
                          className="absolute top-4 right-[1.5rem] z-10 w-[12rem] py-2 px-2 rounded-md border bg-white flex flex-col gap-2"
                        >
                          <div
                            onClick={() => {
                              setShowModal(true);
                              setSingleEmail(email);
                            }}
                            className="flex items-center gap-2 hover:bg-gray-100 transition-all duration-300 cursor-pointer border py-2 px-2 rounded-md hover:shadow-md"
                          >
                            <FaUserPlus className="h-5 w-5 text-sky-600" />
                            <span className="text-black text-[14px]">
                              Assign User
                            </span>
                          </div>
                          {/*  */}
                          <div
                            onClick={() => deleteEmail(email.emailId)}
                            className="flex items-center gap-2 hover:bg-gray-100 transition-all duration-300 cursor-pointer border py-2 px-2 rounded-md hover:shadow-md"
                          >
                            <AiTwotoneDelete className="h-5 w-5 text-red-600" />
                            <span className="text-black text-[14px]">
                              Delete
                            </span>
                          </div>
                        </div>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-5">
          <button
            onClick={handlePreviousPage}
            disabled={startIndex === 0}
            className={`  px-4 py-2 rounded-md ${
              startIndex === 0
                ? "bg-gray-300 text-black"
                : "bg-orange-500 text-white"
            }`}
          >
            Previous
          </button>
          <span>
            Page {Math.floor(startIndex / pageSize) + 1} of{" "}
            {Math.ceil(filteredEmails.length / pageSize)}
          </span>
          <button
            onClick={handleNextPage}
            disabled={startIndex + pageSize >= filteredEmails.length}
            className={`  px-4 py-2 rounded-md ${
              startIndex + pageSize >= filteredEmails.length
                ? "bg-gray-300 text-black"
                : "bg-orange-500 text-white"
            }`}
          >
            <span>Next</span>
          </button>
        </div>

        {/* ----------------Email Details------------- */}
        {showEmailDetail && (
          <div className="absolute top-0 left-0 z-[999] w-full h-full py-1 bg-gray-700/70 flex items-center justify-center">
            <InboxDetail
              setShowEmailDetail={setShowEmailDetail}
              singleEmail={singleEmail}
              company={selectedCompany}
            />
          </div>
        )}

        {/* -------------Assign to User------------ */}
        {showModal && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-1 bg-gray-300/70 flex items-center justify-center">
            <AssignToUserModal
              setShowModal={setShowModal}
              singleEmail={singleEmail}
              setSingleEmail={setSingleEmail}
              selectedCompany={selectedCompany}
            />
          </div>
        )}
      </div>
    </>
  );
}
