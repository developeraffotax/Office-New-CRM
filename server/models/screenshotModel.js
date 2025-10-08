 import mongoose from 'mongoose';
 const ScreenshotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', index: true },
//  email: { type: String, index: true },
//  deviceId: { type: String, index: true },
 timestamp: { type: Date, index: true },
//  activeWindow: String,
//  app: String,
 s3Key: String,
 s3Url: String
 }, { timestamps: true });
 export default mongoose.model('Screenshot', ScreenshotSchema);