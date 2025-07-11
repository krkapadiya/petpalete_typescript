"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectCannedACL = exports.GetObjectCommand = exports.DeleteObjectCommand = exports.DeleteObjectsCommand = exports.PutObjectCommand = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
Object.defineProperty(exports, "ObjectCannedACL", { enumerable: true, get: function () { return client_s3_1.ObjectCannedACL; } });
Object.defineProperty(exports, "PutObjectCommand", { enumerable: true, get: function () { return client_s3_1.PutObjectCommand; } });
Object.defineProperty(exports, "DeleteObjectsCommand", { enumerable: true, get: function () { return client_s3_1.DeleteObjectsCommand; } });
Object.defineProperty(exports, "DeleteObjectCommand", { enumerable: true, get: function () { return client_s3_1.DeleteObjectCommand; } });
Object.defineProperty(exports, "GetObjectCommand", { enumerable: true, get: function () { return client_s3_1.GetObjectCommand; } });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.REGION ||
    !process.env.ACCESSKEYID ||
    !process.env.SECRETACCESSKEY) {
    throw new Error("Missing AWS S3 environment variables in .env file");
}
exports.s3Client = new client_s3_1.S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY,
    },
    useAccelerateEndpoint: false,
});
