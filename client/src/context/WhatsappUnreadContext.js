// context/WhatsappUnreadContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useSocket } from "./socketProvider";

const WhatsappUnreadContext = createContext({
  unread: { messages: 0, conversations: 0 },
  refreshUnread: () => {},
});

export function WhatsappUnreadProvider({ companyName, enabled = true, children }) {
  const socket = useSocket();
  const [unread, setUnread] = useState({ messages: 0, conversations: 0 });
  const timer = useRef(null);

  const refreshUnread = useCallback(async () => {
    if (!enabled) return;
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/unread-total`,
        // { params: { companyName } },
      );
      setUnread({ messages: data.messages, conversations: data.conversations });
    } catch (err) {
      console.error("Failed to fetch WhatsApp unread total", err);
    }
  }, [enabled]);

  // Debounced so a burst of socket events causes one request
  const refreshDebounced = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(refreshUnread, 500);
  }, [refreshUnread]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    if (!socket || !enabled ) return;
    const event = `whatsapp:conversation-update-affotax`;
    socket.on(event, refreshDebounced);
    return () => {
      socket.off(event, refreshDebounced);
      clearTimeout(timer.current);
    };
  }, [socket, enabled,  refreshDebounced]);

  const value = useMemo(() => ({ unread, refreshUnread }), [unread, refreshUnread]);

  return (
    <WhatsappUnreadContext.Provider value={value}>
      {children}
    </WhatsappUnreadContext.Provider>
  );
}

export const useWhatsappUnread = () => useContext(WhatsappUnreadContext);