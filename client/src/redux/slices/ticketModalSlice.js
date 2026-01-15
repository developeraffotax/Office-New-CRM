import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isModalOpen: false,
  ticketId: null,

   
};

const ticketModalSlice = createSlice({
  name: "ticketModal",
  initialState,
  reducers: {
    openTicketModal: (state, action) => {
      state.isModalOpen = true;
      state.ticketId = action.payload; // ticketId
    },
    closeTicketModal: (state) => {
      state.isModalOpen = false;
      state.ticketId = null;
       
    },

    
  },
});

export const {
  openTicketModal,
  closeTicketModal,
 
} = ticketModalSlice.actions;

export default ticketModalSlice.reducer;
