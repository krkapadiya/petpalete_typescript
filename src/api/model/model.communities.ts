import mongoose, { Document, Schema } from "mongoose";

interface Location {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ICommunity extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  title?: string;
  location?: Location;
  address?: string;
  description?: string;
  is_deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const locationSchema = new Schema<Location>(
  {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: [true, "coordinates is required."], // [longitude, latitude]
    },
  },
  { _id: false },
);

const communitiesSchema = new Schema<ICommunity>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
    },
    location: {
      type: locationSchema,
    },
    address: {
      type: String,
    },
    description: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      // enum: [true, false],
      default: false, // true = deleted, false = not deleted
    },
  },
  { timestamps: true, versionKey: false },
);

communitiesSchema.index({ location: "2dsphere" });

export const communities = mongoose.model<ICommunity>(
  "communities",
  communitiesSchema,
);
