import { createContext, useContext, useState, useMemo } from "react";

const StateCtx = createContext(null);
const ActionsCtx = createContext(null);

export const MODAL_DEFAULTS = {
  ticket: { _id: "", isOpen: false, form: {} },
  lead: { _id: "", isOpen: false, form: {} },
  reminder: { isOpen: false, threadId: "", link: "" },
  comment: { show: false, threadId: null, threadSubject: "" },
};

export function MailModalsProvider({ children }) {
  const [ticket, setTicket] = useState(MODAL_DEFAULTS.ticket);
  const [lead, setLead] = useState(MODAL_DEFAULTS.lead);
  const [reminder, setReminder] = useState(MODAL_DEFAULTS.reminder);
  const [comment, setComment] = useState(MODAL_DEFAULTS.comment);

  // Raw setters are exposed as-is so CreateTicketModal / CreateLeadModal /
  // Reminder / CommentList need ZERO internal changes — they still get a
  // `setX` they can call however they already do (close themselves, patch
  // form fields mid-edit, etc.)
  const actions = useMemo(() => ({
    setTicket, setLead, setReminder, setComment,

    // convenience openers for call sites (TicketButton, LeadButton, ...)
    openTicket: (payload) => setTicket({ ...MODAL_DEFAULTS.ticket, isOpen: true, ...payload }),
    openLead: (payload) => setLead({ ...MODAL_DEFAULTS.lead, isOpen: true, ...payload }),
    openReminder: (payload) => setReminder({ ...MODAL_DEFAULTS.reminder, isOpen: true, ...payload }),
    openComments: (payload) => setComment({ ...MODAL_DEFAULTS.comment, show: true, ...payload }),
  }), []); // stable reference forever — consumers of ActionsCtx never re-render on state change

  const state = { ticket, lead, reminder, comment };

  return (
    <ActionsCtx.Provider value={actions}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </ActionsCtx.Provider>
  );
}

export const useMailModalActions = () => useContext(ActionsCtx);
export const useMailModalState = () => useContext(StateCtx);