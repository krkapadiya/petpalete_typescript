import joi from "joi";

export const addServiceDto = joi.object().keys({
  service_name: joi.string().allow().label("Service name"),
  location: joi.string().allow().label("Location"),
  address: joi.string().allow().label("Address"),
  price: joi.string().allow().label("Price"),
  description: joi.string().allow().label("Description"),
  ln: joi.string().allow().label("Ln"),
});

export const editServiceDto = joi.object().keys({
  service_id: joi.string().allow().label("Service id"),
  service_name: joi.string().allow().label("Service name"),
  location: joi.string().allow().label("Location"),
  address: joi.string().allow().label("Address"),
  price: joi.string().allow().label("Price"),
  description: joi.string().allow().label("Description"),
  ln: joi.string().allow().label("Ln"),
});

export const deleteServiceDto = joi.object().keys({
  service_id: joi.string().allow().label("Service id"),
  ln: joi.string().allow().label("Ln"),
});

export const likeDislikeServicesDto = joi.object().keys({
  service_id: joi.string().allow().label("Service id"),
  is_like: joi.string().allow().label("Is like"),
  ln: joi.string().allow().label("Ln"),
});

export const uploadServiceMediaDto = joi.object().keys({
  service_id: joi.string().allow().label("Service id"),
  album_type: joi.allow().label("Album type"),
  ln: joi.string().allow().label("Ln"),
});

export const removeServiceMediaDto = joi.object().keys({
  album_id: joi.string().allow().label("Album id"),
  ln: joi.string().allow().label("Ln"),
});

export const serviceDetailsDto = joi.object().keys({
  service_id: joi.string().allow().label("Service id"),
  ln: joi.string().allow().label("Ln"),
});

export const guestServiceDetailsDto = joi.object().keys({
  service_id: joi.string().allow().label("Service id"),
  ln: joi.string().allow().label("Ln"),
});

export const serviceUpdatedDataDto = joi.object().keys({
  service_id: joi.string().allow().label("Service id"),
  ln: joi.string().allow().label("Ln"),
});

export const serviceListingDto = joi.object().keys({
  search: joi.string().allow().label("Search"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  lat: joi.allow().label("Lat"),
  long: joi.allow().label("Long"),
  ln: joi.string().allow().label("Ln"),
});

export const guestServiceListingDto = joi.object().keys({
  search: joi.string().allow().label("Search"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  lat: joi.allow().label("Lat"),
  long: joi.allow().label("Long"),
  ln: joi.string().allow().label("Ln"),
});

export const serviceFavoriteListDto = joi.object().keys({
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const userServiceListingDto = joi.object().keys({
  profile_user_id: joi.string().allow().label("Profile user id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});
