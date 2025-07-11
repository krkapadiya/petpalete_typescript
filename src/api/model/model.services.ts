import mongoose, { Schema, Document } from "mongoose";

interface Location {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IService extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  service_name?: string;
  location?: Location;
  address?: string;
  description?: string;
  price?: number;
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

const servicesSchema = new Schema<IService>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    service_name: {
      type: String,
    },
    location: {
      type: locationSchema,
    },
    address: {
      type: String,
    },
    price: {
      type: Number,
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
export const services = mongoose.model<IService>("services", servicesSchema);

servicesSchema.index({ location: "2dsphere" });
