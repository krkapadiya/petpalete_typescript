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
