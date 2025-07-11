import mongoose, { Document, Schema } from "mongoose";

export interface ICommunityAlbum extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  community_id: mongoose.Schema.Types.ObjectId;
  album_type: "image" | "video";
  album_thumbnail?: string;
  album_path: string;
}

const communitiesAlbumSchema = new Schema<ICommunityAlbum>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    community_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "communities",
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

export const communities_albums = mongoose.model<ICommunityAlbum>(
  "communities_albums",
  communitiesAlbumSchema,
);
