import mongoose, { Document, Schema } from "mongoose";

export interface IPetAlbum extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  pet_id: mongoose.Schema.Types.ObjectId;
  album_type: "image" | "video";
  album_thumbnail?: string;
  album_path: string;
}

const petAlbumSchema = new Schema<IPetAlbum>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    pet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pets",
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

export const pet_albums = mongoose.model<IPetAlbum>(
  "pet_albums",
  petAlbumSchema,
);
