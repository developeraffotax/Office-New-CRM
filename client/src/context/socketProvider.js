// src/context/SocketProvider.js
// import React, { createContext, useContext, useEffect, useState } from "react";
 
// import { useSelector } from "react-redux"; // assuming auth in Redux
// import { connectSocket, disconnectSocket, getSocket } from "../services/socketService";

// const SocketContext = createContext(null);

// export const SocketProvider = ({ children }) => {
//   const userId = useSelector((state) => state.auth?.auth?.user?.id);
//   const [socketInstance, setSocketInstance] = useState(null);

//   useEffect(() => {
//     if (userId) {
//       connectSocket(userId);
//       setSocketInstance(getSocket());
//     }
//     // return () => disconnectSocket();
//   }, [userId]);

//   return (
//     <SocketContext.Provider value={socketInstance}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);






// src/context/SocketProvider.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket, getSocket } from "../services/socketService";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const userId = useSelector((state) => state.auth?.auth?.user?.id);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (userId) {
      // connect once per tab
      const socket = connectSocket(userId);
      setSocketInstance(socket || getSocket());
    } else {
      // if user logs out, disconnect
      disconnectSocket();
      setSocketInstance(null);
    }
  }, [userId]);

  // disconnect on tab close/refresh
  useEffect(() => {
    const handleUnload = () => disconnectSocket();
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return (
    <SocketContext.Provider value={socketInstance}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
