import mongoose, { Schema, Document, Types } from "mongoose";

interface IMediaFile {
  file_type: "image" | "video";
  file_name?: string;
  file_path?: string;
  thumbnail?: string | null;
}

const mediaFileSchema = new Schema<IMediaFile>(
  {
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
  },
  { _id: false }, // Prevent Mongoose from creating _id for subdocuments
);

// Main chat schema interface
interface IChat extends Document {
  chat_room_id: Types.ObjectId;
  sender_id: Types.ObjectId;
  receiver_id: Types.ObjectId;
  message_time?: Date;
  message?: string;
  message_type: "text" | "media";
  media_file: IMediaFile[];
  is_read?: boolean;
  is_edited?: boolean;
  is_delete_by?: Types.ObjectId[];
  is_delete_everyone?: boolean;
}

// Main schema
const chatSchema = new Schema<IChat>(
  {
    chat_room_id: {
      type: Schema.Types.ObjectId,
      ref: "chat_rooms",
      required: true,
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    is_delete_everyone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

export const chats = mongoose.model<IChat>("chats", chatSchema);
