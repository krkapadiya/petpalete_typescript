export interface DeleteMessageData {
  success: boolean;
  data: {
    sender_id: string;
    receiver_id: string;
    chat_room_id: string;
    isLastMessage: boolean;
  };
}
