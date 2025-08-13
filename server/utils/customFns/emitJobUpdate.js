import { io, onlineUsers } from "../../index.js";








 export const sendSocketEvent = ({updated_job, userId}) => {
   const toSocketIds = onlineUsers.get(userId?.toString());

   console.log("sendSocketEvent")

   if (toSocketIds && toSocketIds.size > 0) {
     for (const socketId of toSocketIds) {
       io.to(socketId).emit("job_updated", {
         updated_job: updated_job || null,
       });
     }
   }
 }





 
 export function emitJobUpdate(condition, payload) {
   if (!condition) return;
  

   setImmediate( () => {
      
        sendSocketEvent(payload);
     
   });
 }