// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import timerReducer from "./slices/timerSlice";
import reminderReducer from "./slices/reminderSlice";
import notificationReducer from "./slices/notificationSlice";
import runningTimerReducer from "./slices/runningTimerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timer: timerReducer,
    reminder: reminderReducer,
    notifications: notificationReducer,
    runningTimer: runningTimerReducer
  },
});