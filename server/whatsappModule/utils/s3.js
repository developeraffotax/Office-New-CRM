import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getS3 } from "../../utils/s3/s3Client.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";










export const getFileUrl = async (key) => {

 
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  return await getSignedUrl(getS3(), command, { expiresIn: 3600 });
};
