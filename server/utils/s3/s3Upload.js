 
import multer from "multer";
import multerS3 from "multer-s3";
import {s3} from "./s3Client.js"
 

// Configure multer to use S3 storage
export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname, });
    },

    key: (req, file, cb) => {
      try {
        const ts = req.uploadTimestamp || Date.now();
        const userId = req?.user?.user?._id || "unknown";

        // Group uploads by date (YYYY-MM-DD)
        const date = new Date().toISOString().split("T")[0];

        const key = `screenshots/${userId}/${date}/${ts}.jpg`;
        cb(null, key);
      } catch (err) {
        cb(err);
      }
    },
  }),

  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB limit
});