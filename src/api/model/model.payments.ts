import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  pet_id: mongoose.Schema.Types.ObjectId;
  payment_id?: string;
  transaction_id?: string;
  payment_method: "apple_pay" | "google_pay" | "card";
  payment_status: "success" | "fail";
  amount?: number;
  payment_date: Date;
  is_deleted?: boolean;
}

const paymentsSchema = new Schema<IPayment>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    pet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pets",
      required: true,
    },
    payment_id: {
      type: String,
    },
    transaction_id: {
      type: String,
    },
    payment_method: {
      type: String,
      enum: ["apple_pay", "google_pay", "card"],
    },
    payment_status: {
      type: String,
      enum: ["success", "fail"],
    },
    amount: {
      type: Number,
    },
    payment_date: {
      type: Date,
      default: Date.now,
      required: [true, "Payment date is required."],
    },
    is_deleted: {
      type: Boolean,
      // enum: [true, false],
      default: false, // true = deleted, false = not deleted
    },
  },
  { timestamps: true, versionKey: false },
);

export const payments = mongoose.model<IPayment>("payments", paymentsSchema);
