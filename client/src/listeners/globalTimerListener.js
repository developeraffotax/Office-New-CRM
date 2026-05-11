 
 

// export const globalTimerListener = (socket, dispatch) => {
//   if (!socket) return;

//   socket.on("timer:update", (data) => {
   
     
//       dispatch(updateCountdown(data.newAllocatedTimeInHours))
     
//   });

//   return () => {
//     socket.off("timer:update");
//   };
// };