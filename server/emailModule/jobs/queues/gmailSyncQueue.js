import { Queue } from "bullmq";
import { connection } from "../../../utils/ioredis.js";


 

export const gmailSyncQueue = new Queue("gmail-sync-all", { connection });

