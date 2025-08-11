// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const initialState = {
  auth: {
    user: null,
    token: "",
  },
  token: "",
  active: "dashboard",
  anyTimerRunning: false,
  time: "",
  filterId: "",
  searchValue: "",
  jid: "",
  isLoading: false, // ✅ NEW
  isInitializing: true,     // ✅ NEW for first app load
};

export const getUserDetail = createAsyncThunk(
  "auth/getUserDetail",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState().auth;
      const { data } = await axios.get(`${API_URL}/api/v1/user/get_user/${id}`);
      const updatedUser = {
        ...data.user,
        id: data.user._id,
      };
      delete updatedUser._id;

      const updateAuthData = {
        user: updatedUser,
        token: auth.token,
      };
      localStorage.setItem("auth", JSON.stringify(updateAuthData));
      return updateAuthData;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch user");
    }
  }
);





export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/user/login/user`,
          { email, password }
        );
  
        if (data?.success) {
          localStorage.setItem("auth", JSON.stringify(data));
          return { user: data.user, token: data.token };
        } else {
          return rejectWithValue("Login failed");
        }
      } catch (error) {
        return rejectWithValue(error?.response?.data?.message || "Login error");
      }
    }
  );


  

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      state.auth = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    setActive(state, action) {
      state.active = action.payload;
    },
    setAnyTimerRunning(state, action) {
      state.anyTimerRunning = action.payload;
    },
    setTime(state, action) {
      state.time = action.payload;
    },
    setFilterId(state, action) {
      state.filterId = action.payload;
    },
    setSearchValue(state, action) {
      state.searchValue = action.payload;
    },
    setJid(state, action) {
      state.jid = action.payload;
    },
    checkTokenExpiry(state) {
      try {
        const data = localStorage.getItem("auth");
        if (data) {
          const { token } = JSON.parse(data);
          if (!token) throw new Error("Token missing");

          const parts = token.split(".");
          if (parts.length !== 3) throw new Error("Invalid token");

          const decoded = JSON.parse(atob(parts[1]));
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("auth");
            state.auth = { user: null, token: "" };
          }
        }
      } catch (error) {
        console.error("Token decode failed:", error.message);
        localStorage.removeItem("auth");
        state.auth = { user: null, token: "" };
      }
    },
    loadAuthFromLocalStorage(state) {
      const data = localStorage.getItem("auth");
      if (data) {
        const parsed = JSON.parse(data);
        state.auth = {
          user: parsed.user,
          token: parsed.token,
        };
        axios.defaults.headers.common["Authorization"] = parsed.token;
      }
      state.isInitializing = false; // ✅ Mark done after checking
    },
  },
   extraReducers: (builder) => {
    builder
      // getUserDetail
      .addCase(getUserDetail.pending, (state) => {
        state.isLoading = true; // ✅
      })
      .addCase(getUserDetail.fulfilled, (state, action) => {
        state.auth = action.payload;
        axios.defaults.headers.common["Authorization"] = action.payload.token;
        state.isLoading = false; // ✅
      })
      .addCase(getUserDetail.rejected, (state) => {
        state.isLoading = false; // ✅
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true; // ✅
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.auth = action.payload;
        axios.defaults.headers.common["Authorization"] = action.payload.token;
        state.isLoading = false; // ✅
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false; // ✅
      });
  },
});

export const {
  setAuth,
  setToken,
  setActive,
  setAnyTimerRunning,
  setTime,
  setFilterId,
  setSearchValue,
  setJid,
  checkTokenExpiry,
  loadAuthFromLocalStorage,
} = authSlice.actions;

export default authSlice.reducer;
