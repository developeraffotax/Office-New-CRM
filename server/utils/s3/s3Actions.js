import {
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {s3} from "./s3Client.js";



export const listFiles = async (prefix = "screenshots/") => {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET,
    Prefix: prefix,
  });
  const response = await s3.send(command);
  return response.Contents || [];
};




export const getFileUrl = async (key) => {

 
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
};




export const deleteFile = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  await s3.send(command);
};





export const getUploadPresignedUrl = async (fileName, fileType, userId, ) => {
  // const key = `screenshots/${Date.now()}_${fileName}`;


  const ts =  Date.now();
        const user_id = userId || "unknown";

        // Group uploads by date (YYYY-MM-DD)
        const date = new Date().toISOString().split("T")[0];

        const key = `screenshots/${user_id}/${date}/${ts}.jpg`;




  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: fileType,
  });

  // Wasabi-compatible signed URL
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 60s validity

  return { uploadUrl, key, ts };
};