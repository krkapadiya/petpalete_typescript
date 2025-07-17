import express from "express";
const service_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();
import { validateRequest } from "../../../middlewares/validation";
import { userAuth } from "../../../middlewares/auth";
import { IUserRequest } from "../../../controller/app/v1/service.controller";

import {
  addService,
  addMultipleServices,
  editService,
  deleteService,
  likeDislikeServices,
  uploadServiceMedia,
  removeServiceMedia,
  serviceDetails,
  guestServiceDetails,
  serviceUpdatedData,
  serviceListing,
  guestServiceListing,
  serviceFavoriteList,
  userServiceListing,
  guestUserServiceList,
} from "../../../controller/app/v1/service.controller";

import {
  addServiceDto,
  editServiceDto,
  deleteServiceDto,
  likeDislikeServicesDto,
  uploadServiceMediaDto,
  removeServiceMediaDto,
  serviceDetailsDto,
  guestServiceDetailsDto,
  serviceUpdatedDataDto,
  serviceListingDto,
  guestServiceListingDto,
  serviceFavoriteListDto,
  userServiceListingDto,
} from "./../../../dto/app/v1/service_dto";

service_router.post(
  "/add_service",
  userAuth,
  multipartMiddleware,
  validateRequest(addServiceDto),
  (req, res) => addService(req as IUserRequest, res),
);
service_router.post(
  "/add_multiple_service",
  userAuth,
  multipartMiddleware,
  addMultipleServices,
);
service_router.post(
  "/edit_service",
  userAuth,
  multipartMiddleware,
  validateRequest(editServiceDto),
  editService,
);
service_router.post(
  "/delete_service",
  userAuth,
  multipartMiddleware,
  validateRequest(deleteServiceDto),
  deleteService,
);
service_router.post(
  "/like_dislike_service",
  userAuth,
  multipartMiddleware,
  validateRequest(likeDislikeServicesDto),
  likeDislikeServices,
);
service_router.post(
  "/upload_service_media",
  userAuth,
  multipartMiddleware,
  validateRequest(uploadServiceMediaDto),
  (req, res) => uploadServiceMedia(req as IUserRequest, res),
);
service_router.post(
  "/remove_service_media",
  userAuth,
  multipartMiddleware,
  validateRequest(removeServiceMediaDto),
  removeServiceMedia,
);
service_router.post(
  "/service_detail",
  userAuth,
  multipartMiddleware,
  validateRequest(serviceDetailsDto),
  serviceDetails,
);
service_router.post(
  "/guest_service_detail",
  multipartMiddleware,
  validateRequest(guestServiceDetailsDto),
  guestServiceDetails,
);
service_router.post(
  "/get_service_data",
  userAuth,
  multipartMiddleware,
  validateRequest(serviceUpdatedDataDto),
  serviceUpdatedData,
);
service_router.post(
  "/service_list",
  userAuth,
  multipartMiddleware,
  validateRequest(serviceListingDto),
  serviceListing,
);
service_router.post(
  "/guest_service_list",
  multipartMiddleware,
  validateRequest(guestServiceListingDto),
  guestServiceListing,
);
service_router.post(
  "/service_favorite_list",
  userAuth,
  multipartMiddleware,
  validateRequest(serviceFavoriteListDto),
  serviceFavoriteList,
);
service_router.post(
  "/user_service_list",
  userAuth,
  multipartMiddleware,
  validateRequest(userServiceListingDto),
  userServiceListing,
);
service_router.post(
  "/guest_user_service_list",
  multipartMiddleware,
  validateRequest(userServiceListingDto),
  guestUserServiceList,
);

export default service_router;
