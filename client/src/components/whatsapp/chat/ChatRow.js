

import { PiBell } from "react-icons/pi";
import AssignCategory from "../shared/ui/AssignCategory";
import AssignUser from "../shared/ui/AssignUser";
import { ConversationTime } from "../shared/ui/ConversationTime";
import { MdDeleteOutline } from "react-icons/md";
import { FaCheckCircle, FaRegStar, FaStar, FaUndoAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { hasSubrole } from "../../../utlis/checkPermission";
import { FiMessageSquare } from "react-icons/fi";
import IconButtonWithBadge from "../shared/ui/IconButtonWithBadge";
 

export default function ChatRow({
  chat,
  index,
  activeChatId,
  setActiveChatId,
  markAsRead,
  users,
  categories,
  updateConversation,
  deleteConversation,
  setComment,

}) {
  const { auth } = useSelector((state) => state.auth);
  const user = auth?.user;
  const currentUserId = auth?.user?.id;

  const userReadEntry = chat?.readBy?.find(
    (r) =>
      (r?.userId?._id || r?.userId)?.toString() === currentUserId?.toString(),
  );

  const unreadCount = Math.max(
    0,
    (chat?.totalInboundMessages || 0) - (userReadEntry?.readInboundCount || 0),
  );

  const isLastFromMe = chat?.lastMessageBy === "me";



  const scope = useMemo(() => {

    const hasEditAccess =  hasSubrole(user, "Whatsapp", "Edit") || false;
    const hasDeleteAccess =  hasSubrole(user, "Whatsapp", "Delete") || false;

    return {edit: hasEditAccess, delete: hasDeleteAccess}
  }, [user])
  
 

  return (
    <div
      key={chat?._id}
      className={`group flex items-center px-4 py-3 cursor-pointer border-b border-gray-100 transition-all duration-150 ${
        activeChatId === chat?._id
          ? "bg-orange-50 border-l-2 border-l-orange-500"
          : "hover:bg-gray-50 border-l-2 border-l-transparent"
      }`}
      onClick={() => {                          // ← moved here
        setActiveChatId(chat?._id);
        if (unreadCount > 0) {
          markAsRead(chat?._id);
        }
      }}
    >
      {/* Avatar */}
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-base flex-shrink-0 border ${
          chat?.status === "completed"
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-orange-50 text-orange-500 border-orange-200"
        }`}
      >
        {chat?.profileName?.charAt(0).toUpperCase() || "#"}
      </div>

      <div className="ml-3 flex-1 min-w-0">
        {/* Top row: name + meta */}
        <div className="flex justify-between items-center gap-2 mb-1">
          <h3
            title={`Name: ${chat?.profileName} | Phone: ${chat?.phone}`}
            className={`text-[13.5px] font-medium truncate ${
              chat?.status === "completed" ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {chat?.profileName || chat?.phone || "Unknown Contact"}
          </h3>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Actions: hidden until hover */}
             <div className="flex items-center gap-0.5 opacity-100 group-hover:opacity-100 transition-opacity duration-150">
  
  {/* View Comments Action */}
  <IconButtonWithBadge
    icon={FiMessageSquare}
    unreadCount={chat?.unreadComments || 0}
    title="View Comments"
    className="w-6 h-6 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
    iconClassName="size-3.5"
    onClick={(e) => {
      e.stopPropagation();
      setComment({
        show: true,
        conversationId: chat._id,
      });
    }}
  />

  {/* Star / Unstar Action */}
  {scope.edit && (
    <IconButtonWithBadge
      icon={chat?.isStarred ? FaStar : FaRegStar}
      title={chat?.isStarred ? "Unstar" : "Star"}
      className={`w-6 h-6 ${
        chat?.isStarred
          ? "text-amber-400 hover:text-amber-500"
          : "text-gray-400 hover:text-amber-400"
      }`}
      iconClassName="size-3.5"
      onClick={(e) => {
        e.stopPropagation();
        updateConversation(chat?._id, { isStarred: !chat?.isStarred });
      }}
    />
  )}

  {/* Set Reminder Action */}
  <IconButtonWithBadge
    icon={PiBell}
    title="Set Reminder"
    className="w-6 h-6 text-gray-400 hover:text-orange-500"
    iconClassName="size-4"
    onClick={(e) => e.stopPropagation()}
  />

  {/* Complete / Undo Complete Action */}
  {scope.edit && (
    chat?.status === "progress" ? (
      <IconButtonWithBadge
        icon={FaCheckCircle}
        title="Complete"
        className="w-6 h-6 text-gray-400 hover:text-green-500"
        iconClassName="size-3.5"
        onClick={(e) => {
          e.stopPropagation();
          updateConversation(chat?._id, { status: "completed" });
        }}
      />
    ) : (
      <IconButtonWithBadge
        icon={FaUndoAlt}
        title="Undo Complete"
        className="w-6 h-6 text-green-500 hover:text-gray-400"
        iconClassName="size-3.5"
        onClick={(e) => {
          e.stopPropagation();
          updateConversation(chat?._id, { status: "progress" });
        }}
      />
    )
  )}

  {/* Delete Action */}
  {scope.delete && (
    <IconButtonWithBadge
      icon={MdDeleteOutline}
      title="Delete"
      className="w-6 h-6 text-gray-400 hover:text-red-500"
      iconClassName="size-4"
      onClick={(e) => {
        e.stopPropagation();
        setActiveChatId(null);
        deleteConversation(chat?._id, chat?.companyName);
      }}
    />
  )}

</div>

            {/* Always visible: category, user, time — stop propagation so
                their own dropdowns/pickers don't also open the chat */}
            {scope.edit && <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}   // ← added
            >
              <AssignCategory
                categories={categories}
                conversationId={chat._id}
                currentCategory={chat?.category}
                updateConversation={updateConversation}
                buttonStyle="w-[100px]"
              />
              <AssignUser
                users={users}
                conversationId={chat?._id}
                currentUserId={chat?.userId}
                updateConversation={updateConversation}
                buttonStyle="w-[100px]"
              />
              <ConversationTime lastMessageAt={chat?.lastMessageAt} index={index} />
            </div>}
          </div>
        </div>

        {/* Bottom row: sender badge + preview + unread count */}
        <div className="flex items-center gap-1.5">   {/* ← onClick removed */}
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
              isLastFromMe
                ? "bg-orange-50 text-orange-600 border border-orange-200"
                : "bg-blue-50 text-blue-600 border border-blue-200"
            }`}
          >
            {isLastFromMe ? "A" : "C"}
          </span>

          <p className="text-[12.5px] text-gray-500 truncate flex-1">
            {chat?.lastMessage || "No messages yet"}
          </p>

          {unreadCount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}























































































































































// import { PiBell } from "react-icons/pi";
// import AssignCategory from "../shared/ui/AssignCategory";
// import AssignUser from "../shared/ui/AssignUser";
// import { ConversationTime } from "../shared/ui/ConversationTime";
// import { MdDeleteOutline } from "react-icons/md";
// import { FaCheckCircle, FaRegStar, FaStar, FaUndoAlt } from "react-icons/fa";
// import { useSelector } from "react-redux";

// export default function ChatRow({
//   chat,
//   index,
//   activeChatId,
//   setActiveChatId,
//   markAsRead,
//   users,
//   categories,
//   updateConversation,
//   deleteConversation,
// }) {
//   const { auth } = useSelector((state) => state.auth);
//   const currentUserId = auth?.user?.id;

//   const userReadEntry = chat?.readBy?.find(
//     (r) =>
//       (r?.userId?._id || r?.userId)?.toString() === currentUserId?.toString(),
//   );

//   const unreadCount = Math.max(
//     0,
//     (chat?.totalInboundMessages || 0) - (userReadEntry?.readInboundCount || 0),
//   );

//   const isLastFromMe = chat?.lastMessageBy === "me";

//   return (
//     <div
//       key={chat?._id}
//       className={`group flex items-center px-4 py-3 cursor-pointer border-b border-gray-100 transition-all duration-150 ${
//         activeChatId === chat?._id
//           ? "bg-orange-50 border-l-2 border-l-orange-500"
//           : "hover:bg-gray-50 border-l-2 border-l-transparent"
//       }`}
//     >
//       {/* Avatar */}
//       <div
//         className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-base flex-shrink-0 border ${
//           chat?.status === "completed"
//             ? "bg-green-50 text-green-600 border-green-200"
//             : "bg-orange-50 text-orange-500 border-orange-200"
//         }`}
//       >
//         {chat?.profileName?.charAt(0).toUpperCase() || "#"}
//       </div>

//       <div className="ml-3 flex-1 min-w-0">
//         {/* Top row: name + meta */}
//         <div className="flex justify-between items-center gap-2 mb-1">
//           <h3
//             title={`Name: ${chat?.profileName} | Phone: ${chat?.phone}`}
//             className={`text-[13.5px] font-medium truncate ${
//               chat?.status === "completed" ? "text-gray-400" : "text-gray-900"
//             }`}
//           >
//             {chat?.profileName || chat?.phone || "Unknown Contact"}
//           </h3>

//           <div className="flex items-center gap-1.5 flex-shrink-0">
//             {/* Actions: hidden until hover */}
//             <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
//               <button
//                 className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
//                   chat?.isStarred
//                     ? "text-amber-400 hover:text-amber-500"
//                     : "text-gray-400 hover:text-amber-400"
//                 }`}
//                 title={chat?.isStarred ? "Unstar" : "Star"}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   updateConversation(chat?._id, { isStarred: !chat?.isStarred });
//                 }}
//               >
//                 {chat?.isStarred ? (
//                   <FaStar className="size-3.5" />
//                 ) : (
//                   <FaRegStar className="size-3.5" />
//                 )}
//               </button>

//               <button
//                 className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors"
//                 title="Set Reminder"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <PiBell className="size-4" />
//               </button>

//               {chat?.status === "progress" ? (
//                 <button
//                   className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-green-500 transition-colors"
//                   title="Complete"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     updateConversation(chat?._id, { status: "completed" });
//                   }}
//                 >
//                   <FaCheckCircle className="size-3.5" />
//                 </button>
//               ) : (
//                 <button
//                   className="w-6 h-6 rounded flex items-center justify-center text-green-500 hover:text-gray-400 transition-colors"
//                   title="Undo Complete"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     updateConversation(chat?._id, { status: "progress" });
//                   }}
//                 >
//                   <FaUndoAlt className="size-3.5" />
//                 </button>
//               )}

//               <button
//                 className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
//                 title="Delete"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setActiveChatId(null);
//                   deleteConversation(chat?._id, chat?.companyName);
//                 }}
//               >
//                 <MdDeleteOutline className="size-4" />
//               </button>
//             </div>

//             {/* Always visible: category, user, time */}
//             <AssignCategory
//               categories={categories}
//               conversationId={chat._id}
//               currentCategory={chat?.category}
//               updateConversation={updateConversation}
//             />
//             <AssignUser
//               users={users}
//               conversationId={chat?._id}
//               currentUserId={chat?.userId}
//               updateConversation={updateConversation}
//             />
//             <ConversationTime lastMessageAt={chat?.lastMessageAt} index={index} />
//           </div>
//         </div>

//         {/* Bottom row: sender badge + preview + unread count */}
//         <div
//           className="flex items-center gap-1.5"
//           onClick={() => {
//             setActiveChatId(chat?._id);
//             if(unreadCount > 0) {
//               markAsRead(chat?._id)
//             }
//           }}
//         >
//           {/* isLastFromMe indicator — contextually placed next to preview */}
//           <span
//             className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
//               isLastFromMe
//                 ? "bg-orange-50 text-orange-600 border border-orange-200"
//                 : "bg-blue-50 text-blue-600 border border-blue-200"
//             }`}
//           >
//             {isLastFromMe ? "A" : "C"}
//           </span>

//           <p className="text-[12.5px] text-gray-500 truncate flex-1">
//             {chat?.lastMessage || "No messages yet"}
//           </p>

//           {unreadCount > 0 && (
//             <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0">
//               {unreadCount}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
































































































// import { PiBell } from "react-icons/pi";
// import AssignCategory from "../shared/ui/AssignCategory";
// import AssignUser from "../shared/ui/AssignUser";
// import { ConversationTime } from "../shared/ui/ConversationTime";
// import { MdDeleteOutline } from "react-icons/md";
// import { FaCheckCircle, FaRegStar, FaStar, FaUndoAlt } from "react-icons/fa";
// import { useSelector } from "react-redux";

// export default function ChatRow({
//   chat,
//   index,
//   activeChatId,
//   setActiveChatId,
//   users,
//   categories,
//   updateConversation,
//   deleteConversation,
// }) {
//   const { auth } = useSelector((state) => state.auth);
//   const currentUserId = auth?.user?.id;

//   const userReadEntry = chat?.readBy?.find(
//     (r) =>
//       (r?.userId?._id || r?.userId)?.toString() === currentUserId?.toString(),
//   );

//   const unreadCount = Math.max(
//     0,
//     (chat?.totalInboundMessages || 0) - (userReadEntry?.readInboundCount || 0),
//   );

//   const isLastFromMe = chat?.lastMessageBy === "me";

//   return (
//     <div
//       key={chat?._id}
//       className={`flex items-center px-5 py-4 cursor-pointer border-b border-gray-50 transition-colors ${
//         activeChatId === chat?._id ? "bg-orange-50/60" : "hover:bg-gray-50"
//       }`}
//     >
//       {/* Avatar */}
//       <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0 shadow-sm border border-orange-200">
//         {chat?.profileName?.charAt(0).toUpperCase() || "#"}
//       </div>

//       <div className="ml-3 flex-1 min-w-0">
//         <div className="flex justify-between items-baseline gap-3  mb-1">
//           <h3 className="text-[15px] font-medium text-gray-900 truncate">
//             {chat?.profileName || chat?.phone || "Unknown Contact"}
//           </h3>

//           <div className="flex items-center gap-2 ">
//             <div className="">
//               {isLastFromMe && (
//                 <div className="flex items-center justify-center size-4 rounded-full bg-orange-500 text-[9px] font-bold text-white shrink-0">
//                   {" "}
//                   A{" "}
//                 </div>
//               )}
//               {!isLastFromMe && (
//                 <div className="flex items-center justify-center size-4 rounded-full bg-blue-500 text-[9px] font-bold text-white shrink-0">
//                   {" "}
//                   C{" "}
//                 </div>
//               )}
//             </div>

//             <button
//               className={`rounded-md transition-colors ${
//                 chat?.isStarred
//                   ? "text-yellow-500 hover:text-yellow-600"
//                   : "text-gray-500 hover:text-yellow-500"
//               }`}
//               title={chat?.isStarred ? "Unstar Chat" : "Star Chat"}
//               onClick={(e) => {
//                 updateConversation(chat?._id, {
//                   isStarred: !chat?.isStarred,
//                 });
//               }}
//             >
//               {chat?.isStarred ? (
//                 <FaStar className="size-4" />
//               ) : (
//                 <FaRegStar className="size-4" />
//               )}
//             </button>

//             <button
//               className="rounded-md   text-gray-500  hover:text-orange-500"
//               title="Set Reminder"
//             >
//               <PiBell className="size-5  font-semibold " />
//             </button>

//             <button
//               className="rounded-md  text-gray-500  hover:text-red-500"
//               title="Delete Chat"
//               onClick={(e) => {
//                 // deleteThread(thread?.threadId, thread?.companyName);
//                 setActiveChatId(null);
//                 deleteConversation(chat?._id, chat?.companyName);
//               }}
//             >
//               <MdDeleteOutline className="size-5   " />
//             </button>

//             {chat?.status === "progress" ? (
//               <button
//                 className="rounded-md   text-gray-500  hover:text-green-500"
//                 title="Complete Chat"
//                 onClick={(e) => {
//                   // updateStatus("completed");
//                   updateConversation(chat?._id, { status: "completed" });
//                 }}
//               >
//                 <FaCheckCircle className="size-4   " />
//               </button>
//             ) : (
//               <button
//                 className=" rounded-md   text-gray-500  hover:text-red-500"
//                 title="Undo Complete"
//                 onClick={(e) => {
//                   // updateStatus("progress");
//                   updateConversation(chat?._id, { status: "progress" });
//                 }}
//               >
//                 <FaUndoAlt className="size-4   " />
//               </button>
//             )}

//             <AssignCategory
//               categories={categories}
//               conversationId={chat._id}
//               currentCategory={chat?.category}
//               updateConversation={updateConversation}
//             />

//             <AssignUser
//               users={users}
//               conversationId={chat?._id}
//               currentUserId={chat?.userId}
//               updateConversation={updateConversation}
//             />

//             <ConversationTime
//               lastMessageAt={chat?.lastMessageAt}
//               index={index}
//             />
//           </div>
//         </div>
//         <div
//           className="flex justify-between items-center"
//           onClick={() => setActiveChatId(chat?._id)}
//         >
//           <p className="text-sm text-gray-500 truncate pr-2">
//             {chat?.lastMessage || "No messages yet"}
//           </p>
//           {unreadCount > 0 && (
//             <span className="bg-orange-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
//               {unreadCount}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
