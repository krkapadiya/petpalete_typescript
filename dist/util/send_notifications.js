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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiNotificationSend = exports.singleNotificationSend = void 0;
const axios_1 = __importDefault(require("axios"));
const firebase_admin = __importStar(require("firebase-admin"));
const googleapis_1 = require("googleapis");
const serviceAccount_json_1 = __importDefault(require("./../../serviceAccount.json"));
const projectId = process.env.PROJECT_ID || "your-project-id";
// Manually map snake_case to camelCase to satisfy ServiceAccount type
const serviceAccount = {
    clientEmail: serviceAccount_json_1.default.client_email,
    privateKey: serviceAccount_json_1.default.private_key
        .replace(/\n/g, "\n")
        .replace(/\\n/g, "\n"),
    projectId: serviceAccount_json_1.default.project_id,
};
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const scopes = ["https://www.googleapis.com/auth/firebase.messaging"];
        const jwtClient = new googleapis_1.google.auth.JWT({
            email: serviceAccount.clientEmail,
            key: serviceAccount.privateKey,
            scopes,
        });
        return new Promise((resolve, reject) => {
            jwtClient.authorize((err, tokens) => {
                if (err || !(tokens === null || tokens === void 0 ? void 0 : tokens.access_token)) {
                    reject(err || new Error("Failed to retrieve access token"));
                    return;
                }
                resolve(tokens.access_token);
            });
        });
    });
}
firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
});
const subscribeToTopic = (deviceTokens, topic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield firebase_admin
            .messaging()
            .subscribeToTopic(deviceTokens, topic);
        console.log(`Successfully subscribed ${response.successCount} tokens to topic: ${topic}`);
        return { success: true, count: response.successCount };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log("Error subscribing to topic:", errorMessage);
        return { success: false, error: errorMessage };
    }
});
const unsubscribeFromTopic = (deviceTokens, topic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield firebase_admin
            .messaging()
            .unsubscribeFromTopic(deviceTokens, topic);
        console.log(`Successfully unsubscribed ${response.successCount} tokens from topic: ${topic}`);
        if (response.failureCount > 0) {
            console.log(`Failed to unsubscribe ${response.failureCount} tokens from topic: ${topic}`);
        }
        return { success: true, count: response.successCount };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log("Error unsubscribing from topic:", errorMessage);
        return { success: false, error: errorMessage };
    }
});
const singleNotificationSend = (notification_data) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = yield getAccessToken();
    const { device_token, noti_title, noti_msg, noti_for, id, noti_image, details, sound_name, } = notification_data;
    const messageBody = {
        title: noti_title,
        body: noti_msg,
        noti_for,
        id,
        sound: `${sound_name}.caf`,
    };
    if (details)
        messageBody.details = details;
    const noti_payload = {
        title: noti_title,
        body: noti_msg,
    };
    if (noti_image)
        noti_payload.image = noti_image;
    const message = {
        message: {
            token: device_token,
            notification: noti_payload,
            data: messageBody,
        },
    };
    try {
        return yield axios_1.default.post(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, message, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error sending notification:", errorMessage);
        return null;
    }
});
exports.singleNotificationSend = singleNotificationSend;
const multiNotificationSend = (notification_data) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = yield getAccessToken();
    const { device_token, noti_title, noti_msg, noti_for, id, noti_image, chat_room_id, sender_id, sound_name, } = notification_data;
    const topic = `${Math.floor(1000 + Math.random() * 8999)}_${Date.now()}`;
    if (!Array.isArray(device_token) || device_token.length === 0) {
        return {
            success: false,
            message: "Device token must be a non-empty array.",
        };
    }
    const subscribeResult = yield subscribeToTopic(device_token, topic);
    if (!subscribeResult.success) {
        return {
            success: false,
            message: "Subscription failed",
            error: subscribeResult.error,
        };
    }
    const messageBody = {
        title: noti_title,
        body: noti_msg,
        noti_for,
        id,
        chat_room_id: chat_room_id || "",
        sender_id: sender_id || "",
    };
    const noti_payload = {
        title: noti_title,
        body: noti_msg,
        image: noti_image,
    };
    const message = {
        message: {
            topic,
            notification: noti_payload,
            data: messageBody,
            android: {
                notification: {
                    sound: (sound_name === null || sound_name === void 0 ? void 0 : sound_name.toLowerCase()) === "none" ? "" : `${sound_name}.wav`,
                    channel_id: (sound_name === null || sound_name === void 0 ? void 0 : sound_name.toLowerCase()) === "none" ? "none" : sound_name,
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: (sound_name === null || sound_name === void 0 ? void 0 : sound_name.toLowerCase()) === "none" ? "" : `${sound_name}.caf`,
                    },
                },
            },
        },
    };
    try {
        yield axios_1.default.post(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, message, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Notification sent to topic:", topic);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error sending notification to topic", errorMessage);
    }
    const unsubscribeResult = yield unsubscribeFromTopic(device_token, topic);
    if (!unsubscribeResult.success) {
        return {
            success: false,
            message: "Unsubscription failed",
            error: unsubscribeResult.error,
        };
    }
    return {
        success: true,
        message: "Notification sent and tokens unsubscribed",
    };
});
exports.multiNotificationSend = multiNotificationSend;
