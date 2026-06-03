import { IoMdSearch, IoMdOptions } from "react-icons/io";
import { format } from "date-fns";
import { ConversationTime } from "../shared/ui/ConversationTime";

export default function ChatList({ conversations, loading, filters, setFilters, activeChatId, setActiveChatId }) {

  console.log("Rendering ChatList with conversations:", conversations);


  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
        <button className="text-gray-500 hover:text-orange-500 transition-colors">
          <IoMdOptions size={22} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white border-b border-gray-100">
        <div className="relative flex items-center w-full h-10 rounded-lg bg-gray-100 px-3 focus-within:ring-2 focus-within:ring-orange-500/50 transition-all">
          <IoMdSearch className="text-gray-400 mr-2" size={20} />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full bg-transparent text-sm outline-none placeholder-gray-500"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading.fetching ? (
          <div className="p-4 text-center text-gray-400 text-sm animate-pulse">Loading chats...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">No conversations found.</div>
        ) : (
          conversations.map((chat, index) => (
            <div
              key={chat?._id}
              onClick={() => setActiveChatId(chat?._id)}
              className={`flex items-center px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
                activeChatId === chat?._id ? "bg-orange-50/60" : "hover:bg-gray-50"
              }`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0 shadow-sm border border-orange-200">
                {chat?.profileName?.charAt(0).toUpperCase() ||  "#"}
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="text-[15px] font-medium text-gray-900 truncate">
                    {chat?.profileName || chat?.phone || "Unknown Contact"}
                  </h3>
                  <ConversationTime lastMessageAt={chat?.lastMessageAt} index={index} />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 truncate pr-2">
                    {chat?.lastMessage || "No messages yet"}
                  </p>
                  {chat?.unreadCount > 0 && (
                    <span className="bg-orange-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
                      {chat?.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}