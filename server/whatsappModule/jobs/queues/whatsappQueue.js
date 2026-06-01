import { Queue } from "bullmq";
import { connection } from "../../../utils/ioredis.js";


 

export const whatsappQueue = new Queue("whatsapp-messages", { connection });

 

