import { S3Client } from "@aws-sdk/client-s3";
 

// Create S3 client (Wasabi-compatible)
export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.WASABI_ENDPOINT || "https://s3.wasabisys.com",
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  },
  
  forcePathStyle: true, // required for Wasabi
});

 export default s3;