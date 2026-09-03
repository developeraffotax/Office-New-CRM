import { useSelector } from "react-redux";
import {  MODAL_DEFAULTS, useWhatsappModalActions, useWhatsappModalState } from "../context/WhatsappModalsContext";
import { useGetInboxUsersQuery } from "../../../redux/api/inboxUserApi";

// import CreateTicketModal from "../shared/CreateTicketModal";
// import CreateLeadModal from "../shared/CreateLeadModal";
// import Reminder from "../../../utlis/Reminder";
import CommentList from "../comments/CommentList";
import CreateLeadModal from "../../gmail/shared/CreateLeadModal";
import CreateTicketModal from "../../gmail/shared/CreateTicketModal";
 

export default function WhatsappModalsRenderer() {
  const { ticket, lead, reminder, comment } = useWhatsappModalState();
  const { setTicket, setLead, setReminder, setComment } = useWhatsappModalActions();

  const { auth: { user } } = useSelector((state) => state.auth);
  const { data: users = [] } = useGetInboxUsersQuery(); // RTK Query — no drilling needed, works on either route
   


  return (
    <>
      {ticket.isOpen && (
        <CreateTicketModal
          createTicketModal={ticket}
          setCreateTicketModal={setTicket}
          users={users}
          
          onUpdate={ticket.onUpdate}
        />
      )}

      {lead.isOpen && (
        <CreateLeadModal
          createLeadModal={lead}
          setCreateLeadModal={setLead}
          users={users}
          
          onUpdate={lead.onUpdate}
        />
      )}

      {/* {reminder.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-300/80">
          <Reminder
            setShowReminder={() => setReminder(MODAL_DEFAULTS.reminder)}
            taskId={reminder.threadId}
            link={reminder.link}
          />
        </div>
      )} */}




      {comment.isOpen && (
 
           <CommentList
              users={users}
              currentUserId={user.id}
              onClose={() => setComment(MODAL_DEFAULTS.comment)}
              {...comment}
            />
 
      )}



     
    </>
  );
}