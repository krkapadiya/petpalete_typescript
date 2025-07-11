import mongoose, { Document, Schema } from "mongoose";

export interface IEmailVerification extends Document {
  email_address: string;
  otp: number | null; // OTP can be null if not set
  is_email_verified: boolean; // true = verified, false = not verified
  is_deleted: boolean; // true = deleted, false = not deleted
  createdAt?: Date;
  updatedAt?: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>(
  {
    email_address: {
      type: String,
      trim: true,
      lowercase: true,
      // validate: {
      //   validator: function (v) {
      //     return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      //   },
      //   message: "Your email is not valid please enter the correct email",
      // },
      required: [true, "Email address is required."],
    },
    otp: {
      type: Number,
      length: [4, "OTP must be 4 digit."],
      default: null,
    },
    is_email_verified: {
      type: Boolean,
      // enum: [true, false],
      default: false, // true = verified, false = not verified
    },
    is_deleted: {
      type: Boolean,
      // enum: [true, false],
      default: false, // true = deleted, false = not deleted
    },
  },
  { timestamps: true, versionKey: false },
);
export const email_verifications = mongoose.model<IEmailVerification>(
  "email_verifications",
  emailVerificationSchema,
);
