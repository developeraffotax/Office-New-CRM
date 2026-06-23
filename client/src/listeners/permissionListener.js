import { getUserDetail } from "../redux/slices/authSlice"; 

export const registerPermissionListener = (socket, dispatch) => {
  if (!socket) return;

  socket.on("permissions:updated", (data) => {
    

    console.log("PERMISSIONS UPDATED 🧡🧡🧡", data)
 
    dispatch(getUserDetail());

    
  });

  return () => {
    socket.off("permissions:updated");
  };
};