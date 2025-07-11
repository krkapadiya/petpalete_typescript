import mongoose, { Document, Schema } from "mongoose";

export interface IFaq extends Document {
  question: string;
  answer: string;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const faqSchema = new Schema<IFaq>(
  {
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
    is_active: {
      type: Boolean,
      // enum: [true, false],
      default: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export const faqs = mongoose.model<IFaq>("faqs", faqSchema);
