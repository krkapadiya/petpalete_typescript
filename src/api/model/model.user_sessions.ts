import mongoose, { Document, Schema } from "mongoose";

export interface IUserSession extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  user_type: "user" | "admin";
  device_token: string;
  device_type: "ios" | "android" | "web";
  auth_token?: string;
  socket_id?: string;
  chat_room_id?: mongoose.Schema.Types.ObjectId;
  is_login: boolean;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSessionSchema = new Schema<IUserSession>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User id is required."],
    },
    user_type: {
      type: String,
      enum: ["user", "admin"],
      required: [true, "User type is required."],
    },
    device_token: {
      type: String,
      required: [true, "Device token is required."],
    },
    device_type: {
      type: String,
      enum: ["ios", "android", "web"],
      required: [true, "Device type is required."],
    },
    auth_token: {
      type: String,
    },
    socket_id: {
      type: String,
      default: null,
    },
    chat_room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat_rooms",
    },
    is_login: {
      type: Boolean,
      // enum: [true, false],
      default: false,
    },
    is_active: {
      type: Boolean,
      // enum: [true, false],
      default: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export const user_sessions = mongoose.model<IUserSession>(
  "user_sessions",
  userSessionSchema,
);
