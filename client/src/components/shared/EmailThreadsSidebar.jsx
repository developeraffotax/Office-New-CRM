import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  IoClose,
  IoMailOutline,
  IoMailOpenOutline,
} from "react-icons/io5";

import Thread from "../gmail/thread/Thread";

const API_URL = process.env.REACT_APP_API_URL;
const MAILBOX_URL = `${API_URL}/api/v1/gmail/get-mailbox`;

const EmailThreadsSidebar = ({
  open,
  onClose,
  ticketId,
  companyName,
}) => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchThreads = async () => {
    if (!ticketId) return;

    setLoading(true);

    try {
      const { data } = await axios.get(MAILBOX_URL, {
        params: {
          ticketId,
          ...(companyName ? { companyName } : {}),
        },
      });

      const list = data?.threads || [];

      setThreads(list);
      setSelectedThread((prev) => {
        if (prev && list.some((t) => t._id === prev._id)) {
          return list.find((t) => t._id === prev._id);
        }

        return list[0] || null;
      });
    } catch (error) {
      console.error("Failed to fetch ticket threads:", error);
      setThreads([]);
      setSelectedThread(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && ticketId) {
      fetchThreads();
    }
  }, [open, ticketId]);

  const markAsRead = async (threadId, company) => {
    try {
      await axios.put(
        `${API_URL}/api/v1/gmail/thread/mark-read`,
        {
          threadId,
          company,
        }
      );

      setThreads((prev) =>
        prev.map((thread) =>
          thread.threadId === threadId
            ? { ...thread, unreadComments: 0 }
            : thread
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const deleteThread = async (threadId, company) => {
    try {
      await axios.delete(
        `${API_URL}/api/v1/gmail/thread/${threadId}/${company}`
      );

      await fetchThreads();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateThread = async (mongoThreadId, payload) => {
    try {
      await axios.put(
        `${API_URL}/api/v1/gmail/thread/${mongoThreadId}`,
        payload
      );

      setThreads((prev) =>
        prev.map((thread) =>
          thread._id === mongoThreadId
            ? { ...thread, ...payload }
            : thread
        )
      );

      setSelectedThread((prev) =>
        prev?._id === mongoThreadId
          ? { ...prev, ...payload }
          : prev
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: {
            xs: "100%",
            sm: "90%",
            md: "80%",
            lg: "75%",
            xl: "70%",
          },
          maxWidth: "1500px",
        },
      }}
    >
      <div className="h-full flex flex-col bg-gray-100">
        {/* Header */}
        <div className="h-[58px] shrink-0 bg-white border-b px-5 flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <IoMailOutline className="text-orange-500 text-xl" />

              <h2 className="font-semibold text-gray-800 truncate">
                Ticket Emails
              </h2>

              {threads.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                  {threads.length}
                </span>
              )}
            </div>


          </div>

          <IconButton onClick={onClose}>
            <IoClose />
          </IconButton>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex">
          {/* Thread list */}
          <div className="w-[280px] shrink-0 bg-white border-r flex flex-col">
            <div className="px-4 py-3 border-b">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Conversations
              </div>

              <div className="text-xs text-gray-400 mt-1">
                {threads.length} email
                {threads.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <CircularProgress size={25} />
                </div>
              ) : threads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                  <IoMailOutline className="text-4xl text-gray-300 mb-2" />

                  <p className="text-sm text-gray-500">
                    No email threads linked to this ticket.
                  </p>
                </div>
              ) : (
                threads.map((thread) => {
                  const isSelected =
                    selectedThread?._id === thread._id;

                  const isUnread =
                    Number(thread.unreadComments || 0) > 0 ||
                    thread.status === "Unread";

                  return (
                    <button
                      key={thread._id}
                      type="button"
                      onClick={() => setSelectedThread(thread)}
                      className={`
                        w-full text-left px-4 py-3 border-b
                        transition-colors
                        ${
                          isSelected
                            ? "bg-orange-50 border-l-4 border-l-orange-500"
                            : "hover:bg-gray-50 border-l-4 border-l-transparent"
                        }
                      `}
                    >
                      <div className="flex items-start gap-2">
                        <div className="pt-0.5">
                          {isUnread ? (
                            <IoMailOutline className="text-orange-500" />
                          ) : (
                            <IoMailOpenOutline className="text-gray-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-sm truncate ${
                              isUnread
                                ? "font-semibold text-gray-800"
                                : "font-medium text-gray-700"
                            }`}
                          >
                            {thread.subject || "(No subject)"}
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            {thread.companyName && (
                              <span className="text-[10px] text-gray-400">
                                {thread.companyName}
                              </span>
                            )}

                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex-1 min-w-0 min-h-0 p-4">
            {selectedThread ? (
              <div className="h-full bg-white rounded-lg border shadow-sm overflow-hidden">
                <Thread
                  company={selectedThread.companyName}
                  threadId={selectedThread.threadId}
                  mongoThreadId={selectedThread._id}
                  subject={selectedThread.subject}
                  status={selectedThread.status}
                  category={selectedThread.category}
                  users={[]}
                  categories={[]}
                  userId={selectedThread.userId}
                  unreadComments={selectedThread.unreadComments || 0}
                  show={true}
                  setEmailDetail={() => {}}
                  markAsRead={markAsRead}
                  deleteThread={deleteThread}
                  handleUpdateThread={handleUpdateThread}
                  setComment={() => {}}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Select an email conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default EmailThreadsSidebar;