import {
  S3Client,
  ObjectCannedACL,
  PutObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

if (
  !process.env.REGION ||
  !process.env.ACCESSKEYID ||
  !process.env.SECRETACCESSKEY
) {
  throw new Error("Missing AWS S3 environment variables in .env file");
}

export const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
  useAccelerateEndpoint: false,
});

export {
  PutObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
};
