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
exports.notifications = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const notificationSchema = new mongoose_1.Schema({
    sender_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    receiver_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    receiver_ids: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "users",
        },
    ],
    noti_title: {
        type: String,
        required: true,
    },
    noti_msg: {
        type: String,
    },
    noti_for: {
        type: String,
        enum: [
            "chat_notification",
            "new_review",
            "new_pet",
            "new_service",
            "new_community",
            "pet_published",
        ],
    },
    chat_room_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "chat_rooms",
    },
    chat_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "chats",
    },
    review_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user_reviews",
    },
    pet_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "pets",
    },
    service_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "services",
    },
    community_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "communities",
    },
    noti_date: {
        type: Date,
        default: Date.now,
        required: [true, "Notification date is required."],
    },
    deleted_by_user: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "users",
        },
    ],
    is_deleted: {
        type: Boolean,
        //   enum: [true, false],
        default: false,
    },
}, { timestamps: true, versionKey: false });
exports.notifications = mongoose_1.default.model("notifications", notificationSchema);
