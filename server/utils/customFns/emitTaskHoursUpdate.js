import { io, onlineUsers } from "../../index.js";
 

 



 export const sendSocketEvent = ({hours, userId}) => {
   const toSocketIds = onlineUsers.get(userId?.toString());

    

   if (toSocketIds && toSocketIds.size > 0) {
     for (const socketId of toSocketIds) {
       io.to(socketId).emit("update_task_timer", {
             newAllocatedTimeInHours: hours,
           });
     }
   }
 }





 
 export function emitTaskHoursUpdate(condition, payload) {
   if (!condition) return;
  

   setImmediate( () => {
      
        sendSocketEvent(payload);
     
   });
 }