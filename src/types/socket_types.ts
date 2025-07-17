import { Socket } from "socket.io";

export interface DeleteMessageData {
  success: boolean;
  data: {
    sender_id: string;
    receiver_id: string;
    chat_room_id: string;
    isLastMessage: boolean;
  };
}

export interface SocketUser {
  _id: string;
  is_blocked_by_admin: boolean;
  is_deleted: boolean;
  token: string;
}

export interface SocketWithUser extends Socket {
  user: SocketUser;
}

export interface CreateRoomData {
  user_id: string;
  other_user_id: string;
  ln?: string;
}

export interface SendMessageData {
  sender_id: string;
  chat_room_id: string;
  receiver_id: string;
  message: string;
  message_type: string;
  media_file: MediaFileData[];
  ln?: string;
}

export interface MediaFileData {
  file_type: "video" | "image";
  file_name: string;
  file_path: string;
  thumbnail?: string | null;
  thumbnail_name?: string | null;
}

export interface ChatInsertData {
  chat_room_id: string;
  sender_id: string;
  receiver_id: string;
  message_time: string;
  message: string;
  message_type: string;
  media_file?: MediaFileData[];
  is_read?: boolean;
}

export interface NotiData {
  device_token: string[];
  noti_title: string;
  noti_msg: string;
  noti_for: string;
  id: string;
  noti_image?: string;
  chat_room_id?: string;
  sender_id?: string;
  sound_name: string;
}

export interface getAllMessageData {
  chat_room_id: string;
  user_id: string;
  ln?: string;
  page?: number;
  limit?: number;
}

export interface editMessageData {
  chat_id: string;
  chat_room_id: string;
  user_id: string;
  message: string;
  ln?: string;
}

export interface deleteMessageData {
  chat_room_id: string;
  chat_id: string;
  user_id: string;
  sender_id: string;
  receiver_id: string;
  ln?: string;
}

export interface readMessageData {
  chat_room_id: string;
  user_id: string;
  ln?: string;
}

export interface chatUserListData {
  user_id: string;
  search?: string;
  page?: number;
  limit?: number;
  ln?: string;
}

export interface updatedChatRoom {
  chat_room_id: string;
  user_id: string;
  ln?: string;
}

export interface deleteChatRoomData {
  chat_room_id: string;
  user_id: string;
  ln?: string;
}
export interface chatUserListData {
  user_id: string;
  search?: string;
  page?: number;
  limit?: number;
  ln?: string;
}
export interface changeScreenStatusData {
  user_id: string;
  screen_status: string | boolean;
  chat_room_id: string;
  socket_id: string;
  ln?: string;
}
