import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



const globalTimerChannel = new BroadcastChannel("globalTimer_channel");

/**
 * Fetch active timer
 */
export const fetchGlobalTimer = createAsyncThunk(
  "globalTimer/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/crm/timer-status`
      );

      return res?.data?.timer ?? null; // ⬅️ explicit null fallback
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch timer"
      );
    }
  }
);















export const startTimer = createAsyncThunk(
  "globalTimer/start",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/start/timer`,
        payload
      );

      const timer = res?.data?.timer;

      // 🔥 instantly set UI (no waiting for fetch)
      // dispatch({
      //   type: "globalTimer/setActiveTimer",
      //   payload: timer,
      // });

        dispatch(fetchGlobalTimer());

      // broadcast to other tabs
      globalTimerChannel.postMessage({
        type: "GLOBAL_TIMER_UPDATED",
        payload: timer,
      });

      return timer;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to start timer"
      );
    }
  }
);
















export const stopTimer = createAsyncThunk(
  "globalTimer/stop",
  async ({ timerId, note, activity }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/stop/timer/${timerId}`,
        { note, activity }
      );

      const updatedTimer = res?.data?.timer || null;

      // dispatch({
      //   type: "globalTimer/fetch",
      //   payload: updatedTimer,
      // });

       dispatch(fetchGlobalTimer());

      globalTimerChannel.postMessage({
        type: "GLOBAL_TIMER_UPDATED",
        payload: updatedTimer,
      });

      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to stop timer"
      );
    }
  }
);



















const initialState = {
  timer: null,
  elapsed: 0,
  loading: false,
  error: null,
};

const safeTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};

const globalTimerSlice = createSlice({
  name: "globalTimer",
  initialState,

  reducers: {
    tick(state) {
      if (!state.timer?.isRunning) return;

      const start = safeTime(state.timer?.startTime);
      if (!start) return;

      state.elapsed = Math.max(Date.now() - start, 0);
    },


        updateTimerFromBroadcast(state, action) {
      const timer = action.payload;
      state.timer = timer ?? null;

      // update elapsed
      const start = safeTime(timer?.startTime);
      if (!start) {
        state.elapsed = 0;
        return;
      }

      if (timer?.isRunning) {
        state.elapsed = Math.max(Date.now() - start, 0);
      } else {
        const end = safeTime(timer?.endTime) ?? start;
        state.elapsed = Math.max(end - start, 0);
      }
    },


    setActiveTimer(state, action) {
  state.timer = action.payload ?? null;

  const start = safeTime(state.timer?.startTime);

  if (!start) {
    state.elapsed = 0;
    return;
  }

  state.elapsed = state.timer?.isRunning
    ? Math.max(Date.now() - start, 0)
    : 0;
},

    // setStaticElapsed(state) {
    //   if (!state.timer || state.timer.isRunning) return;

    //   const start = safeTime(state.timer?.startTime);
    //   if (!start) {
    //     state.elapsed = 0;
    //     return;
    //   }

    //   const end = safeTime(state.timer?.endTime) ?? start;
    //   state.elapsed = Math.max(end - start, 0);
    // },

    // resetGlobalTimer(state) {
    //   state.timer = null;
    //   state.elapsed = 0;
    //   state.loading = false;
    //   state.error = null;
    // },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalTimer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGlobalTimer.fulfilled, (state, action) => {
        state.loading = false;
        state.timer = action.payload ?? null;
        state.error = null;

        globalTimerChannel.postMessage({
          type: "GLOBAL_TIMER_UPDATED",
          payload: state.timer,
        });

        // ⬅️ No active timer → reset safely
        if (!action.payload) {
          state.elapsed = 0;
          return;
        }

        const start = safeTime(action.payload?.startTime);
        if (!start) {
          state.elapsed = 0;
          return;
        }

        if (action.payload?.isRunning) {
          state.elapsed = Math.max(Date.now() - start, 0);
        } else {
          const end = safeTime(action.payload?.endTime) ?? start;
          state.elapsed = Math.max(end - start, 0);
        }

        
      })

      .addCase(fetchGlobalTimer.rejected, (state, action) => {
        state.loading = false;
        state.timer = null;
        state.elapsed = 0;
        state.error = action.payload || "Unknown error";
      })

      .addCase(startTimer.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(startTimer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to stop timer";
      })


      
      .addCase(stopTimer.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(stopTimer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to stop timer";
      })
  },
});




















// Init function (call this after login or app start)
export const initGlobalTimerListener = () => (dispatch) => {
  globalTimerChannel.onmessage = (msg) => {

    console.log("Received global timer message in other tab:🤎💙💛", msg.data);

  if (msg.data.type === "GLOBAL_TIMER_UPDATED") {
    dispatch({
      type: "globalTimer/updateTimerFromBroadcast",
      payload: msg.data.payload,
    });
  }
};
};











export const {
  tick,
  setStaticElapsed,
  resetGlobalTimer,
} = globalTimerSlice.actions;

export default globalTimerSlice.reducer;
