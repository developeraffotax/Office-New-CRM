"use client";

import { useEffect } from "react";
import socketIO from "socket.io-client";
import { useAuth } from "./authContext";

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";

const SocketHandler = () => {
  const { auth } = useAuth();

  useEffect(() => {
    let socketId;

    if (auth?.user?._id) {
      socketId = socketIO(ENDPOINT, {
        transports: ["websocket"],
        query: { userID: auth.user._id },
      });

      socketId.on("connection", () => {
        console.log("Socket connected!");
      });

      socketId.on("disconnect", () => {
        console.log("Socket disconnected!");
      });

      return () => {
        socketId.disconnect();
      };
    }
  }, [auth?.user]);

  return null;
};

export default SocketHandler;
