"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/database.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
    throw new Error("MONGO_URL is not defined in environment variables");
}
const connection = mongoose_1.default.connect(MONGO_URL);
connection
    .then(() => console.log("MongoDB is connected"))
    // .then(() => console.log("Connected to DB:", mongoose.connection.name))
    .catch((err) => console.error("MongoDB connection error:", err));
exports.default = connection;
