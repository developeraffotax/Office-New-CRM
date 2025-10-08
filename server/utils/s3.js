// import AWS from "aws-sdk";
// import multer from "multer";
// import multerS3 from "multer-s3";

// const endpoint = new AWS.Endpoint(
//   process.env.WASABI_ENDPOINT || "https://s3.wasabisys.com"
// );

// const s3 = new AWS.S3({
//   endpoint,
//   region: process.env.AWS_REGION,
//   accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
//   secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
//   s3ForcePathStyle: true,
//   signatureVersion: "v4",
// });



// export const upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: process.env.S3_BUCKET,
//     contentType: multerS3.AUTO_CONTENT_TYPE,

//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },

//     key: (req, file, cb) => {
//       try {
//         const ts = req.uploadTimestamp || Date.now();
//         const userId = req?.user?.user?._id || "unknown";

//         // Optional: group uploads by date for better organization
//         const date = new Date().toISOString().split("T")[0]; // e.g., 2025-10-08

//         const key = `screenshots/${userId}/${date}/${ts}.jpg`;
//         cb(null, key);
//       } catch (err) {
//         cb(err);
//       }
//     },
//   }),

//   limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max
// });


import multer from "multer";
import path from "path";
import fs from "fs";

// Base upload directory
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "screenshots");

// Ensure the main upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const userId = req?.user?.user?._id || "unknown";
      const userDir = path.join(UPLOAD_DIR, userId);

      // Ensure user-specific subdirectory exists
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      cb(null, userDir);
    } catch (err) {
      cb(err);
    }
  },

  filename: (req, file, cb) => {
    const ts = req.uploadTimestamp || Date.now();
    cb(null, `${ts}.jpg`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB limit
});