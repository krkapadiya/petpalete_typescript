import mongoose, { Schema, Document } from "mongoose";

interface Location {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IGuestSession extends Document {
  device_token: string;
  device_type: "ios" | "android" | "web";
  location?: Location;
  address?: string;
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

const guestSessionSchema = new Schema<IGuestSession>(
  {
    device_token: {
      type: String,
      required: [true, "Device token is required."],
    },
    device_type: {
      type: String,
      enum: ["ios", "android", "web"],
      required: [true, "Device type is required."],
    },
    location: {
      type: locationSchema,
    },
    address: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);

guestSessionSchema.index({ location: "2dsphere" });

export const guests = mongoose.model<IGuestSession>(
  "guests",
  guestSessionSchema,
);
