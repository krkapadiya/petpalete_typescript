import express from "express";
const app_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

import { validateRequest } from "../../../middlewares/validation";
import { userAuth } from "../../../middlewares/auth";
import { IUserRequest } from "../../../controller/app/v1/community.controller";

import {
  addCommunity,
  addMultipleServices,
  editCommunity,
  deleteCommunity,
  uploadCommunityMedia,
  removeCommunityMedia,
  communityDetails,
  communityUpdatedData,
  communityListing,
  guestCommunityListing,
  userCommunityListing,
} from "../../../controller/app/v1/community.controller";

import {
  addCommunityDto,
  editCommunityDto,
  deleteCommunityDto,
  uploadCommunityMediaDto,
  removeCommunityMediaDto,
  communityDetailsDto,
  communityUpdatedDataDto,
  communityListingDto,
  guestCommunityListingDto,
  userCommunityListingDto,
} from "../../../dto/app/v1/community_dto";

app_router.post(
  "/add-community",
  userAuth,
  multipartMiddleware,
  validateRequest(addCommunityDto),
  (req, res) => addCommunity(req as IUserRequest, res),
);
app_router.post(
  "/add_multiple_community",
  userAuth,
  multipartMiddleware,
  (req, res) => addMultipleServices(req as IUserRequest, res),
);
app_router.post(
  "/edit_community",
  userAuth,
  multipartMiddleware,
  validateRequest(editCommunityDto),
  (req, res) => editCommunity(req as IUserRequest, res),
);
app_router.post(
  "/delete_community",
  userAuth,
  multipartMiddleware,
  validateRequest(deleteCommunityDto),
  (req, res) => deleteCommunity(req as IUserRequest, res),
);
app_router.post(
  "/upload_community_media",
  userAuth,
  multipartMiddleware,
  validateRequest(uploadCommunityMediaDto),
  (req, res) => uploadCommunityMedia(req as IUserRequest, res),
);
app_router.post(
  "/remove_community_media",
  userAuth,
  multipartMiddleware,
  validateRequest(removeCommunityMediaDto),
  (req, res) => removeCommunityMedia(req as IUserRequest, res),
);
app_router.post(
  "/community_detail",
  userAuth,
  multipartMiddleware,
  validateRequest(communityDetailsDto),
  communityDetails,
);
app_router.post(
  "/get_community_data",
  userAuth,
  multipartMiddleware,
  validateRequest(communityUpdatedDataDto),
  communityUpdatedData,
);
app_router.post(
  "/community_list",
  userAuth,
  multipartMiddleware,
  validateRequest(communityListingDto),
  (req, res) => communityListing(req as IUserRequest, res),
);
app_router.post(
  "/guest_community_list",
  multipartMiddleware,
  validateRequest(guestCommunityListingDto),
  guestCommunityListing,
);
app_router.post(
  "/user_community_list",
  multipartMiddleware,
  validateRequest(userCommunityListingDto),
  userCommunityListing,
);

export default app_router;
