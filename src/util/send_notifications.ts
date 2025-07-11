import axios from "axios";
import * as firebase_admin from "firebase-admin";
import { google } from "googleapis";
import { ServiceAccount } from "firebase-admin";

import serviceAccountData from "./../../serviceAccount.json";

const projectId = process.env.PROJECT_ID || "your-project-id";

// Manually map snake_case to camelCase to satisfy ServiceAccount type
const serviceAccount: ServiceAccount = {
  clientEmail: serviceAccountData.client_email,
  privateKey: serviceAccountData.private_key,
  projectId: serviceAccountData.project_id,
};

async function getAccessToken(): Promise<string> {
  const scopes = ["https://www.googleapis.com/auth/firebase.messaging"];
  const jwtClient = new google.auth.JWT({
    email: serviceAccount.clientEmail,
    key: serviceAccount.privateKey,
    scopes,
  });

  return new Promise((resolve, reject) => {
    jwtClient.authorize((err, tokens) => {
      if (err || !tokens?.access_token) {
        reject(err || new Error("Failed to retrieve access token"));
        return;
      }
      resolve(tokens.access_token);
    });
  });
}

firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert(serviceAccount),
});

const subscribeToTopic = async (
  deviceTokens: string[],
  topic: string,
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    const response = await firebase_admin
      .messaging()
      .subscribeToTopic(deviceTokens, topic);
    console.log(
      `Successfully subscribed ${response.successCount} tokens to topic: ${topic}`,
    );
    return { success: true, count: response.successCount };
  } catch (error: any) {
    console.log("Error subscribing to topic:", error.message);
    return { success: false, error: error.message };
  }
};

const unsubscribeFromTopic = async (
  deviceTokens: string[],
  topic: string,
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    const response = await firebase_admin
      .messaging()
      .unsubscribeFromTopic(deviceTokens, topic);
    console.log(
      `Successfully unsubscribed ${response.successCount} tokens from topic: ${topic}`,
    );
    if (response.failureCount > 0) {
      console.log(
        `Failed to unsubscribe ${response.failureCount} tokens from topic: ${topic}`,
      );
    }
    return { success: true, count: response.successCount };
  } catch (error: any) {
    console.log("Error unsubscribing from topic:", error.message);
    return { success: false, error: error.message };
  }
};

export const singleNotificationSend = async (notification_data: {
  device_token: string;
  noti_title: string;
  noti_msg: string;
  noti_for: string;
  id: string;
  noti_image?: string;
  details?: string;
  sound_name: string;
}) => {
  const accessToken = await getAccessToken();
  const {
    device_token,
    noti_title,
    noti_msg,
    noti_for,
    id,
    noti_image,
    details,
    sound_name,
  } = notification_data;

  const messageBody: Record<string, any> = {
    title: noti_title,
    body: noti_msg,
    noti_for,
    id,
    sound: `${sound_name}.caf`,
  };

  if (details) messageBody.details = details;

  const noti_payload: Record<string, any> = {
    title: noti_title,
    body: noti_msg,
  };

  if (noti_image) noti_payload.image = noti_image;

  const message = {
    message: {
      token: device_token,
      notification: noti_payload,
      data: messageBody,
    },
  };

  try {
    return await axios.post(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      message,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: any) {
    console.error("Error sending notification:", error.message);
    return null;
  }
};

export const multiNotificationSend = async (notification_data: {
  device_token: string[];
  noti_title: string;
  noti_msg: string;
  noti_for: string;
  id: string;
  noti_image?: string;
  chat_room_id?: string;
  sender_id?: string;
  sound_name: string;
}) => {
  const accessToken = await getAccessToken();
  const {
    device_token,
    noti_title,
    noti_msg,
    noti_for,
    id,
    noti_image,
    chat_room_id,
    sender_id,
    sound_name,
  } = notification_data;

  const topic = `${Math.floor(1000 + Math.random() * 8999)}_${Date.now()}`;

  if (!Array.isArray(device_token) || device_token.length === 0) {
    return {
      success: false,
      message: "Device token must be a non-empty array.",
    };
  }

  const subscribeResult = await subscribeToTopic(device_token, topic);
  if (!subscribeResult.success) {
    return {
      success: false,
      message: "Subscription failed",
      error: subscribeResult.error,
    };
  }

  const messageBody: Record<string, any> = {
    title: noti_title,
    body: noti_msg,
    noti_for,
    id,
    chat_room_id: chat_room_id || "",
    sender_id: sender_id || "",
  };

  const noti_payload: Record<string, any> = {
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
          sound:
            sound_name?.toLowerCase() === "none" ? "" : `${sound_name}.wav`,
          channel_id:
            sound_name?.toLowerCase() === "none" ? "none" : sound_name,
        },
      },
      apns: {
        payload: {
          aps: {
            sound:
              sound_name?.toLowerCase() === "none" ? "" : `${sound_name}.caf`,
          },
        },
      },
    },
  };

  try {
    await axios.post(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      message,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Notification sent to topic:", topic);
  } catch (error: any) {
    console.error("Error sending notification to topic", error.message);
  }

  const unsubscribeResult = await unsubscribeFromTopic(device_token, topic);
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
};
