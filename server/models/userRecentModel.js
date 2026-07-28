import mongoose from "mongoose";
const { Schema } = mongoose;

const userRecentSchema = new mongoose.Schema({
    owner: {
        type: Schema.Types.ObjectId, // logged-in user
        ref: "Users",
        required: true
    },
    module: {
        type: String,
        enum: ["task", "job", "lead", "ticket", "inbox", "whatsapp", ],
        required: true
    },
    targetUser: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    lastUsedAt: {
        type: Date,
        default: Date.now
    }
});

userRecentSchema.index({ owner: 1, module: 1, targetUser: 1 }, { unique: true });

export default mongoose.model("UserRecent", userRecentSchema);