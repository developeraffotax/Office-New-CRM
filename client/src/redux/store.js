// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import timerReducer from "./slices/timerSlice";
import reminderReducer from "./slices/reminderSlice";
import notificationReducer from "./slices/notificationSlice";
import settingsReducer from "./slices/settingsSlice";
import globalTimerReducer from "./slices/globalTimerSlice";

import globalModalReducer from "./slices/globalModalSlice";
import inboxUnreadReducer from "./slices/inboxUnreadSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    timer: timerReducer,
    reminder: reminderReducer,
    notifications: notificationReducer,
    settings: settingsReducer,
    globalTimer: globalTimerReducer,

    globalModal: globalModalReducer,
    inboxUnread: inboxUnreadReducer,
  },
});