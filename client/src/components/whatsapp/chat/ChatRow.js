import { PiBell } from "react-icons/pi";
import AssignCategory from "../shared/ui/AssignCategory";
import AssignUser from "../shared/ui/AssignUser";
import { ConversationTime } from "../shared/ui/ConversationTime";
import { MdDeleteOutline } from "react-icons/md";
import { FaCheckCircle, FaRegStar, FaStar, FaUndoAlt } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function ChatRow({
  chat,
  index,
  activeChatId,
  setActiveChatId,
  users,
  categories,
  updateConversation,
  deleteConversation
}) {


  const { auth } = useSelector((state) => state.auth);
const currentUserId = auth?.user?.id;

  console.log("Rendering ChatRow for chat:❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️", chat);

 const userReadEntry = chat?.readBy?.find(
  (r) =>
    (r?.userId?._id || r?.userId)?.toString() ===
    currentUserId?.toString()
);


const unreadCount = Math.max(
  0,
  (chat?.totalInboundMessages || 0) -
    (userReadEntry?.readInboundCount || 0)
);
  return (
    <div
      key={chat?._id}
      
      className={`flex items-center px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
        activeChatId === chat?._id ? "bg-orange-50/60" : "hover:bg-gray-50"
      }`}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0 shadow-sm border border-orange-200">
        {chat?.profileName?.charAt(0).toUpperCase() || "#"}
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-3  mb-1">
          <h3 className="text-[15px] font-medium text-gray-900 truncate">
            {chat?.profileName || chat?.phone || "Unknown Contact"}
          </h3>

          <div className="flex items-center gap-2 ">
            <button
              className={`rounded-md transition-colors ${
                chat?.isStarred
                  ? "text-yellow-500 hover:text-yellow-600"
                  : "text-gray-500 hover:text-yellow-500"
              }`}
              title={chat?.isStarred ? "Unstar Chat" : "Star Chat"}
              onClick={(e) => {
                

                updateConversation(chat?._id, {
                  isStarred: !chat?.isStarred,
                });
              }}
            >
              {chat?.isStarred ? (
                <FaStar className="size-4" />
              ) : (
                <FaRegStar className="size-4" />
              )}
            </button>


            <button
              className="rounded-md   text-gray-500  hover:text-orange-500"
              title="Set Reminder"
            >
              <PiBell className="size-5  font-semibold " />
            </button>

            <button
              className="rounded-md  text-gray-500  hover:text-red-500"
              title="Delete Chat"
              onClick={(e) => {
                // deleteThread(thread?.threadId, thread?.companyName);
                setActiveChatId(null)
                deleteConversation(chat?._id, chat?.companyName);
              }}
            >
              <MdDeleteOutline className="size-5   " />
            </button>

            {chat?.status === "progress" ? (
              <button
                className="rounded-md   text-gray-500  hover:text-green-500"
                title="Complete Chat"
                onClick={(e) => {
                  // updateStatus("completed");
                  updateConversation(chat?._id, { status: "completed" });
                }}
              >
                <FaCheckCircle className="size-4   " />
              </button>
            ) : (
              <button
                className=" rounded-md   text-gray-500  hover:text-red-500"
                title="Undo Complete"
                onClick={(e) => {
                  // updateStatus("progress");
                    updateConversation(chat?._id, { status: "progress" });
                }}
              >
                <FaUndoAlt className="size-4   " />
              </button>
            )}

            <AssignCategory
              categories={categories}
              conversationId={chat._id}
              currentCategory={chat?.category}
              updateConversation={updateConversation}
            />

            <AssignUser
              users={users}
              conversationId={chat?._id}
              currentUserId={chat?.userId}
              updateConversation={updateConversation}
            />

            <ConversationTime
              lastMessageAt={chat?.lastMessageAt}
              index={index}
            />
          </div>
        </div>
        <div className="flex justify-between items-center" onClick={() => setActiveChatId(chat?._id)}>
          <p className="text-sm text-gray-500 truncate pr-2">
            {chat?.lastMessage || "No messages yet"}
          </p>
          {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
                {unreadCount}
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
