import mongoose, { Schema } from "mongoose";

export interface IUserReview extends mongoose.Document {
  user_id: mongoose.Schema.Types.ObjectId;
  reviewed_user_id: mongoose.Schema.Types.ObjectId;
  rating: number;
  review?: string;
}

const reviewSchema = new Schema<IUserReview>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    reviewed_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
    },
    review: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);

export const user_reviews = mongoose.model<IUserReview>(
  "user_reviews",
  reviewSchema,
);
