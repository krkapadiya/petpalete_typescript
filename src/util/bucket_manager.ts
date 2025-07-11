import fs from "fs";
import path from "path";
import {
  s3Client,
  ObjectCannedACL,
  PutObjectCommand,
  DeleteObjectCommand,
} from "../config/bucket_config";

interface MediaFile {
  originalFilename: string;
  path: string;
}

interface UploadResult {
  status: boolean;
  file_name: string | null;
}

const uploadMediaIntoS3Bucket = async (
  media_file: MediaFile,
  folder_name: string,
  content_type: string,
): Promise<UploadResult> => {
  try {
    let contentType = content_type;
    let file_extension = media_file.originalFilename
      .split(".")
      .pop()
      ?.toLowerCase();

    if (!file_extension) throw new Error("Invalid file extension");

    if (file_extension === "avif") {
      file_extension = "jpg";
      contentType = "image/jpeg";
    } else if (file_extension === "mov") {
      file_extension = "mp4";
      contentType = "video/mp4";
    }

    const file_name = `${Math.floor(1000 + Math.random() * 8000)}_${Date.now()}.${file_extension}`;
    const oldPath = media_file.path;
    const newPath = `${process.env.BUCKET_ENV}${folder_name}/${file_name}`;

    const fileStream = fs.createReadStream(oldPath);

    const params = {
      Bucket: process.env.BUCKET_NAME!,
      Key: newPath,
      Body: fileStream,
      ContentType: contentType,
      ACL: "private" as ObjectCannedACL,
    };

    const uploadCommand = new PutObjectCommand(params);
    const uploaded = await s3Client.send(uploadCommand);

    return {
      status: Boolean(uploaded),
      file_name: uploaded ? file_name : null,
    };
  } catch (error) {
    console.error("Error in uploadMediaIntoS3Bucket:", error);
    return { status: false, file_name: null };
  }
};

const removeMediaFromS3Bucket = async (
  media_file: string,
): Promise<UploadResult> => {
  try {
    const params = {
      Bucket: process.env.BUCKET_NAME!,
      Key: `${process.env.BUCKET_ENV}${media_file}`,
    };

    const command = new DeleteObjectCommand(params);
    const data = await s3Client.send(command);

    return {
      status: Boolean(data),
      file_name: null,
    };
  } catch (error) {
    console.error("Error in removeMediaFromS3Bucket:", error);
    return { status: false, file_name: null };
  }
};

export { ObjectCannedACL } from "@aws-sdk/client-s3";

export { uploadMediaIntoS3Bucket, removeMediaFromS3Bucket };
