import { IoMdSearch, IoMdOptions } from "react-icons/io";
import { format } from "date-fns";
import { ConversationTime } from "../shared/ui/ConversationTime";
import ChatRow from "./ChatRow";

export default function ChatList({ conversations, loading, filters, setFilters, activeChatId, setActiveChatId, users, categories, updateConversation, deleteConversation }) {

  console.log("Rendering ChatList with conversations:", conversations);


  return (
    <div className="flex flex-col h-full font-inter">
      {/* Header */}
      {/* <div className="px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
        <button className="text-gray-500 hover:text-orange-500 transition-colors">
          <IoMdOptions size={22} />
        </button>
      </div> */}

      {/* Search Bar */}
      {/* <div className="p-3 bg-white border-b border-gray-100">
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
      </div> */}

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading.fetching ? (
          <div className="p-4 text-center text-gray-400 text-sm animate-pulse">Loading chats...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">No conversations found.</div>
        ) : (
          conversations.map((chat, index) => (
            <ChatRow 
              key={chat?._id}
              chat={chat} 
              index={index}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
              users={users}
              categories={categories}
              updateConversation={updateConversation}
              deleteConversation={deleteConversation}
            />
          ))
        )}
      </div>
    </div>
  );
}