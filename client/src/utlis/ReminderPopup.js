// import { useEffect } from "react";
// import { IoClose } from "react-icons/io5";
// import { motion, AnimatePresence } from "framer-motion";

// export default function ReminderPopup({ reminder, onClose }) {
// //   useEffect(() => {
// //     const timer = setTimeout(onClose, 5000);
// //     return () => clearTimeout(timer);
// //   }, [onClose]);

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: 30 }}
//         className="fixed bottom-6 right-6 z-[9999] max-w-sm w-[90%] sm:w-[24rem] bg-white shadow-xl border border-gray-200 rounded-xl p-4"
//       >
//         <div className="flex items-start justify-between">
//           <div>
//             <h2 className="text-lg font-semibold text-purple-700">
//               🔔 {reminder.title}
//             </h2>
//             <p className="text-gray-700 mt-1 text-sm">{reminder.description}</p>
//             {reminder.redirectLink && (
//               <a
//                 href={reminder.redirectLink}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-block mt-3 text-sm text-purple-600 hover:underline"
//               >
//                 View Task →
//               </a>
//             )}
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition"
//           >
//             <IoClose className="w-5 h-5" />
//           </button>
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
