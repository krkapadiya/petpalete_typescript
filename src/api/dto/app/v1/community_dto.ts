import joi from "joi";

export const addCommunityDto = joi.object().keys({
  title: joi.string().allow().label("Title name"),
  location: joi.string().allow().label("Location"),
  address: joi.string().allow().label("Address"),
  description: joi.string().allow().label("Description"),
  ln: joi.string().allow().label("Ln"),
});

export const editCommunityDto = joi.object().keys({
  community_id: joi.string().allow().label("Community id"),
  title: joi.string().allow().label("Title name"),
  location: joi.string().allow().label("Location"),
  address: joi.string().allow().label("Address"),
  description: joi.string().allow().label("Description"),
  ln: joi.string().allow().label("Ln"),
});

export const deleteCommunityDto = joi.object().keys({
  community_id: joi.string().allow().label("Community id"),
  ln: joi.string().allow().label("Ln"),
});

export const uploadCommunityMediaDto = joi.object().keys({
  community_id: joi.string().allow().label("Community id"),
  album_type: joi.allow().label("Album type"),
  ln: joi.string().allow().label("Ln"),
});

export const removeCommunityMediaDto = joi.object().keys({
  album_id: joi.string().allow().label("Album id"),
  ln: joi.string().allow().label("Ln"),
});

export const communityDetailsDto = joi.object().keys({
  community_id: joi.string().allow().label("Community id"),
  ln: joi.string().allow().label("Ln"),
});

export const communityUpdatedDataDto = joi.object().keys({
  community_id: joi.string().allow().label("Community id"),
  ln: joi.string().allow().label("Ln"),
});

export const communityListingDto = joi.object().keys({
  search: joi.string().allow().label("Search"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  lat: joi.allow().label("Lat"),
  long: joi.allow().label("Long"),
  ln: joi.string().allow().label("Ln"),
});

export const guestCommunityListingDto = joi.object().keys({
  search: joi.string().allow().label("Search"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  lat: joi.allow().label("Lat"),
  long: joi.allow().label("Long"),
  ln: joi.string().allow().label("Ln"),
});

export const userCommunityListingDto = joi.object().keys({
  profile_user_id: joi.string().allow().label("Profile user id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});
