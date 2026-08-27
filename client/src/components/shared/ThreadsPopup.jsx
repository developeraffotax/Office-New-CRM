import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
 
import ActivityLogDrawer from "../Modals/ActivityLogDrawer";
import DetailComments from "../../pages/Tasks/TaskDetailComments";
import Loader from "../../utlis/Loader";
import Thread from "../gmail/thread/Thread";

const API_URL = `${process.env.REACT_APP_API_URL}`;
const MAILBOX_URL = `${API_URL}/api/v1/gmail/get-mailbox`; // point at your getMailbox route

/**
 * Generic popup for the email thread(s) linked to a Ticket or a Lead.
 * type: "ticket" | "lead"   id: the ticket/lead _id
 */
const ThreadsPopup = ({ type, id, subject, companyName, users = [], categories = [], handleClose }) => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(false);

  const filterKey = type === "lead" ? "leadId" : "ticketId";

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(MAILBOX_URL, {
        params: { [filterKey]: id, ...(companyName ? { companyName } : {}) },
      });
      const list = data?.threads || [];
      setThreads(list);
      setSelectedThread((prev) => prev || list[0] || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && handleClose?.();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // These three hit generic thread endpoints (not Inbox-page state) and just
  // patch local `threads`/`selectedThread` — swap in your real Inbox routes.
  const markAsRead = async (threadId, company) => {
    try {
      await axios.put(`${API_URL}/api/v1/gmail/thread/mark-read`, { threadId, company });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteThread = async (threadId, company) => {
    try {
      await axios.delete(`${API_URL}/api/v1/gmail/thread/${threadId}/${company}`);
      await fetchThreads();
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateThread = async (mongoThreadId, payload) => {
    try {
      await axios.put(`${API_URL}/api/v1/gmail/thread/${mongoThreadId}`, payload);
      setThreads((prev) => prev.map((t) => (t._id === mongoThreadId ? { ...t, ...payload } : t)));
      setSelectedThread((prev) => (prev?._id === mongoThreadId ? { ...prev, ...payload } : prev));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[499] flex items-center justify-center bg-black/30 backdrop-blur-sm h-full">
      <div className="h-[95%] bg-gray-100 rounded-xl shadow-lg w-[95%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[70%] 3xl:w-[60%] py-4 px-5">
        <div className="h-full w-full flex flex-col justify-start items-center relative">
          <div className="flex items-center justify-between border-b pb-2 mb-3 self-start w-full">
            <h3 className="text-lg font-semibold">
              {type === "lead" ? "Lead" : "Ticket"}: {subject || "Loading..."}
            </h3>
            <button
              className="p-1 rounded-2xl bg-gray-50 border hover:shadow-md hover:bg-gray-100"
              onClick={handleClose}
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center w-full"><Loader /></div>
          ) : threads.length === 0 ? (
            <div className="text-gray-500 text-sm">No email threads linked yet.</div>
          ) : (
            <div className="w-full h-full flex justify-center items-stretch gap-8 px-8 py-4 overflow-hidden">
              <div className="w-1/2 h-full flex flex-col gap-3">
                {threads.length > 1 && (
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border-b pb-2 mb-2">
                    {threads.map((t) => (
                      <button
                        key={t._id}
                        onClick={() => setSelectedThread(t)}
                        className={`text-left text-sm px-2 py-1 rounded ${
                          selectedThread?._id === t._id
                            ? "bg-orange-100 text-orange-700 font-medium"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        {t.subject || "(no subject)"}
                      </button>
                    ))}
                  </div>
                )}

                {selectedThread && (
                  <Thread
                    company={selectedThread.companyName}
                    threadId={selectedThread.threadId}
                    mongoThreadId={selectedThread._id}
                    subject={selectedThread.subject}
                    status={selectedThread.status}
                    category={selectedThread.category}
                    users={users}
                    categories={categories}
                    userId={selectedThread.userId}
                    unreadComments={selectedThread.unreadComments || 0}
                    show={true}
                    setEmailDetail={() => {}}
                    markAsRead={markAsRead}
                    deleteThread={deleteThread}
                    handleUpdateThread={handleUpdateThread}
                    setComment={() =>
                      // Ticket/Lead-scoped: comments roll up to the entity,
                      // never to the raw thread, per the rule we set earlier.
                      document.dispatchEvent(new CustomEvent("noop"))
                    }
                  />
                )}
              </div>

              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadsPopup;