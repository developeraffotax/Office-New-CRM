// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";

// 1. Initialize with autoConnect: false
const socket = io(ENDPOINT, { transports: ["websocket"], autoConnect: false });

const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
  useEffect(() => {
    if (userId) {
      // 2. Only connect when userId is available
      socket.connect();

      // 3. Emit user connection
      socket.emit("userConnected", userId);
      console.log("✅ Socket connected with user:", userId);
    }

    // 4. Optional cleanup on unmount
    return () => {
      socket.disconnect();
      console.log("❌ Socket disconnected");
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
