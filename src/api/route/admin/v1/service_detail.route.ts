import express from "express";
const admin_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();
import { userAuth } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";

import {
  allServiceList,
  serviceDetail,
  serviceFavoritesUsers,
} from "./../../../controller/admin/v1/service_detail.controller";

import {
  allServiceListDto,
  serviceDetailDto,
  serviceFavoritesUsersDto,
} from "../../../dto/admin/v1/service_detail_dto";

admin_router.post(
  "/all_service_list",
  userAuth,
  multipartMiddleware,
  validateRequest(allServiceListDto),
  allServiceList,
);
admin_router.post(
  "/service_detail",
  userAuth,
  multipartMiddleware,
  validateRequest(serviceDetailDto),
  serviceDetail,
);
admin_router.post(
  "/service_favorites_user",
  userAuth,
  multipartMiddleware,
  validateRequest(serviceFavoritesUsersDto),
  serviceFavoritesUsers,
);

export default admin_router;
