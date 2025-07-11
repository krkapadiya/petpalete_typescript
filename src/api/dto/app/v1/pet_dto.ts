import joi from "joi";

export const addPetDto = joi.object().keys({
  pet_name: joi.string().allow().label("Pet name"),
  pet_type: joi.string().allow().label("Pet type"),
  pet_breed: joi.string().allow().label("Pet breed"),
  location: joi.string().allow().label("Location"),
  address: joi.string().allow().label("Address"),
  gender: joi.string().allow().label("Gender"),
  price: joi.string().allow().label("Price"),
  description: joi.string().allow().label("Description"),
  ln: joi.string().allow().label("Ln"),
});

export const editPetDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  pet_name: joi.string().allow().label("Pet name"),
  pet_type: joi.string().allow().label("Pet type"),
  pet_breed: joi.string().allow().label("Pet breed"),
  location: joi.string().allow().label("Location"),
  address: joi.string().allow().label("Address"),
  gender: joi.string().allow().label("Gender"),
  price: joi.string().allow().label("Price"),
  description: joi.string().allow().label("Description"),
  ln: joi.string().allow().label("Ln"),
});

export const deletePetDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  ln: joi.string().allow().label("Ln"),
});

export const adoptPetDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  is_adopted: joi.string().allow().label("Is adopted"),
  ln: joi.string().allow().label("Ln"),
});

export const likeDislikePetsDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  is_like: joi.string().allow().label("Is like"),
  ln: joi.string().allow().label("Ln"),
});

export const uploadPetMediaDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  album_type: joi.allow().label("Album type"),
  ln: joi.string().allow().label("Ln"),
});

export const removePetMediaDto = joi.object().keys({
  album_id: joi.string().allow().label("Album id"),
  ln: joi.string().allow().label("Ln"),
});

export const petDetailsDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  ln: joi.string().allow().label("Ln"),
});

export const guestPetDetailsDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  ln: joi.string().allow().label("Ln"),
});

export const petUpdatedDataDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  ln: joi.string().allow().label("Ln"),
});

export const petListingDto = joi.object().keys({
  search: joi.string().allow().label("Search"),
  pet_type: joi.string().allow().label("Pet type"),
  pet_breed: joi.string().allow().label("Pet breed"),
  gender: joi.string().allow().label("gender"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  lat: joi.allow().label("Lat"),
  long: joi.allow().label("Long"),
  ln: joi.string().allow().label("Ln"),
});

export const guestPetListingDto = joi.object().keys({
  search: joi.string().allow().label("Search"),
  pet_type: joi.string().allow().label("Pet type"),
  pet_breed: joi.string().allow().label("Pet breed"),
  gender: joi.string().allow().label("gender"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  lat: joi.allow().label("Lat"),
  long: joi.allow().label("Long"),
  ln: joi.string().allow().label("Ln"),
});

export const petFavoriteListDto = joi.object().keys({
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const userPetListingDto = joi.object().keys({
  profile_user_id: joi.string().allow().label("Profile user id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const guestUserPetListingDto = joi.object().keys({
  profile_user_id: joi.string().allow().label("Profile user id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});
