// src/config/database.ts
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL as string;

if (!MONGO_URL) {
  throw new Error("MONGO_URL is not defined in environment variables");
}

const connection = mongoose.connect(MONGO_URL);

connection
  .then(() => console.log("MongoDB is connected"))
  // .then(() => console.log("Connected to DB:", mongoose.connection.name))
  .catch((err) => console.error("MongoDB connection error:", err));

export default connection;
