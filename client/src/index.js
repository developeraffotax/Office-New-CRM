import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
 import { BrowserRouter,   } from "react-router-dom";

import { Provider } from "react-redux";
import { store } from "./redux/store";
import { SocketProvider } from "./context/socketProvider";
 
// const notificationChannel = new BroadcastChannel("notification-sync");

// notificationChannel.onmessage = (event) => {
//   const { type, userId } = event.data || {};
//   if (type === "REFRESH_NOTIFICATIONS" && userId) {
//     store.dispatch(getNotifications(userId));
//   }
// };
 


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
 
 
      <Provider store={store}>
    <SocketProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SocketProvider>
  </Provider>
 
 
  
);
 
reportWebVitals();


