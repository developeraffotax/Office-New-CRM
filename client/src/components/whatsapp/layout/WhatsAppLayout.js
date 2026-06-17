import { useState } from "react";
 
import ChatWindow from "../chat/ChatWindow";
import ChatList from "../chat/ChatList";
import Sidebar from "../shared/Sidebar";
import Filters from "../shared/Filters";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
 

export default function WhatsAppLayout({
  team,
  users,
  categories,
  conversations,
  pagination,
  loading,
  filters,
  setFilters,
  updateConversation,
  markAsRead,
  deleteConversation
}) {


  const { chatId: activeChatId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const activeChat = conversations.find(
    (c) => c._id === activeChatId
  );

  const setActiveChatId = (id) => {
    navigate({
      pathname: `/whatsapp/${id}`,
      search: location.search, // preserve filters
    });
  };

  return (
    <div className="flex h-[105vh] bg-[#f0f2f5] overflow-hidden text-gray-800 font-sans">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">

          <Filters filters={filters} setFilters={setFilters} categories={categories} users={users} team={team} />

              {/* Left Pane: Conversation List */}
      <div className="flex-1 flex overflow-hidden">


        <div className="w-[800px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col z-10 shadow-sm">
        <ChatList 
          conversations={conversations}
          pagination={pagination}
          loading={loading}
          filters={filters}
          setFilters={setFilters}
          activeChatId={activeChatId}
          setActiveChatId={(id) => {
            setActiveChatId(id);
            
          }}
          markAsRead={markAsRead}

          users={users}
          categories={categories}
          updateConversation={updateConversation}
          deleteConversation={deleteConversation}



          
        />
      </div>

      {/* Right Pane: Active Chat Window */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#efeae2] relative">
        {/* WhatsApp Background Pattern */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/rI2_vA_kOOh.png')] bg-repeat z-0 pointer-events-none"></div>
        
        {activeChatId ? (
          <ChatWindow 
            users={users}
            chat={activeChat} 
            team={team}
            updateConversation={updateConversation}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center z-10">
            <div className="bg-white/60 backdrop-blur-md px-6 py-4 rounded-full shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>



      </div>




      </div>

    </div>
  );
}