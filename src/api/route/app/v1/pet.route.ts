import express from "express";
const app_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

import { userAuth } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";

import {
  addPet,
  addMultiplePet,
  editPet,
  deletePet,
  adoptPet,
  likeDislikePets,
  uploadPetMedia,
  removePetMedia,
  petDetails,
  guestPetDetails,
  petUpdatedData,
  petListing,
  guestPetListing,
  petFavoriteList,
  userPetListing,
  guestUserPetListing,
} from "../../../controller/app/v1/pet.controller";

import {
  addPetDto,
  editPetDto,
  deletePetDto,
  adoptPetDto,
  likeDislikePetsDto,
  uploadPetMediaDto,
  removePetMediaDto,
  petDetailsDto,
  guestPetDetailsDto,
  petUpdatedDataDto,
  petListingDto,
  guestPetListingDto,
  petFavoriteListDto,
  userPetListingDto,
  guestUserPetListingDto,
} from "../../../dto/app/v1/pet_dto";

app_router.post(
  "/add_pet",
  userAuth,
  multipartMiddleware,
  validateRequest(addPetDto),
  addPet,
);
app_router.post(
  "/add_multiple_pet",
  userAuth,
  multipartMiddleware,
  addMultiplePet,
);
app_router.post(
  "/edit_pet",
  userAuth,
  multipartMiddleware,
  validateRequest(editPetDto),
  editPet,
);
app_router.post(
  "/delete_pet",
  userAuth,
  multipartMiddleware,
  validateRequest(deletePetDto),
  deletePet,
);
app_router.post(
  "/adopt_pet",
  userAuth,
  multipartMiddleware,
  validateRequest(adoptPetDto),
  adoptPet,
);
app_router.post(
  "/like_dislike_pet",
  userAuth,
  multipartMiddleware,
  validateRequest(likeDislikePetsDto),
  likeDislikePets,
);
app_router.post(
  "/upload_pet_media",
  userAuth,
  multipartMiddleware,
  validateRequest(uploadPetMediaDto),
  uploadPetMedia,
);
app_router.post(
  "/remove_pet_media",
  userAuth,
  multipartMiddleware,
  validateRequest(removePetMediaDto),
  removePetMedia,
);
app_router.post(
  "/pet_detail",
  userAuth,
  multipartMiddleware,
  validateRequest(petDetailsDto),
  petDetails,
);
app_router.post(
  "/guest_pet_detail",
  multipartMiddleware,
  validateRequest(guestPetDetailsDto),
  guestPetDetails,
);
app_router.post(
  "/get_pet_data",
  userAuth,
  multipartMiddleware,
  validateRequest(petUpdatedDataDto),
  petUpdatedData,
);
app_router.post(
  "/pet_list",
  userAuth,
  multipartMiddleware,
  validateRequest(petListingDto),
  petListing,
);
app_router.post(
  "/guest_pet_list",
  multipartMiddleware,
  validateRequest(guestPetListingDto),
  guestPetListing,
);
app_router.post(
  "/pet_favorite_list",
  userAuth,
  multipartMiddleware,
  validateRequest(petFavoriteListDto),
  petFavoriteList,
);
app_router.post(
  "/user_pet_list",
  userAuth,
  multipartMiddleware,
  validateRequest(userPetListingDto),
  userPetListing,
);
app_router.post(
  "/guest_user_pet_list",
  multipartMiddleware,
  validateRequest(guestUserPetListingDto),
  guestUserPetListing,
);

export default app_router;
