import mongoose, { Schema, Document } from "mongoose";

export interface IAlbum extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  album_type: "image" | "video";
  album_thumbnail?: string;
  album_path: string;
}

const albumSchema = new Schema<IAlbum>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    album_type: {
      type: String,
      enum: ["image", "video"],
    },
    album_thumbnail: {
      type: String,
      default: null,
    },
    album_path: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);
export const user_albums = mongoose.model<IAlbum>("user_albums", albumSchema);
