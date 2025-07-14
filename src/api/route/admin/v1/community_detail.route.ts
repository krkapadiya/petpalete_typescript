import express from "express";
const admin_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();
import { userAuth } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";

import {
  allCommunityList,
  communityDetail,
} from "./../../../controller/admin/v1/community_detail.controller";

import {
  allCommunityListDto,
  communityDetailDto,
} from "../../../dto/admin/v1/community_detail_dto";

admin_router.post(
  "/all_community_list",
  userAuth,
  multipartMiddleware,
  validateRequest(allCommunityListDto),
  allCommunityList,
);
admin_router.post(
  "/community_detail",
  userAuth,
  multipartMiddleware,
  validateRequest(communityDetailDto),
  communityDetail,
);

export default admin_router;
