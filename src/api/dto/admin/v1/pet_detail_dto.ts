import joi from "joi";

export const allPetListDto = joi.object().keys({
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

export const petDetailDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  ln: joi.string().allow().label("Ln"),
});

export const petFavoritesUsersDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});
