import { useMemo } from "react";
import ChatRow from "./ChatRow";
import ChatRowMobile from "./ChatRowMobile";
import { useIsMobile } from "../hooks/useIsMobile"; // adjust path if needed

// Optional: nicer loading skeleton (same style as Gmail)
const ShimmerSkeleton = () => (
  <div className="relative overflow-hidden p-4 border-b border-gray-100 bg-white">
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />

      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-12" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-50 rounded w-2/3" />
      </div>
    </div>

    {/* Shimmer effect */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

export default function ChatList({
  conversations,
  pagination,
  loading,
  filters,
  setFilters,
  activeChatId,
  setActiveChatId,
  markAsRead,
  users,
  categories,
  updateConversation,
  deleteConversation,
  setComment, // kept in case you still need it later
}) {
  const isMobile = useIsMobile();
  const RowComponent = isMobile ? ChatRowMobile : ChatRow;

  const hasNextPage = useMemo(
    () => pagination.page < pagination.pages,
    [pagination],
  );
  const hasPrevPage = useMemo(() => pagination.page > 1, [pagination]);

  return (
    <div className="flex flex-col h-full font-inter">
      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading.fetching ? (
          // Better loading experience (optional – you can keep the simple text if you prefer)
          <div className="overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <ShimmerSkeleton key={i} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No conversations found.
          </div>
        ) : (
          conversations.map((chat, index) => (
            <RowComponent
              key={chat?._id}
              chat={chat}
              index={index}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
              markAsRead={markAsRead}
              users={users}
              categories={categories}
              updateConversation={updateConversation}
              deleteConversation={deleteConversation}
            />
          ))
        )}
      </div>

      {/* Pagination footer */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {pagination.total || 0} conversations
            {" • "}
            Page {pagination.page || 1} of {pagination.pages || 1}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!hasPrevPage}
              onClick={() =>
                setFilters({
                  page: pagination.page - 1,
                })
              }
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Prev
            </button>

            <button
              disabled={!hasNextPage}
              onClick={() =>
                setFilters({
                  page: pagination.page + 1,
                })
              }
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}