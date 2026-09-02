import { useSelector } from "react-redux";
import { useMailModalState, useMailModalActions, MODAL_DEFAULTS } from "../context/MailModalsContext";
import { useGetInboxUsersQuery } from "../../../redux/api/inboxUserApi";

import CreateTicketModal from "../shared/CreateTicketModal";
import CreateLeadModal from "../shared/CreateLeadModal";
import Reminder from "../../../utlis/Reminder";
import CommentList from "../comments/CommentList";
 

export default function MailModalsRenderer() {
  const { ticket, lead, reminder, comment } = useMailModalState();
  const { setTicket, setLead, setReminder, setComment } = useMailModalActions();

  const { auth: { user } } = useSelector((state) => state.auth);
  const { data: users = [] } = useGetInboxUsersQuery(); // RTK Query — no drilling needed, works on either route
   


  return (
    <>
      {ticket.isOpen && (
        <CreateTicketModal
          createTicketModal={ticket}
          setCreateTicketModal={setTicket}
          handleUpdateThread={ticket.onUpdate}
          users={users}
          myCompany={ticket.companyName}
        />
      )}

      {lead.isOpen && (
        <CreateLeadModal
          createLeadModal={lead}
          setCreateLeadModal={setLead}
          handleUpdateThread={lead.onUpdate}
          users={users}
          myCompany={lead.companyName}
        />
      )}

      {reminder.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-300/80">
          <Reminder
            setShowReminder={() => setReminder(MODAL_DEFAULTS.reminder)}
            taskId={reminder.threadId}
            link={reminder.link}
          />
        </div>
      )}

      <CommentList
        users={users}
        currentUserId={user.id}
        onClose={() => setComment(MODAL_DEFAULTS.comment)}
        {...comment}
      />
    </>
  );
}