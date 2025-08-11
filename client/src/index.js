import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
 

import { Provider } from "react-redux";
import { store } from "./redux/store";
import { SocketProvider } from "./context/socketProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
 
 
      <Provider store={store}>
        <SocketProvider>
        <App />

        </SocketProvider>
      </Provider>
 
 
  
);
 
reportWebVitals();
