import express from "express";
const app_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

import { userAuth } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";
import { IUserRequest } from "./../../../controller/app/v1/pet.controller";

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
  (req, res) => addPet(req as IUserRequest, res),
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
  (req, res) => editPet(req as IUserRequest, res),
);
app_router.post(
  "/delete_pet",
  userAuth,
  multipartMiddleware,
  validateRequest(deletePetDto),
  (req, res) => deletePet(req as IUserRequest, res),
);
app_router.post(
  "/adopt_pet",
  userAuth,
  multipartMiddleware,
  validateRequest(adoptPetDto),
  (req, res) => adoptPet(req as IUserRequest, res),
);
app_router.post(
  "/like_dislike_pet",
  userAuth,
  multipartMiddleware,
  validateRequest(likeDislikePetsDto),
  (req, res) => likeDislikePets(req as IUserRequest, res),
);
app_router.post(
  "/upload_pet_media",
  userAuth,
  multipartMiddleware,
  validateRequest(uploadPetMediaDto),
  (req, res) => uploadPetMedia(req as IUserRequest, res),
);
app_router.post(
  "/remove_pet_media",
  userAuth,
  multipartMiddleware,
  validateRequest(removePetMediaDto),
  (req, res) => removePetMedia(req as IUserRequest, res),
);
app_router.post(
  "/pet_detail",
  userAuth,
  multipartMiddleware,
  validateRequest(petDetailsDto),
  (req, res) => petDetails(req as IUserRequest, res),
);
app_router.post(
  "/guest_pet_detail",
  multipartMiddleware,
  validateRequest(guestPetDetailsDto),
  (req, res) => guestPetDetails(req as IUserRequest, res),
);
app_router.post(
  "/get_pet_data",
  userAuth,
  multipartMiddleware,
  validateRequest(petUpdatedDataDto),
  (req, res) => petUpdatedData(req as IUserRequest, res),
);
app_router.post(
  "/pet_list",
  userAuth,
  multipartMiddleware,
  validateRequest(petListingDto),
  (req, res) => petListing(req as IUserRequest, res),
);
app_router.post(
  "/guest_pet_list",
  multipartMiddleware,
  validateRequest(guestPetListingDto),
  (req, res) => guestPetListing(req as IUserRequest, res),
);
app_router.post(
  "/pet_favorite_list",
  userAuth,
  multipartMiddleware,
  validateRequest(petFavoriteListDto),
  (req, res) => petFavoriteList(req as IUserRequest, res),
);
app_router.post(
  "/user_pet_list",
  userAuth,
  multipartMiddleware,
  validateRequest(userPetListingDto),
  (req, res) => userPetListing(req as IUserRequest, res),
);
app_router.post(
  "/guest_user_pet_list",
  multipartMiddleware,
  validateRequest(guestUserPetListingDto),
  (req, res) => guestUserPetListing(req as IUserRequest, res),
);

export default app_router;
