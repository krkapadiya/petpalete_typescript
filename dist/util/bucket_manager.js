"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMediaFromS3Bucket = exports.uploadMediaIntoS3Bucket = exports.ObjectCannedACL = void 0;
const fs_1 = __importDefault(require("fs"));
const bucket_config_1 = require("../config/bucket_config");
const uploadMediaIntoS3Bucket = (media_file, folder_name, content_type) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let contentType = content_type;
        let file_extension = (_a = media_file.originalFilename
            .split(".")
            .pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (!file_extension)
            throw new Error("Invalid file extension");
        if (file_extension === "avif") {
            file_extension = "jpg";
            contentType = "image/jpeg";
        }
        else if (file_extension === "mov") {
            file_extension = "mp4";
            contentType = "video/mp4";
        }
        const file_name = `${Math.floor(1000 + Math.random() * 8000)}_${Date.now()}.${file_extension}`;
        const oldPath = media_file.path;
        const newPath = `${process.env.BUCKET_ENV}${folder_name}/${file_name}`;
        const fileStream = fs_1.default.createReadStream(oldPath);
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: newPath,
            Body: fileStream,
            ContentType: contentType,
            ACL: "private",
        };
        const uploadCommand = new bucket_config_1.PutObjectCommand(params);
        const uploaded = yield bucket_config_1.s3Client.send(uploadCommand);
        return {
            status: Boolean(uploaded),
            file_name: uploaded ? file_name : null,
        };
    }
    catch (error) {
        console.error("Error in uploadMediaIntoS3Bucket:", error);
        return { status: false, file_name: null };
    }
});
exports.uploadMediaIntoS3Bucket = uploadMediaIntoS3Bucket;
const removeMediaFromS3Bucket = (media_file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${process.env.BUCKET_ENV}${media_file}`,
        };
        const command = new bucket_config_1.DeleteObjectCommand(params);
        const data = yield bucket_config_1.s3Client.send(command);
        return {
            status: Boolean(data),
            file_name: null,
        };
    }
    catch (error) {
        console.error("Error in removeMediaFromS3Bucket:", error);
        return { status: false, file_name: null };
    }
});
exports.removeMediaFromS3Bucket = removeMediaFromS3Bucket;
var client_s3_1 = require("@aws-sdk/client-s3");
Object.defineProperty(exports, "ObjectCannedACL", { enumerable: true, get: function () { return client_s3_1.ObjectCannedACL; } });
