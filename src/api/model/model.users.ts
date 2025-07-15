import mongoose, { Document, Schema, Types } from "mongoose";

interface Location {
  type: "Point";
  coordinates: [number, number];
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  user_type: "user" | "admin";
  full_name?: string;
  email_address: string;
  mobile_number?: number;
  country_code?: string;
  country_string_code?: string;
  password?: string | null;
  is_social_login: boolean;
  social_id?: string | null;
  social_platform?: "google" | "facebook" | "apple" | null;
  notification_badge: number;
  location?: Location;
  address?: string;
  customer_id?: string;
  is_user_verified: boolean;
  is_blocked_by_admin: boolean;
  is_deleted: boolean;
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
      required: [true, "coordinates is required."],
    },
  },
  { _id: false },
);

const usersSchema = new Schema<IUser>(
  {
    user_type: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: [true, "User type is required."],
    },
    full_name: {
      type: String,
    },
    email_address: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email address is required."],
    },
    mobile_number: {
      type: Number,
    },
    country_code: {
      type: String,
    },
    country_string_code: {
      type: String,
    },
    password: {
      type: String,
      default: null,
    },
    is_social_login: {
      type: Boolean,
      default: false,
    },
    social_id: {
      type: String,
      default: null,
    },
    social_platform: {
      type: String,
      enum: ["google", "facebook", "apple", null],
      default: null,
    },
    notification_badge: {
      type: Number,
      default: 0,
    },
    location: {
      type: locationSchema,
    },
    address: {
      type: String,
    },
    customer_id: {
      type: String,
    },
    is_user_verified: {
      type: Boolean,
      default: false,
    },
    is_blocked_by_admin: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

usersSchema.index({ location: "2dsphere" });

export const users = mongoose.model<IUser>("users", usersSchema);
