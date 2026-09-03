import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  IoClose,
  IoMailOutline,
  IoMailOpenOutline,
} from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";

import Thread from "../../gmail/thread/Thread";
import ChatWindow from "../../whatsapp/chat/ChatWindow/ChatWindow"; // adjust to real path/props
import { useGetInboxUsersQuery } from "../../../redux/api/inboxUserApi";

const API_URL = process.env.REACT_APP_API_URL;
const MAILBOX_URL = `${API_URL}/api/v1/gmail/get-mailbox`;
const CHATS_URL = `${API_URL}/api/v1/whatsapp/conversations`; // swap for your real endpoint

/**
 * type: "ticket" | "lead"
 * id: the ticket/lead _id
 */
const RelatedConversationsSidebar = ({
  open,
  onClose,
  type = "ticket",
  id,
  companyName,
}) => {
  const [emailThreads, setEmailThreads] = useState([]);
  const [whatsappChats, setWhatsappChats] = useState([]);
  const [selected, setSelected] = useState(null); // { channel: "email"|"whatsapp", data }
  const [loading, setLoading] = useState(false);

  const filterKey = type === "lead" ? "leadId" : "ticketId";

    
    const {
    data: inboxUsers = [],
    isLoading: usersLoading,
    isFetching: usersFetching,
    error: usersError,
  } = useGetInboxUsersQuery();
  
  
console.log("THE CHATS ARE ", whatsappChats)

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const [emailRes, chatRes] = await Promise.all([
        axios.get(MAILBOX_URL, {
          params: { [filterKey]: id, ...(companyName ? { companyName } : {}) },
        }),
        axios.get(CHATS_URL, {
          params: { [filterKey]: id, ...(companyName ? { companyName } : {}) },
        }).catch((err) => {
          console.error("Failed to fetch WhatsApp chats:", err);
          return { data: { chats: [] } };
        }),
      ]);

      const threads = emailRes?.data?.threads || [];
      const chats = chatRes?.data?.conversations || [];

      setEmailThreads(threads);
      setWhatsappChats(chats);

      setSelected((prev) => {
        if (prev) {
          const stillThere =
            prev.channel === "email"
              ? threads.find((t) => t._id === prev.data._id)
              : chats.find((c) => c._id === prev.data._id);
          if (stillThere) return { channel: prev.channel, data: stillThere };
        }
        if (threads[0]) return { channel: "email", data: threads[0] };
        if (chats[0]) return { channel: "whatsapp", data: chats[0] };
        return null;
      });
    } catch (error) {
      console.error("Failed to fetch related conversations:", error);
      setEmailThreads([]);
      setWhatsappChats([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && id) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id]);


  const handleOnClose = () => {
    setEmailThreads([]);
      setWhatsappChats([]);
      setSelected(null);

    onClose();
  }
 

  const totalCount = emailThreads.length + whatsappChats.length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleOnClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: "90%", md: "80%", lg: "75%", xl: "70%" }, maxWidth: "1500px" },
      }}
    >
      <div className="h-full flex flex-col bg-gray-100">
        {/* Header */}
        <div className="h-[58px] shrink-0 bg-white border-b px-5 flex items-center justify-between">
          <div className="min-w-0 flex items-center gap-2">
            <IoMailOutline className="text-orange-500 text-xl" />
            <h2 className="font-semibold text-gray-800 truncate">
              {type === "lead" ? "Lead" : "Ticket"} Conversations
            </h2>
            {totalCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                {totalCount}
              </span>
            )}
          </div>
          <IconButton onClick={onClose}>
            <IoClose />
          </IconButton>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex">
          {/* Combined list */}
          <div className="w-[280px] shrink-0 bg-white border-r flex flex-col overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <CircularProgress size={25} />
              </div>
            ) : (
              <>
                {/* Emails */}
                <div className="px-4 py-3 border-b">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Emails
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {emailThreads.length} email{emailThreads.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {emailThreads.length === 0 ? (
                  <div className="px-4 py-4 text-xs text-gray-400">No linked emails.</div>
                ) : (
                  emailThreads.map((thread) => {
                    console.log(" THE THREAD IS ", thread)
                    const isSelected = selected?.channel === "email" && selected.data._id === thread._id;
                    const isUnread = Number(thread.unreadComments || 0) > 0 || thread.status === "Unread";

                    return (
                      <button
                        key={thread._id}
                        type="button"
                        onClick={() => setSelected({ channel: "email", data: thread })}
                        className={`w-full text-left px-4 py-3 border-b transition-colors ${
                          isSelected
                            ? "bg-orange-50 border-l-4 border-l-orange-500"
                            : "hover:bg-gray-50 border-l-4 border-l-transparent"
                        }`}
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
                            <div className={`text-sm truncate ${isUnread ? "font-semibold text-gray-800" : "font-medium text-gray-700"}`}>
                              {thread.subject || "(No subject)"}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {thread.companyName && (
                                <span className="text-[10px] text-gray-400">{thread.companyName}</span>
                              )}
                              {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}

                {/* WhatsApp — same structure, below the email list */}
                <div className="px-4 py-3 border-b border-t mt-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    WhatsApp
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {whatsappChats.length} chat{whatsappChats.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {whatsappChats.length === 0 ? (
                  <div className="px-4 py-4 text-xs text-gray-400">No linked WhatsApp chats.</div>
                ) : (
                  whatsappChats.map((chat) => {
                    const isSelected = selected?.channel === "whatsapp" && selected.data._id === chat._id;
                    const isUnread = Number(chat.unreadCount || 0) > 0;

                    return (
                      <button
                        key={chat._id}
                        type="button"
                        onClick={() => setSelected({ channel: "whatsapp", data: chat })}
                        className={`w-full text-left px-4 py-3 border-b transition-colors ${
                          isSelected
                            ? "bg-green-50 border-l-4 border-l-green-500"
                            : "hover:bg-gray-50 border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="pt-0.5">
                            <FaWhatsapp className={isUnread ? "text-green-500" : "text-gray-400"} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm truncate ${isUnread ? "font-semibold text-gray-800" : "font-medium text-gray-700"}`}>
                              {chat.profileName || chat.phone || "(Unknown contact)"}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {chat.lastMessage && (
                                <span className="text-[10px] text-gray-400 truncate">
                                  {chat.lastMessage}
                                </span>
                              )}
                              {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </>
            )}
          </div>

          {/* Detail pane */}
          <div className="flex-1 min-w-0 min-h-0 p-0">
            {!selected ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Select a conversation
              </div>
            ) : selected.channel === "email" ? (
              <div className="h-full bg-white rounded-lg border shadow-sm overflow-hidden">
                <Thread
                   key={`${selected.data.companyName || ""}-${selected.data.threadId || selected.data._id}`}
                  variant="compact"
                  companyName={selected.data.companyName}
                  threadId={selected.data.threadId}


                  users={inboxUsers}


                   
                   
                />
              </div>
            ) : (
              <div className="h-full bg-white rounded-lg border shadow-sm overflow-hidden">
                 
                <ChatWindow
                  key={selected.data._id}
                   chat={selected.data}
                  users={inboxUsers}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default RelatedConversationsSidebar;