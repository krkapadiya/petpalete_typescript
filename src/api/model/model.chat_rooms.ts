import mongoose, { Document, Schema } from "mongoose";

interface IChatRoom extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  other_user_id: mongoose.Schema.Types.ObjectId;
  is_delete_by: mongoose.Schema.Types.ObjectId[];
  is_deleted: boolean;
}

const chatRoomSchema = new Schema<IChatRoom>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User id is required."],
    },
    other_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Other user id is required."],
    },
    is_delete_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    is_deleted: {
      type: Boolean,
      // enum: [true, false],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

export const chat_rooms = mongoose.model<IChatRoom>(
  "chat_rooms",
  chatRoomSchema,
);
