import mongoose, { Document, Schema } from "mongoose";

export interface IContent extends Document {
  content_type: "terms_and_condition" | "privacy_policy" | "about";
  content: string;
  is_deleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const contentSchema = new Schema<IContent>(
  {
    content_type: {
      type: String,
      enum: ["terms_and_condition", "privacy_policy", "about"],
      required: [true, "Content type is required."],
    },
    content: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false, // ✅ fixed
    },
  },
  { timestamps: true, versionKey: false },
);

export const app_contents = mongoose.model<IContent>(
  "app_contents",
  contentSchema,
);
