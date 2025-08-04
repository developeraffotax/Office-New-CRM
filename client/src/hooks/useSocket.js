// // src/hooks/useSocket.js
// import { useEffect } from "react";
// import { initSocket, disconnectSocket, getSocket } from "@/services/socket";
// import { useSelector } from "react-redux";

// export const useSocket = () => {
//   const userId = useSelector((state) => state.auth?.user?.id);

//   useEffect(() => {
//     if (userId) {
//       initSocket(userId);
//     } else {
//       disconnectSocket();
//     }

//     return () => {
//       disconnectSocket();
//     };
//   }, [userId]);

//   return getSocket(); // use in your components
// };
