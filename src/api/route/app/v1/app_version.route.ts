import express from "express";
const app_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

import { validateRequest } from "../../../middlewares/validation";

import {
  addAppVersion,
  appVersionCheck,
} from "../../../controller/app/v1/app_version.controller";

import {
  addAppVersionDto,
  appVersionCheckDto,
} from "../../../dto/app/v1/app_version_dto";

app_router.post(
  "/add_app_version",
  multipartMiddleware,
  validateRequest(addAppVersionDto),
  addAppVersion,
);
app_router.post(
  "/update_app_version",
  multipartMiddleware,
  validateRequest(appVersionCheckDto),
  appVersionCheck,
);

export default app_router;
