import mongoose, { Document, Schema } from "mongoose";

export interface IServiceAlbum extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  service_id: mongoose.Schema.Types.ObjectId;
  album_type: "image" | "video";
  album_thumbnail?: string;
  album_path: string;
}

const serviceAlbumSchema = new Schema<IServiceAlbum>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "services",
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
export const service_albums = mongoose.model<IServiceAlbum>(
  "service_albums",
  serviceAlbumSchema,
);
