"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chats = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const mediaFileSchema = new mongoose_1.Schema({
    file_type: {
        type: String,
        enum: ["image", "video"],
        required: [true, "File type is required."],
    },
    file_name: {
        type: String,
    },
    file_path: {
        type: String,
    },
    thumbnail: {
        type: String,
        default: null,
    },
}, { _id: false });
// Main schema
const chatSchema = new mongoose_1.Schema({
    chat_room_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "chat_rooms",
        required: true,
    },
    sender_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    receiver_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    message_time: {
        type: Date,
        default: Date.now,
    },
    message: String,
    message_type: {
        type: String,
        enum: ["text", "media"],
        required: true,
    },
    media_file: [mediaFileSchema], // ✅ correct array of subdocuments
    is_read: {
        type: Boolean,
        default: false,
    },
    is_edited: {
        type: Boolean,
        default: false,
    },
    is_delete_by: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "users",
        },
    ],
    is_delete_everyone: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true, versionKey: false });
exports.chats = mongoose_1.default.model("chats", chatSchema);
