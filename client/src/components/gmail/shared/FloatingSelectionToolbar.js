// import { IoMdClose } from "react-icons/io";
// import { HiOutlineMailOpen, HiOutlineTrash } from "react-icons/hi";

// export const SelectionHeader = ({ selectedThreads, threads, markAsRead, deleteThread, clearSelection }) => {
//   if (selectedThreads.size === 0) return null;

//   return (
//     <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 duration-300">
//       <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl border border-slate-700/50 backdrop-blur-sm">

//         {/* Count Indicator */}
//         <div className="flex items-center justify-center bg-blue-500 text-white min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold">
//           {selectedThreads.size}
//         </div>

//         <span className="text-sm font-medium pr-2 border-r border-slate-700 ml-1">
//           Selected
//         </span>

//         {/* Actions */}
//         <div className="flex items-center gap-1 px-1">
//           <button
//             onClick={() => {
//               [...selectedThreads].forEach((id) => {
//                 const t = threads.find(t => t._id === id);
//                 markAsRead(t.threadId, t.companyName);
//               });
//               clearSelection();
//             }}
//             className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition-all group"
//             title="Mark as Read"
//           >
//             <HiOutlineMailOpen size={20} />
//           </button>

//           <button
//             onClick={() => {
//               [...selectedThreads].forEach((id) => {
//                 const t = threads.find(t => t._id === id);
//                 deleteThread(t.threadId, t.companyName, false);
//               });
//               clearSelection();
//             }}
//             className="p-2 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-full transition-all"
//             title="Delete Selected"
//           >
//             <HiOutlineTrash size={20} />
//           </button>
//         </div>

//         <div className="w-[1px] h-6 bg-slate-700 mx-1" />

//         {/* Close Button */}
//         <button
//           onClick={clearSelection}
//           className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all"
//           title="Clear selection"
//         >
//           <IoMdClose size={20} />
//         </button>
//       </div>
//     </div>
//   );
// };











import { IoMdClose } from "react-icons/io";
import { HiOutlineMailOpen, HiOutlineTrash } from "react-icons/hi";
import { IoMailUnreadOutline } from "react-icons/io5";

import { useEffect } from "react";
import axios from "axios";
import AssignCategory from "./ui/AssignCategory";
import AssignUser from "./ui/AssignUser";

 

export const SelectionHeader = ({
  selectedThreads,
  threads,
  users,
  categories,
  markAsRead,
  markAsUnread,
  deleteThread,
  handleBulkUpdateThreads,
  clearSelection,
}) => {

  /**
   * 🔹 BULK UPDATE FUNCTION
   */
  const bulkUpdateThreads = async (updates) => {
    await handleBulkUpdateThreads(updates, [...selectedThreads]);
    clearSelection()
  };

  /**
   * 🔹 BULK DELETE
   */
  const handleDeleteSelected = () => {
    [...selectedThreads].forEach((id) => {
      const t = threads.find((t) => t._id === id);
      deleteThread(t.threadId, t.companyName, false);
    });

    clearSelection();
  };

  /**
   * 🔹 DELETE KEY SUPPORT
   */
  useEffect(() => {
    if (selectedThreads.size === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === "Delete") {
        e.preventDefault();
        handleDeleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);

  }, [selectedThreads]);

  if (selectedThreads.size === 0) return null;

  return (
    <div className="flex items-center justify-start w-full px-4 py-2 border-b border-gray-100 bg-white transition-all duration-200">

      <div className="flex items-center gap-4">

        {/* Selected Count */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full">
            {selectedThreads.size}
          </span>

          <span className="text-sm font-semibold text-blue-900">
            Selected
          </span>
        </div>

        {/* Action Group */}
        <div className="flex items-center bg-white/50 rounded-lg p-0.5 border border-blue-200">

          {/* MARK UNREAD */}
          <button
            onClick={() => {
              [...selectedThreads].forEach((id) => {
                const t = threads.find((t) => t._id === id);
                markAsUnread(t.threadId, t.companyName);
              });

              clearSelection();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white hover:text-blue-600 rounded-md transition-all group"
          >
            <IoMailUnreadOutline
              className="text-slate-500 group-hover:text-blue-600"
              size={18}
            />

            <span className="hidden sm:inline">
              Mark as Unread
            </span>
          </button>

          <div className="w-[1px] h-4 bg-blue-200 mx-1" />

          {/* MARK READ */}
          <button
            onClick={() => {
              [...selectedThreads].forEach((id) => {
                const t = threads.find((t) => t._id === id);
                markAsRead(t.threadId, t.companyName);
              });

              clearSelection();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white hover:text-blue-600 rounded-md transition-all group"
          >
            <HiOutlineMailOpen
              className="text-slate-500 group-hover:text-blue-600"
              size={18}
            />

            <span className="hidden sm:inline">
              Mark as Read
            </span>
          </button>

          <div className="w-[1px] h-4 bg-blue-200 mx-1" />

          {/* 🔹 BULK ASSIGN USER */}
          <AssignUser
            users={users}
            mongoThreadId={null}
            currentUserId={null}
            showLabel={false}
            buttonStyle="border-none shadow-none bg-transparent hover:bg-white"

            handleUpdateThread={(id, data) => {
              bulkUpdateThreads({
                userId: data.userId,
              });
            }}
          />

          <div className="w-[1px] h-4 bg-blue-200 mx-1" />

          {/* 🔹 BULK ASSIGN CATEGORY */}
          <AssignCategory
            categories={categories}
            mongoThreadId={null}
            currentCategory={null}
            showLabel={false}
            buttonStyle="border-none shadow-none bg-transparent hover:bg-white"

            handleUpdateThread={(id, data) => {
              bulkUpdateThreads({
                category: data.category,
              });
            }}
          />

          <div className="w-[1px] h-4 bg-blue-200 mx-1" />

          {/* DELETE */}
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white hover:text-red-600 rounded-md transition-all group"
          >
            <HiOutlineTrash
              className="text-slate-500 group-hover:text-red-600"
              size={18}
            />

            <span className="hidden sm:inline">
              Delete
            </span>
          </button>

        </div>

      </div>

      {/* CANCEL */}
      <button
        onClick={clearSelection}
        className="flex items-center gap-1 px-3 py-1.5 ml-5 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-blue-100 rounded-md transition-colors"
      >
        <IoMdClose size={18} />

        <span>Cancel</span>
      </button>

    </div>
  );
};