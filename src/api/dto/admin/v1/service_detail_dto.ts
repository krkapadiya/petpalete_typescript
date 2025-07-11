import joi from "joi";

export const allServiceListDto = joi.object().keys({
  search: joi.string().allow().label("Search"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  lat: joi.allow().label("Lat"),
  long: joi.allow().label("Long"),
  ln: joi.string().allow().label("Ln"),
});

export const serviceDetailDto = joi.object().keys({
  service_id: joi.string().allow().label("Service id"),
  ln: joi.string().allow().label("Ln"),
});

export const serviceFavoritesUsersDto = joi.object().keys({
  service_id: joi.string().allow().label("Service id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});
