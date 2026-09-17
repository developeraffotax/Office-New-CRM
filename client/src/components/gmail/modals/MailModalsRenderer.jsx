import { useSelector } from "react-redux";
import { useMailModalState, useMailModalActions, MODAL_DEFAULTS } from "../context/MailModalsContext";
import { useGetInboxUsersQuery } from "../../../redux/api/inboxUserApi";

import CreateTicketModal from "../shared/CreateTicketModal";
import CreateLeadModal from "../shared/CreateLeadModal";
import Reminder from "../../../utlis/Reminder";
import CommentList from "../comments/CommentList";
 import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Fade from "@mui/material/Fade";
import { useLayoutEffect, useState } from "react";

export default function MailModalsRenderer() {
  const { ticket, lead, reminder, comment } = useMailModalState();
  const { setTicket, setLead, setReminder, setComment } = useMailModalActions();

  const { auth: { user } } = useSelector((state) => state.auth);
  const { data: users = [] } = useGetInboxUsersQuery(); // RTK Query — no drilling needed, works on either route
   
  const [panel, setPanel] = useState({ maxHeight: 480, placement: "bottom-end" });

  useLayoutEffect(() => {
    if (!comment.isOpen || !comment.anchorEl) return;

    const measure = () => {
      const rect = comment.anchorEl.getBoundingClientRect();
      const padding = 16;
      const spaceBelow = window.innerHeight - rect.bottom - padding;
      const spaceAbove = rect.top - padding;
      const openBelow = spaceBelow >= 300 || spaceBelow >= spaceAbove;

      setPanel({
        maxHeight: Math.max(260, Math.min(480, openBelow ? spaceBelow : spaceAbove)),
        placement: openBelow ? "bottom-end" : "top-end",
      });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [comment.isOpen, comment.anchorEl]);

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

      {reminder.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-300/80">
          <Reminder
            setShowReminder={() => setReminder(MODAL_DEFAULTS.reminder)}
            taskId={reminder.threadId}
            link={reminder.link}
          />
        </div>
      )}




     {comment.isOpen && (
        <Popper
          open={comment.isOpen}
          anchorEl={comment.anchorEl}
          placement={panel.placement}
          transition
          style={{ zIndex: 1300 }}
          modifiers={[
            { name: "offset", options: { offset: [0, 8] } },
            { name: "preventOverflow", options: { boundary: "viewport", padding: 12 } },
          ]}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={150}>
              <div>
                <ClickAwayListener onClickAway={() => setComment(MODAL_DEFAULTS.comment)}>
                  <div>
                    <CommentList
                      users={users}
                      currentUserId={user.id}
                      onClose={() => setComment(MODAL_DEFAULTS.comment)}
                      threadId={comment.threadId}
                      threadSubject={comment.threadSubject}
                      anchored
                      maxHeight={panel.maxHeight}
                    />
                  </div>
                </ClickAwayListener>
              </div>
            </Fade>
          )}
        </Popper>
      )}


     
    </>
  );
}