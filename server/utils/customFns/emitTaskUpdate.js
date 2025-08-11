import { io, onlineUsers } from "../../index.js";








 export const sendSocketEvent = ({updated_task, userId}) => {
   const toSocketIds = onlineUsers.get(userId?.toString());

   console.log("sendSocketEvent")

   if (toSocketIds && toSocketIds.size > 0) {
     for (const socketId of toSocketIds) {
       io.to(socketId).emit("task_updated", {
         updated_task: updated_task || null,
       });
     }
   }
 }





 
 export function emitTaskUpdate(condition, payload) {
   if (!condition) return;
  

   setImmediate( () => {
      
        sendSocketEvent(payload);
     
   });
 }