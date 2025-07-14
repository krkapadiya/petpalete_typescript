import express from "express";
const admin_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();
import { userAuth } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";

import {
  addContent,
  editContent,
  deleteContent,
  getContent,
} from "../../../controller/admin/v1/app_content.controller";

import {
  addContentDto,
  editContentDto,
  deleteContentDto,
  getContentDto,
} from "../../../dto/admin/v1/app_content_dto";

admin_router.post(
  "/add_content",
  userAuth,
  multipartMiddleware,
  validateRequest(addContentDto),
  addContent,
);
admin_router.post(
  "/edit_content",
  userAuth,
  multipartMiddleware,
  validateRequest(editContentDto),
  editContent,
);
admin_router.post(
  "/delete_content",
  userAuth,
  multipartMiddleware,
  validateRequest(deleteContentDto),
  deleteContent,
);
admin_router.post(
  "/get_content",
  userAuth,
  multipartMiddleware,
  validateRequest(getContentDto),
  getContent,
);

export default admin_router;
