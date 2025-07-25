// import Draggable from "react-draggable";
// import { IoCloseCircleOutline } from "react-icons/io5";
// import { Link } from "react-router-dom";

//   export const renderNotification = (reminder) => {






    



// //   const deleteReminder = async (id) => {
// //     try {
// //       await axios.delete(
// //         `${process.env.REACT_APP_API_URL}/api/v1/reminders/delete/reminder/${id}`
// //       );
// //       setReminderData((prev) => prev.filter((reminder) => reminder._id !== id));
// //       socketId.emit("reminder", {
// //         note: "Reminder Deleted",
// //       });
// //     } catch (error) {
// //       console.error("Error deleting reminder:", error);
// //     }
// //   };

// //   const snoozeReminder = (reminderId, duration) => {
// //     const reminder = reminderData.find((r) => r._id === reminderId);
// //     setReminderData((prev) => prev.filter((r) => r._id !== reminderId));

// //     const snoozeUntil = Date.now() + duration;
// //     addSnoozeToStorage(reminder, snoozeUntil);

// //     const timer = setTimeout(() => {
// //       setReminderData((prev) => [...prev, reminder]);
// //       removeSnoozeFromStorage(reminderId);
// //     }, duration);

// //     setSnoozeTimers((prev) => ({
// //       ...prev,
// //       [reminderId]: timer,
// //     }));
// //   };

// //   const addSnoozeToStorage = (reminder, snoozeUntil) => {
// //     const snoozedReminders =
// //       JSON.parse(localStorage.getItem("snoozedReminders")) || [];
// //     snoozedReminders.push({ reminder, snoozeUntil });
// //     localStorage.setItem("snoozedReminders", JSON.stringify(snoozedReminders));
// //   };

// //   const removeSnoozeFromStorage = (reminderId) => {
// //     const snoozedReminders =
// //       JSON.parse(localStorage.getItem("snoozedReminders")) || [];
// //     const updatedReminders = snoozedReminders.filter(
// //       ({ reminder }) => reminder._id !== reminderId
// //     );
// //     localStorage.setItem("snoozedReminders", JSON.stringify(updatedReminders));
// //   };




//     // if (!reminder) return null;
//     return (
//       <Draggable handle=".drag-handle">
//         <div
//           className="fixed inset-0 flex items-center justify-center z-[999]"
//           style={{ pointerEvents: "none" }}
//         >
//           <div
//             style={{ pointerEvents: "all" }}
//             className="relative bg-white border border-gray-200 z-[999] w-[20rem] sm:w-[29rem] rounded-md shadow-md drop-shadow-md min-h-[6rem] mb-4"
//           >
//             <span
//               className="cursor-pointer absolute top-2 right-2 z-[9999]"
//             //   onClick={() => deleteReminder(reminder._id)}
//             >
//               <IoCloseCircleOutline className="text-[26px] text-white hover:text-sky-500" />
//             </span>
//             <h5 className="drag-handle cursor-move relative text-[20px] text-start font-medium rounded-tl-md rounded-tr-md text-white bg-orange-600 p-3 font-Poppins">
//               Reminders
//               <div className="absolute right-[8rem] top-[-3rem] animate-shake z-10">
//                 <img
//                   src="/reminder.png"
//                   alt="reminder"
//                   className="h-[7rem] w-[7rem]"
//                 />
//               </div>
//             </h5>
//             <div className="flex flex-col gap-1 p-3">
//               <p className=" text-sm text-gray-900 font-semibold">
//                 {reminder.title}
//               </p>
//               <div className="mx-h-[18rem] overflow-y-auto w-full overflow-hidden">
//                 <div
//                   dangerouslySetInnerHTML={{
//                     __html: reminder.description,
//                   }}
//                   className="whitespace-pre-wrap break-words px-2 py-2 w-full"
//                 ></div>
//               </div>
//             </div>
//             <Link
//               to={reminder.redirectLink}
//               className="text-blue-500 hover:text-blue-600 text-sm underline p-3 block"
//             >
//               Go to Page
//             </Link>
//             <div className="flex items-center gap-2 flex-wrap p-3">
//               <button
//                 className="bg-blue-500 text-[13px] text-white px-3 py-1 rounded hover:bg-blue-600"
//                 // onClick={() => {
//                 //   snoozeReminder(reminder._id, 5 * 60 * 1000);
//                 //   deleteReminder(reminder._id);
//                 // }}
//               >
//                 Snooze 5m
//               </button>
//               <button
//                 className="bg-green-500 text-[13px] text-white px-3 py-1 rounded hover:bg-green-600"
//                 // onClick={() => {
//                 //   snoozeReminder(reminder._id, 15 * 60 * 1000);
//                 //   deleteReminder(reminder._id);
//                 // }}
//               >
//                 Snooze 15m
//               </button>
//               <button
//                 className="bg-pink-500 text-[13px] text-white px-3 py-1 rounded hover:bg-pink-600"
//                 // onClick={() => {
//                 //   snoozeReminder(reminder._id, 30 * 60 * 1000);
//                 //   deleteReminder(reminder._id);
//                 // }}
//               >
//                 Snooze 30m
//               </button>
//               <button
//                 className="bg-purple-500 text-[13px] text-white px-3 py-1 rounded hover:bg-purple-600"
//                 // onClick={() => {
//                 //   snoozeReminder(reminder._id, 60 * 60 * 1000);
//                 //   deleteReminder(reminder._id);
//                 // }}
//               >
//                 Snooze 60m
//               </button>
//               {/* {hours.map((hour, index) => (
//                 <button
//                   key={hour}
//                   className={`text-[13px] text-white px-3 py-1 rounded ${
//                     colors[index % colors.length]
//                   }`}
//                   onClick={() => {
//                     snoozeReminder(reminder._id, hour * 60 * 60 * 1000);
//                     deleteReminder(reminder._id);
//                   }}
//                 >
//                   Snooze {hour}h
//                 </button>
//               ))} */}
//             </div>
//           </div>
//         </div>
//       </Draggable>
//     );
//   };