import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import clsx from "clsx";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useSelector } from "react-redux";

import ChatWindow from "../chat/ChatWindow/ChatWindow";
import ChatWindowMobile from "../chat/ChatWindow/ChatWindowMobile"; // ← add this
import ChatList from "../chat/ChatList";
import Filters from "../shared/Filters";
import FiltersMobile from "../shared/FiltersMobile";
import SidebarMobile from "../shared/SidebarMobile";
import { useIsMobile } from "../hooks/useIsMobile";

export default function WhatsAppList({
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
  deleteConversation,
}) {
  const {
    auth: { user },
  } = useSelector((state) => state.auth);

  const { chatId: activeChatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const FiltersComponent = isMobile ? FiltersMobile : Filters;

  /* =========================
     Mobile Sidebar
  ========================= */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  const activeChat = conversations.find((c) => c._id === activeChatId);

  const setActiveChatId = (id) => {
    navigate({
      pathname: `/whatsapp/${id}`,
      search: location.search, // preserve filters
    });
  };

  const handleCloseChat = () => {
    navigate({
      pathname: "/whatsapp",
      search: location.search,
    });
  };

// ========== MOBILE: full-screen chat when a conversation is open ==========
if (isMobile && activeChatId) {
  return (
    // FIXED full viewport – ignores parent layout height & scroll
    <div className="fixed inset-0 z-50 flex flex-col bg-[#efeae2]">
      <ChatWindowMobile
        key={`wa-mobile-${activeChatId}`}
        users={users}
        chat={activeChat}
        team={team}
        updateConversation={updateConversation}
        onBack={handleCloseChat}
      />
    </div>
  );
}

  // ========== LIST VIEW (desktop always + mobile when no chat selected) ==========
  return (
    <div className="relative flex h-full min-w-0 flex-col bg-white">
      {/* =========================
          Mobile Sidebar (drawer)
      ========================= */}
      {isMobile && (
        <>
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-30 p-2 rounded-lg bg-white shadow-sm border border-slate-100"
            aria-label="Open menu"
          >
            <FiMenu className="size-5 text-slate-600" />
          </button>

          {/* Backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-20"
              onClick={closeSidebar}
            />
          )}

          {/* Drawer */}
          <div
            className={clsx(
              "fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <SidebarMobile onNavigate={closeSidebar} onClose={closeSidebar} />
          </div>
        </>
      )}

      <div className="flex-1 min-w-0 flex flex-col h-full">
        <FiltersComponent
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          users={users}
          team={team}
        />

        {/* Desktop: side-by-side | Mobile: full-width list only */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List */}
          <div
            className={clsx(
              "flex flex-col bg-white z-10",
              isMobile
                ? "w-full"
                : "w-[800px] flex-shrink-0 border-r border-gray-200 shadow-sm",
            )}
          >
            <ChatList
              conversations={conversations}
              pagination={pagination}
              loading={loading}
              filters={filters}
              setFilters={setFilters}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
              markAsRead={markAsRead}
              users={users}
              categories={categories}
              updateConversation={updateConversation}
              deleteConversation={deleteConversation}
            />
          </div>

          {/* Desktop only: Chat Window pane */}
          {!isMobile && (
            <div className="flex-1 min-w-0 flex flex-col bg-[#efeae2] relative">
              {/* WhatsApp Background Pattern */}
              <div className="absolute inset-0 opacity-40 bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/rI2_vA_kOOh.png')] bg-repeat z-0 pointer-events-none" />

              {activeChatId ? (
                <ChatWindow
                  key={`wa-${activeChatId}`}
                  users={users}
                  chat={activeChat}
                  team={team}
                  updateConversation={updateConversation}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center z-10">
                  <div className="bg-white/60 backdrop-blur-md px-6 py-4 rounded-full shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-medium">
                      Select a conversation to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}