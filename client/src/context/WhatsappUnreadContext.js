
// context/WhatsappUnreadContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useSocket } from "./socketProvider";

const WhatsappUnreadContext = createContext({
  unread: { messages: 0, conversations: 0 },
  refreshUnread: () => {},
});

export function WhatsappUnreadProvider({ companyName, enabled = true, children }) {
  const socket = useSocket();
  const [unread, setUnread] = useState({ messages: 0, conversations: 0 });
  const timer = useRef(null);
  const channelRef = useRef(null);

  // Scope the channel per user so two accounts in the same browser never mix
  const auth = useSelector((state) => state.auth.auth);
  const userId = useSelector((state) => state.auth.auth?.user?.id ?? state.auth.auth?.user?._id);



  // console.log("userId in WhatsappUnreadProvider:❤️❤️❤️❤️❤️❤️❤️❤️❤️", auth); // Debugging line
  // ---- Cross-tab sync ----
  useEffect(() => {
    if (!enabled || !userId || typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(`whatsapp-unread-${userId}`);
    channelRef.current = channel;

    channel.onmessage = (e) => {
      if (e.data?.type !== "unread-update") return;
      // Only set state here. Do NOT re-broadcast, or tabs will ping-pong forever.
      setUnread({ messages: e.data.messages, conversations: e.data.conversations });
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [enabled, userId]);

  const refreshUnread = useCallback(
    async (opts) => {
      if (!enabled) return;
      const broadcast = opts?.broadcast === true; // ignores event objects passed by accident
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/unread-total`,
        );
        const next = { messages: data.messages, conversations: data.conversations };
        setUnread(next);

        if (broadcast) {
          channelRef.current?.postMessage({ type: "unread-update", ...next });
        }
      } catch (err) {
        console.error("Failed to fetch WhatsApp unread total", err);
      }
    },
    [enabled],
  );

  // Debounced so a burst of socket events causes one request
  const refreshDebounced = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => refreshUnread(), 500);
  }, [refreshUnread]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    if (!socket || !enabled) return;
    const event = `whatsapp:conversation-update-affotax`;
    socket.on(event, refreshDebounced);
    return () => {
      socket.off(event, refreshDebounced);
      clearTimeout(timer.current);
    };
  }, [socket, enabled, refreshDebounced]);

  const value = useMemo(() => ({ unread, refreshUnread }), [unread, refreshUnread]);

  return (
    <WhatsappUnreadContext.Provider value={value}>
      {children}
    </WhatsappUnreadContext.Provider>
  );
}

export const useWhatsappUnread = () => useContext(WhatsappUnreadContext);









































// // context/WhatsappUnreadContext.jsx
// import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
// import axios from "axios";
// import { useSocket } from "./socketProvider";

// const WhatsappUnreadContext = createContext({
//   unread: { messages: 0, conversations: 0 },
//   refreshUnread: () => {},
// });

// export function WhatsappUnreadProvider({ companyName, enabled = true, children }) {
//   const socket = useSocket();
//   const [unread, setUnread] = useState({ messages: 0, conversations: 0 });
//   const timer = useRef(null);

//   const refreshUnread = useCallback(async () => {
//     if (!enabled) return;
//     try {
//       const { data } = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/unread-total`,
//         // { params: { companyName } },
//       );
//       setUnread({ messages: data.messages, conversations: data.conversations });
//     } catch (err) {
//       console.error("Failed to fetch WhatsApp unread total", err);
//     }
//   }, [enabled]);

//   // Debounced so a burst of socket events causes one request
//   const refreshDebounced = useCallback(() => {
//     clearTimeout(timer.current);
//     timer.current = setTimeout(refreshUnread, 500);
//   }, [refreshUnread]);

//   useEffect(() => {
//     refreshUnread();
//   }, [refreshUnread]);

//   useEffect(() => {
//     if (!socket || !enabled ) return;
//     const event = `whatsapp:conversation-update-affotax`;
//     socket.on(event, refreshDebounced);
//     return () => {
//       socket.off(event, refreshDebounced);
//       clearTimeout(timer.current);
//     };
//   }, [socket, enabled,  refreshDebounced]);

//   const value = useMemo(() => ({ unread, refreshUnread }), [unread, refreshUnread]);

//   return (
//     <WhatsappUnreadContext.Provider value={value}>
//       {children}
//     </WhatsappUnreadContext.Provider>
//   );
// }

// export const useWhatsappUnread = () => useContext(WhatsappUnreadContext);