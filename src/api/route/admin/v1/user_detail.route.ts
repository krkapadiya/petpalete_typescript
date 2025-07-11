import express from "express";
const admin_router = express.Router();
const multipartMiddleware = require("connect-multiparty")();
import { userAuth } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";

import {
  allUserList,
  userDetails,
  blockUnblockUser,
  userPets,
  userPetFavorites,
  userServices,
  userServiceFavorites,
  userCommunities,
  userReviews,
  paymentList,
  allPayments,
} from "./../../../controller/admin/v1/user_detail.controller";

import {
  allUserListDto,
  userDetailsDto,
  blockUnblockUserDto,
  userPetsDto,
  userPetFavoritesDto,
  userServicesDto,
  userServiceFavoritesDto,
  userCommunitiesDto,
  userReviewsDto,
  paymentListDto,
  allPaymentsDto,
} from "../../../dto/admin/v1/user_detail_dto";

admin_router.post(
  "/all_user_list",
  userAuth,
  multipartMiddleware,
  validateRequest(allUserListDto),
  allUserList,
);

admin_router.post(
  "/user_detail",
  userAuth,
  multipartMiddleware,
  validateRequest(userDetailsDto),
  userDetails,
);
admin_router.post(
  "/block_unblock_user",
  userAuth,
  multipartMiddleware,
  validateRequest(blockUnblockUserDto),
  blockUnblockUser,
);
admin_router.post(
  "/user_pets",
  userAuth,
  multipartMiddleware,
  validateRequest(userPetsDto),
  userPets,
);
admin_router.post(
  "/user_pets_favorites",
  userAuth,
  multipartMiddleware,
  validateRequest(userPetFavoritesDto),
  userPetFavorites,
);
admin_router.post(
  "/user_services",
  userAuth,
  multipartMiddleware,
  validateRequest(userServicesDto),
  userServices,
);
admin_router.post(
  "/user_services_favorites",
  userAuth,
  multipartMiddleware,
  validateRequest(userServiceFavoritesDto),
  userServiceFavorites,
);
admin_router.post(
  "/user_communities",
  userAuth,
  multipartMiddleware,
  validateRequest(userCommunitiesDto),
  userCommunities,
);
admin_router.post(
  "/user_reviews",
  userAuth,
  multipartMiddleware,
  validateRequest(userReviewsDto),
  userReviews,
);
admin_router.post(
  "/user_payment_list",
  userAuth,
  multipartMiddleware,
  validateRequest(paymentListDto),
  paymentList,
);
admin_router.post(
  "/all_payments",
  userAuth,
  multipartMiddleware,
  validateRequest(allPaymentsDto),
  allPayments,
);

export default admin_router;
