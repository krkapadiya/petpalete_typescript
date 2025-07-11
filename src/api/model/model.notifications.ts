import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  sender_id: mongoose.Types.ObjectId;
  receiver_id?: mongoose.Types.ObjectId | null;
  receiver_ids?: mongoose.Types.ObjectId[];
  noti_title: string;
  noti_msg?: string;
  noti_for?:
    | "chat_notification"
    | "new_review"
    | "new_pet"
    | "new_service"
    | "new_community"
    | "pet_published";
  chat_room_id?: mongoose.Types.ObjectId;
  chat_id?: mongoose.Types.ObjectId;
  review_id?: mongoose.Types.ObjectId;
  pet_id?: mongoose.Types.ObjectId;
  service_id?: mongoose.Types.ObjectId;
  community_id?: mongoose.Types.ObjectId;
  noti_date: Date;
  deleted_by_user?: mongoose.Types.ObjectId[];
  is_deleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema: Schema<INotification> = new Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    receiver_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat_rooms",
    },
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chats",
    },
    review_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_reviews",
    },
    pet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pets",
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "services",
    },
    community_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "communities",
    },
    noti_date: {
      type: Date,
      default: Date.now,
      required: [true, "Notification date is required."],
    },
    deleted_by_user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    is_deleted: {
      type: Boolean,
      //   enum: [true, false],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

export const notifications = mongoose.model<INotification>(
  "notifications",
  notificationSchema,
);
