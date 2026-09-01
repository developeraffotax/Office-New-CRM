// import { useModal } from "../hooks/useModal";
// import { useUpdateMailThread } from "../hooks/useUpdateMailThread";

// import CreateLeadModal from "./CreateLeadModal";
// import CreateTicketModal from "./CreateTicketModal";

// export default function ModalManager({
//   users,
//   categories,
//   companyName,
// }) {
//   const { modal, closeModal } = useModal();

//   const {
//     updateMailThread,
//   } = useUpdateMailThread();

//   if (!modal.type) {
//     return null;
//   }

//   switch (modal.type) {
//     case "lead-create":
//       return (
//         <CreateLeadModal
//           createLeadModal={{
//             _id: modal.data.threadId,
//             isOpen: true,
//             form: modal.data.prefill || {},
//           }}
//           setCreateLeadModal={(value) => {
//             if (typeof value === "function") {
//               const currentState = {
//                 _id: modal.data.threadId,
//                 isOpen: true,
//                 form: modal.data.prefill || {},
//               };

//               const next = value(currentState);

//               if (!next?.isOpen) {
//                 closeModal();
//               }

//               return;
//             }

//             if (!value?.isOpen) {
//               closeModal();
//             }
//           }}
//           users={users}
//           myCompany={companyName}
//           handleUpdateThread={async (
//             _id,
//             updateData,
//             type
//           ) => {
//             return updateMailThread(
//               _id,
//               updateData,
//               type
//             );
//           }}
//         />
//       );

//     case "ticket-create":
//       return (
//         <CreateTicketModal
//           createTicketModal={{
//             _id: modal.data.threadId,
//             isOpen: true,
//             form: modal.data.form || {},
//           }}
//           setCreateTicketModal={(value) => {
//             if (typeof value === "function") {
//               const currentState = {
//                 _id: modal.data.threadId,
//                 isOpen: true,
//                 form: modal.data.form || {},
//               };

//               const next = value(currentState);

//               if (!next?.isOpen) {
//                 closeModal();
//               }

//               return;
//             }

//             if (!value?.isOpen) {
//               closeModal();
//             }
//           }}
//           users={users}
//           categories={categories}
//           myCompany={companyName}
//           handleUpdateThread={async (
//             _id,
//             updateData,
//             type
//           ) => {
//             return updateMailThread(
//               _id,
//               updateData,
//               type
//             );
//           }}
//         />
//       );

//     default:
//       return null;
//   }
// }