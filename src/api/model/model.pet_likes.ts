import mongoose, { Document, Schema } from "mongoose";

export interface IPetLike extends Document {
  pet_id: mongoose.Schema.Types.ObjectId;
  user_id: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const petLikesSchema = new Schema<IPetLike>(
  {
    pet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pets",
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

export const pet_likes = mongoose.model<IPetLike>("pet_likes", petLikesSchema);
