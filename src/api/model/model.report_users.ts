import mongoose, { Document, Schema } from "mongoose";

export interface IReportUser extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  reported_user_id: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const reportUsersSchema = new Schema<IReportUser>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    reported_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true, versionKey: false },
);

export const report_users = mongoose.model<IReportUser>(
  "report_users",
  reportUsersSchema,
);
