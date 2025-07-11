import mongoose, { Document, Schema } from "mongoose";

export interface IServiceLike extends Document {
  service_id: mongoose.Schema.Types.ObjectId;
  user_id: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const serviceLikesSchema = new Schema<IServiceLike>(
  {
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "services",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export const service_likes = mongoose.model<IServiceLike>(
  "service_likes",
  serviceLikesSchema,
);
