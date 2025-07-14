import express from "express";
const admin_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();
import { userAuth } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";

import {
  allPetList,
  petDetail,
  petFavoritesUsers,
} from "./../../../controller/admin/v1/pet_detail.controller";

import {
  allPetListDto,
  petDetailDto,
  petFavoritesUsersDto,
} from "../../../dto/admin/v1/pet_detail_dto";

admin_router.post(
  "/all_pet_list",
  userAuth,
  multipartMiddleware,
  validateRequest(allPetListDto),
  allPetList,
);
admin_router.post(
  "/pet_detail",
  userAuth,
  multipartMiddleware,
  validateRequest(petDetailDto),
  petDetail,
);
admin_router.post(
  "/pet_favorites_user",
  userAuth,
  multipartMiddleware,
  validateRequest(petFavoritesUsersDto),
  petFavoritesUsers,
);

export default admin_router;
