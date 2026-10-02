// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { useLocation, useNavigate } from "react-router-dom";
// import { SiGooglesheets } from "react-icons/si";
// import { IoChevronDown, IoSettingsOutline } from "react-icons/io5";

// /**
//  * Expandable "Google Sheets" group for the sidebar.
//  *  - Users: see only the sheets assigned to them (hidden entirely if none).
//  *  - Admin: sees every sheet plus a "Manage Sheets" entry.
//  *
//  * Props:
//  *  collapsed  – true when the desktop rail is collapsed (icon only)
//  *  onNavigate – optional callback after navigating (e.g. close mobile drawer)
//  */
// export default function SidebarSheetsGroup({ collapsed = false, onNavigate }) {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();

//   const user = useSelector((state) => state.auth.auth?.user);
//   const sheets = useSelector((state) => state.googleSheets.items);
//   const isAdmin = user?.role?.name === "Admin";

//   const onSheetsRoute = pathname.startsWith("/google-sheets");
//   const [open, setOpen] = useState(onSheetsRoute);

//   useEffect(() => {
//     if (onSheetsRoute) setOpen(true);
//   }, [onSheetsRoute]);

//   if (!isAdmin && sheets.length === 0) return null;

//   const go = (path) => {
//     navigate(path);
//     onNavigate?.();
//   };

//   const itemClass = (active) =>
//     `w-full flex items-center pl-10 pr-3 py-2 rounded-lg text-sm text-left truncate transition ${
//       active
//         ? "bg-orange-50 text-orange-600 font-medium"
//         : "text-gray-600 hover:bg-gray-100"
//     }`;

//   // Collapsed rail: icon only, jumps straight to something useful
//   if (collapsed) {
//     const target = isAdmin
//       ? "/google-sheets/manage"
//       : `/google-sheets/${sheets[0]?._id}`;
//     return (
//       <button
//         title="Google Sheets"
//         onClick={() => go(target)}
//         className={`w-full flex items-center justify-center py-2 rounded-lg ${
//           onSheetsRoute ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-100"
//         }`}
//       >
//         <SiGooglesheets size={18} />
//       </button>
//     );
//   }

//   return (
//     <div>
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
//           onSheetsRoute && !open
//             ? "bg-orange-50 text-orange-600"
//             : "text-gray-700 hover:bg-gray-100"
//         }`}
//       >
//         <SiGooglesheets size={18} />
//         <span className="flex-1 text-left">Google Sheets</span>
//         <IoChevronDown
//           size={16}
//           className={`transition-transform ${open ? "rotate-180" : ""}`}
//         />
//       </button>

//       {open && (
//         <div className="mt-1 space-y-0.5">
//           {sheets.map((sheet) => (
//             <button
//               key={sheet._id}
//               title={sheet.name}
//               onClick={() => go(`/google-sheets/${sheet._id}`)}
//               className={`${itemClass(pathname === `/google-sheets/${sheet._id}`)} ${
//                 sheet.isActive === false ? "opacity-60" : ""
//               }`}
//             >
//               {sheet.name}
//             </button>
//           ))}

//           {sheets.length === 0 && isAdmin && (
//             <p className="pl-10 pr-3 py-2 text-xs text-gray-400">No sheets yet</p>
//           )}

//           {isAdmin && (
//             <button
//               onClick={() => go("/google-sheets/manage")}
//               className={`${itemClass(pathname === "/google-sheets/manage")} gap-2 border-t mt-1 pt-2`}
//             >
//               <IoSettingsOutline size={15} />
//               Manage Sheets
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }