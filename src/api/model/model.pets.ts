import mongoose, { Schema, Document, Types } from "mongoose";

interface Location {
  type: "Point";
  coordinates: [number, number];
}

export interface IPet extends Document {
  user_id: Types.ObjectId;
  pet_name?: string;
  pet_type: string;
  pet_breed?: string;
  location?: Location;
  address?: string;
  gender: "male" | "female" | "both";
  price?: number;
  description?: string;
  is_adopted: boolean;
  is_deleted?: boolean;
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

const petsSchema = new Schema<IPet>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    pet_name: {
      type: String,
    },
    pet_type: {
      type: String,
      // enum: ["dog", "cat", "reptiles_and_house_pets", "farm_animals", "fish", "horse"],
    },
    pet_breed: {
      type: String,
    },
    location: {
      type: locationSchema,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "both"],
    },
    price: {
      type: Number,
    },
    description: {
      type: String,
    },
    is_adopted: {
      type: Boolean,
      // enum: [true, false],
      default: false, // true = deleted, false = not deleted
    },
    is_deleted: {
      type: Boolean,
      // enum: [true, false],
      default: false, // true = deleted, false = not deleted
    },
  },
  { timestamps: true, versionKey: false },
);

export const pets = mongoose.model<IPet>("pets", petsSchema);

petsSchema.index({ location: "2dsphere" });
