import mongoose, { Document, Schema } from "mongoose";

export interface IAppVersion extends Document {
  app_version: string;
  is_maintenance: boolean;
  app_update_status: "is_force_update" | "is_not_need";
  app_platform: "ios" | "android";
  app_url: string;
  api_base_url: string;
  is_live: boolean;
  is_deleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const appVersionSchema: Schema<IAppVersion> = new Schema(
  {
    app_version: {
      type: String,
      required: [true, "App version is required."],
    },
    is_maintenance: {
      type: Boolean,
      //   enum: [true, false],
      default: false,
    },
    app_update_status: {
      type: String,
      enum: ["is_force_update", "is_not_need"],
      default: "is_not_need",
    },
    app_platform: {
      type: String,
      enum: ["ios", "android"],
      required: [true, "App platform is required."],
    },
    app_url: {
      type: String,
      required: [true, "App URL is required."],
    },
    api_base_url: {
      type: String,
      required: [true, "API base URL is required."],
    },
    is_live: {
      type: Boolean,
      //   enum: [true, false],
      default: true,
    },
    is_deleted: {
      type: Boolean,
      //   enum: [true, false],
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const app_versions = mongoose.model<IAppVersion>(
  "app_versions",
  appVersionSchema,
);
